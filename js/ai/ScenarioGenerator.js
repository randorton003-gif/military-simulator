/**
 * ScenarioGenerator — uses local Qwen (Ollama) for tactical placement.
 * Falls back to keyword engine if Ollama is offline.
 *
 * The AI decides:
 *  - Map center (lat/lng/zoom)
 *  - Which units to deploy
 *  - Best positions relative to a present enemy force
 *  - Waypoints for mobile units
 */

const SCENARIO_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    center: {
      type: "object",
      properties: {
        lat: { type: "number" },
        lng: { type: "number" },
        zoom: { type: "number" },
        name: { type: "string" }
      },
      required: ["lat", "lng", "zoom", "name"]
    },
    units: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          name: { type: "string" },
          side: { type: "string" },
          lat: { type: "number" },
          lng: { type: "number" },
          notes: { type: "string" },
          waypoints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lat: { type: "number" },
                lng: { type: "number" }
              },
              required: ["lat", "lng"]
            }
          }
        },
        required: ["type", "name", "side", "lat", "lng"]
      }
    },
    reasoning: { type: "string" }
  },
  required: ["title", "summary", "center", "units"]
};

const SYSTEM_PROMPT = `You are a military operations planner AI for a wargame simulation.
Given a user scenario description, produce a realistic tactical deployment as JSON.

Rules:
1. Choose a real-world map center (lat/lng) that fits the scenario. Use real coordinates.
2. Always include BOTH a blue (friendly/defender) and red (enemy/attacker) force when the prompt implies opposition or "against".
3. Place the enemy first conceptually, then position friendly units in the BEST tactical positions relative to that enemy:
   - SAMs and radars on high ground / behind the FEBA covering approaches
   - Tanks and APCs in hull-down or blocking positions
   - Infantry holding key terrain
   - Aircraft orbiting or on CAP between forces
   - HQ set back from the front line
4. Use only these unit types: tank, infantry, artillery, apc, fighter, bomber, helicopter, uav, destroyer, frigate, carrier, submarine, sam, shorad, radar, ciws, airbase, hq, depot, port
5. side must be "blue" or "red".
6. Keep total units between 8 and 22.
7. For mobile units (everything except sam, shorad, radar, ciws, airbase, hq, depot, port) optionally add 1-2 waypoints showing intended movement toward or against the enemy.
8. Coordinates must be near the center (within ~0.15 degrees).
9. Return ONLY valid JSON matching the schema. No markdown, no commentary outside JSON.

Example coordinate references:
- Kyiv area: 50.45, 30.52
- Taiwan Strait: 24.5, 119.5
- Black Sea: 43.0, 34.0
- Baghdad: 33.32, 44.37
- Seoul: 37.57, 126.98`;

const ScenarioGenerator = {
  /**
   * @param {string} prompt
   * @param {{ onStatus?: (msg:string) => void }} [opts]
   * @returns {Promise<{title,summary,center,units:BaseUnit[],log:string[],reasoning?:string}>}
   */
  async generate(prompt, opts = {}) {
    const status = opts.onStatus || (() => {});
    const text = (prompt || "").trim();

    if (!text) {
      return this._empty();
    }

    status("Checking local AI (Ollama)…");
    const available = await OllamaClient.isAvailable();

    if (available) {
      try {
        status(`Querying ${OllamaClient.model} for tactical placement…`);
        const raw = await OllamaClient.chatJSON(
          SYSTEM_PROMPT,
          `Scenario: ${text}\n\nProduce the deployment JSON.`,
          SCENARIO_SCHEMA
        );
        status("AI response received. Building units…");
        return this._fromAI(raw, text);
      } catch (err) {
        console.warn("[ScenarioGenerator] Ollama failed, falling back:", err);
        status(`AI error: ${err.message}. Using fallback engine…`);
        return this._fallback(text, [`Ollama error: ${err.message}`, "Fell back to keyword engine."]);
      }
    }

    status("Ollama not reachable — using fallback engine.");
    return this._fallback(text, ["Ollama offline. Used keyword fallback."]);
  },

  _fromAI(raw, originalPrompt) {
    const log = [];
    log.push(`AI model: ${OllamaClient.model}`);
    log.push(`Prompt: "${originalPrompt.slice(0, 90)}${originalPrompt.length > 90 ? "…" : ""}"`);

    const center = raw.center || { lat: 50.45, lng: 30.52, zoom: 10, name: "AO" };
    if (!center.zoom) center.zoom = 10;

    log.push(`Location → ${center.name} (${Number(center.lat).toFixed(3)}, ${Number(center.lng).toFixed(3)})`);

    const units = [];
    const list = Array.isArray(raw.units) ? raw.units : [];

    list.forEach((u, i) => {
      const type = (u.type || "infantry").toLowerCase();
      const side = (u.side || "blue").toLowerCase() === "red" ? SIDES.RED : SIDES.BLUE;

      const unit = UnitFactory.create(type, {
        side,
        lat: Number(u.lat) || center.lat,
        lng: Number(u.lng) || center.lng,
        name: u.name || `${side.toUpperCase()} ${capitalize(type)}-${i + 1}`,
        notes: u.notes || "AI-placed"
      });

      if (Array.isArray(u.waypoints) && u.waypoints.length && unit.speed > 0) {
        unit.setWaypoints(
          u.waypoints.map(w => ({
            lat: Number(w.lat),
            lng: Number(w.lng)
          }))
        );
      }

      units.push(unit);
    });

    // Guarantee at least one HQ if AI forgot
    if (!units.some(u => u.type === "hq")) {
      units.push(UnitFactory.create("hq", {
        side: SIDES.BLUE,
        lat: center.lat,
        lng: center.lng,
        name: "BLUE HQ",
        notes: "Command node"
      }));
    }

    log.push(`AI deployed ${units.length} units`);
    if (raw.reasoning) log.push(`Reasoning: ${raw.reasoning.slice(0, 160)}`);

    return {
      title: raw.title || `Operation — ${center.name}`,
      summary: raw.summary || `${units.length} units (AI-placed)`,
      center,
      units,
      log,
      reasoning: raw.reasoning || ""
    };
  },

  _fallback(text, extraLog = []) {
    const lower = text.toLowerCase();
    const log = [...extraLog];
    log.push(`Prompt: "${text.slice(0, 90)}${text.length > 90 ? "…" : ""}"`);

    let center = { lat: 50.45, lng: 30.52, zoom: 10, name: "Operational Area" };
    for (const [key, loc] of Object.entries(LOCATIONS)) {
      if (lower.includes(key)) {
        center = { ...loc };
        break;
      }
    }
    log.push(`Location → ${center.name}`);

    const sides = [];
    if (lower.includes("blue") || lower.includes("friendly") || lower.includes("defender")) sides.push(SIDES.BLUE);
    if (lower.includes("red") || lower.includes("enemy") || lower.includes("hostile") || lower.includes("attacker")) sides.push(SIDES.RED);
    if (sides.length === 0) sides.push(SIDES.BLUE);
    if (sides.length === 1 && (lower.includes("vs") || lower.includes("against") || lower.includes("versus"))) {
      sides.push(sides[0] === SIDES.BLUE ? SIDES.RED : SIDES.BLUE);
    }

    // Place enemy first, then friendlies relative to them
    const enemySide = sides.includes(SIDES.RED) ? SIDES.RED : null;
    const friendlySide = sides.includes(SIDES.BLUE) ? SIDES.BLUE : sides[0];

    const allTypes = UnitFactory.availableTypes();
    let requested = allTypes.filter(t => lower.includes(t));
    if (lower.includes("air defense") || lower.includes("sam") || lower.includes("aa")) {
      ["sam", "shorad", "radar"].forEach(t => { if (!requested.includes(t)) requested.push(t); });
    }
    if (lower.includes("armor") || lower.includes("mechanized")) {
      ["tank", "apc"].forEach(t => { if (!requested.includes(t)) requested.push(t); });
    }
    if (lower.includes("air") || lower.includes("fighter")) {
      ["fighter", "helicopter"].forEach(t => { if (!requested.includes(t)) requested.push(t); });
    }
    if (requested.length === 0) requested = ["tank", "infantry", "artillery", "sam"];

    const units = [];
    const enemyAnchor = {
      lat: center.lat + 0.04,
      lng: center.lng + 0.06
    };

    // Enemy block (if present)
    if (enemySide) {
      const enemyTypes = requested.slice(0, Math.max(2, Math.ceil(requested.length / 2)));
      enemyTypes.forEach((type, i) => {
        const lat = enemyAnchor.lat + randomOffset(0.03);
        const lng = enemyAnchor.lng + randomOffset(0.04);
        const u = UnitFactory.create(type, {
          side: enemySide,
          lat, lng,
          name: `RED ${capitalize(type)}-${i + 1}`,
          notes: "Enemy force (fallback)"
        });
        if (u.speed > 0) {
          u.setWaypoints([
            { lat: lat - 0.025, lng: lng - 0.03 },
            { lat: lat - 0.05, lng: lng - 0.055 }
          ]);
        }
        units.push(u);
      });
      log.push("Enemy force placed first (anchor)");
    }

    // Friendly block — positioned to defend / block enemy approach
    requested.forEach((type, i) => {
      // Prefer positions southwest of enemy (classic defensive offset)
      const lat = (enemySide ? enemyAnchor.lat - 0.05 : center.lat) + randomOffset(0.03);
      const lng = (enemySide ? enemyAnchor.lng - 0.06 : center.lng) + randomOffset(0.04);
      const u = UnitFactory.create(type, {
        side: friendlySide,
        lat, lng,
        name: `${friendlySide.toUpperCase()} ${capitalize(type)}-${i + 1}`,
        notes: enemySide ? "Positioned relative to enemy" : "Deployed"
      });
      if (u.speed > 0) {
        u.setWaypoints([
          { lat: lat + 0.02, lng: lng + 0.025 },
          { lat: lat + 0.04, lng: lng + 0.05 }
        ]);
      }
      units.push(u);
    });

    units.push(UnitFactory.create("hq", {
      side: friendlySide,
      lat: center.lat - 0.02,
      lng: center.lng - 0.03,
      name: `${friendlySide.toUpperCase()} HQ`,
      notes: "Command node (rear)"
    }));

    log.push(`Fallback deployed ${units.length} units`);

    return {
      title: `Operation — ${center.name}`,
      summary: `${units.length} units · fallback placement`,
      center,
      units,
      log
    };
  },

  _empty() {
    return {
      title: "Empty Prompt",
      summary: "No scenario description provided.",
      center: { lat: 50.45, lng: 30.52, zoom: 10, name: "AO" },
      units: [],
      log: ["Empty prompt received."]
    };
  }
};

window.ScenarioGenerator = ScenarioGenerator;
