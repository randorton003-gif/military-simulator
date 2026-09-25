/**
 * ScenarioGenerator — local Qwen/Ollama with strict prompt-fidelity skill.
 * Only units named in the prompt; start positions; stationed vs waypoints.
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
          stationed: { type: "boolean" },
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
        required: ["type", "name", "side", "lat", "lng", "stationed"]
      }
    },
    reasoning: { type: "string" }
  },
  required: ["title", "summary", "center", "units"]
};

/** Types that are fixed by default unless prompt relocates them */
const DEFAULT_STATIONED_TYPES = new Set([
  "sam", "shorad", "radar", "ciws", "airbase", "hq", "depot", "port"
]);

const ScenarioGenerator = {
  /**
   * @param {string} prompt
   * @param {{ onStatus?: (msg: string) => void }} [opts]
   */
  async generate(prompt, opts = {}) {
    const status = opts.onStatus || (() => {});
    const text = (prompt || "").trim();

    if (!text) return this._empty();

    status("Checking local AI (Ollama)…");
    const available = await OllamaClient.isAvailable();

    if (available) {
      try {
        status(`Querying ${OllamaClient.model} (strict skill)…`);
        const system = buildScenarioSystemPrompt();
        const user =
          `User prompt:\n"""\n${text}\n"""\n\n` +
          `Apply the Scenario Deployment skill.\n` +
          `- Only units named in the prompt.\n` +
          `- Each unit needs start lat/lng.\n` +
          `- stationed:true + empty waypoints if holding/static; else waypoints for movement.\n` +
          `Return JSON only.`;

        const raw = await OllamaClient.chatJSON(system, user, SCENARIO_SCHEMA);
        status("AI response received. Building units…");
        return this._fromAI(raw, text);
      } catch (err) {
        console.warn("[ScenarioGenerator] Ollama failed:", err);
        status(`AI error: ${err.message}. Using strict fallback…`);
        return this._fallback(text, [`Ollama error: ${err.message}`, "Strict keyword fallback."]);
      }
    }

    status("Ollama offline — strict keyword fallback.");
    return this._fallback(text, ["Ollama offline. Strict keyword fallback."]);
  },

  _fromAI(raw, originalPrompt) {
    const log = [];
    log.push(`AI model: ${OllamaClient.model}`);
    log.push(`Skill: strict prompt fidelity (skills.md)`);
    log.push(`Prompt: "${originalPrompt.slice(0, 100)}${originalPrompt.length > 100 ? "…" : ""}"`);

    const center = raw.center || { lat: 50.45, lng: 30.52, zoom: 10, name: "AO" };
    if (!center.zoom) center.zoom = 10;
    log.push(`Location → ${center.name} (${Number(center.lat).toFixed(3)}, ${Number(center.lng).toFixed(3)})`);

    const allowed = new Set(UnitFactory.availableTypes());
    const units = [];
    const list = Array.isArray(raw.units) ? raw.units : [];

    list.forEach((u, i) => {
      const type = (u.type || "").toLowerCase();
      if (!allowed.has(type)) {
        log.push(`Skipped unknown type: ${type}`);
        return;
      }

      const side = (u.side || "blue").toLowerCase() === "red" ? SIDES.RED : SIDES.BLUE;
      const lat = Number(u.lat);
      const lng = Number(u.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        log.push(`Skipped ${type}: missing start coordinates`);
        return;
      }

      const unit = UnitFactory.create(type, {
        side,
        lat,
        lng,
        name: u.name || `${side.toUpperCase()} ${capitalize(type)}-${i + 1}`,
        notes: u.notes || "From prompt"
      });
      unit.setStartPosition(lat, lng);

      const stationed =
        typeof u.stationed === "boolean"
          ? u.stationed
          : DEFAULT_STATIONED_TYPES.has(type);

      if (!stationed && Array.isArray(u.waypoints) && u.waypoints.length && unit.speed > 0) {
        unit.setWaypoints(
          u.waypoints.map(w => ({
            lat: Number(w.lat),
            lng: Number(w.lng)
          })).filter(w => Number.isFinite(w.lat) && Number.isFinite(w.lng))
        );
        log.push(`${unit.name}: moving (${unit.waypoints.length} waypoints)`);
      } else {
        unit.clearWaypoints();
        unit.status = "ready";
        log.push(`${unit.name}: stationed at start`);
      }

      units.push(unit);
    });

    // No auto-HQ or filler units
    log.push(`Deployed ${units.length} units (prompt-only)`);
    if (raw.reasoning) log.push(`Reasoning: ${String(raw.reasoning).slice(0, 200)}`);

    return {
      title: raw.title || `Operation — ${center.name}`,
      summary: raw.summary || `${units.length} units from prompt`,
      center,
      units,
      log,
      reasoning: raw.reasoning || ""
    };
  },

  /**
   * Strict fallback: only types whose names appear in the prompt.
   * No default combined-arms package. No auto HQ.
   */
  _fallback(text, extraLog = []) {
    const lower = text.toLowerCase();
    const log = [...extraLog];
    log.push(`Prompt: "${text.slice(0, 100)}${text.length > 100 ? "…" : ""}"`);
    log.push("Skill: strict prompt fidelity (fallback)");

    let center = { lat: 50.45, lng: 30.52, zoom: 10, name: "Operational Area" };
    for (const [key, loc] of Object.entries(LOCATIONS)) {
      if (lower.includes(key)) {
        center = { ...loc };
        break;
      }
    }
    log.push(`Location → ${center.name}`);

    // Parse sides only if mentioned
    const hasBlue = /\b(blue|friendly|defender|allied)\b/.test(lower);
    const hasRed = /\b(red|enemy|hostile|attacker)\b/.test(lower);

    // Only types literally present in the prompt
    const allTypes = UnitFactory.availableTypes();
    const requested = allTypes.filter(t => {
      const re = new RegExp(`\\b${t}s?\\b`, "i");
      return re.test(lower);
    });

    // Light aliases that still require an explicit phrase
    if (/\bair\s*defense\b|\bsam\s*coverage\b/.test(lower)) {
      ["sam", "shorad"].forEach(t => {
        if (!requested.includes(t) && lower.includes(t)) requested.push(t);
      });
      if (/\bsam\b/.test(lower) && !requested.includes("sam")) requested.push("sam");
    }

    if (requested.length === 0) {
      log.push("No unit types found in prompt — deploying nothing.");
      return {
        title: `Operation — ${center.name}`,
        summary: "No units (none named in prompt)",
        center,
        units: [],
        log
      };
    }

    log.push(`Types from prompt → ${requested.join(", ")}`);

    const wantsMove = /\b(advance|attack|transit|move|patrol|cap|route|waypoint|towards?|toward)\b/.test(lower);
    const wantsStationed = /\b(stationed|hold|holding|defend|defending|garrison|emplaced|fixed|static)\b/.test(lower);

    // Counts: "3 tanks" etc.
    const countFor = (type) => {
      const m = lower.match(new RegExp(`(\\d+)\\s*${type}s?\\b`));
      if (m) return clamp(parseInt(m[1], 10), 1, 12);
      return 1;
    };

    const units = [];
    let seq = 1;

    const placeSide = (side, type, index, total) => {
      const spread = 0.02 * index;
      const sideOff = side === SIDES.RED ? 0.04 : -0.03;
      const lat = center.lat + randomOffset(0.02) + spread * 0.3;
      const lng = center.lng + randomOffset(0.03) + sideOff;

      const u = UnitFactory.create(type, {
        side,
        lat,
        lng,
        name: `${side.toUpperCase()} ${capitalize(type)}-${seq++}`,
        notes: "From prompt (fallback)"
      });
      u.setStartPosition(lat, lng);

      const fixed = DEFAULT_STATIONED_TYPES.has(type);
      const stationed = fixed || (wantsStationed && !wantsMove) || (!wantsMove && !wantsStationed && fixed);

      if (!stationed && u.speed > 0 && wantsMove) {
        const dir = side === SIDES.RED ? -1 : 1;
        u.setWaypoints([
          { lat: lat + dir * 0.03, lng: lng + dir * 0.04 },
          { lat: lat + dir * 0.06, lng: lng + dir * 0.07 }
        ]);
        log.push(`${u.name}: moving`);
      } else {
        u.clearWaypoints();
        log.push(`${u.name}: stationed`);
      }
      units.push(u);
    };

    requested.forEach(type => {
      const n = countFor(type);
      if (hasBlue && hasRed) {
        // Split named types across both sides when both mentioned
        for (let i = 0; i < n; i++) {
          placeSide(i % 2 === 0 ? SIDES.BLUE : SIDES.RED, type, i, n);
        }
      } else if (hasRed && !hasBlue) {
        for (let i = 0; i < n; i++) placeSide(SIDES.RED, type, i, n);
      } else {
        for (let i = 0; i < n; i++) placeSide(SIDES.BLUE, type, i, n);
      }
    });

    log.push(`Deployed ${units.length} units (prompt-only)`);

    return {
      title: `Operation — ${center.name}`,
      summary: `${units.length} units · ${requested.join(", ")}`,
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
