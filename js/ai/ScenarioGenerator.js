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

const DEFAULT_STATIONED_TYPES = new Set([
  "sam", "shorad", "radar", "ciws", "airbase", "hq", "depot", "port"
]);

/** Canonical type list sorted longest-first so "shorad" wins over partial matches */
const TYPE_ALIASES = [
  ["shorad", "shorad"],
  ["helicopter", "helicopter"],
  ["artillery", "artillery"],
  ["infantry", "infantry"],
  ["submarine", "submarine"],
  ["destroyer", "destroyer"],
  ["frigate", "frigate"],
  ["carrier", "carrier"],
  ["fighter", "fighter"],
  ["bomber", "bomber"],
  ["airbase", "airbase"],
  ["depot", "depot"],
  ["radar", "radar"],
  ["ciws", "ciws"],
  ["port", "port"],
  ["tank", "tank"],
  ["tanks", "tank"],
  ["apc", "apc"],
  ["uav", "uav"],
  ["sam", "sam"],
  ["hq", "hq"]
];

/**
 * Parse prompt into discrete unit groups: { type, side, count, stationed, clause }.
 * Handles phrases like "2 blue tanks stationed…" and "2 red tanks advance…".
 */
function parseUnitMentions(text) {
  const lower = text.toLowerCase();
  // Split on semicolons or periods that separate clauses
  const clauses = lower
    .split(/[;.]/)
    .map(c => c.trim())
    .filter(Boolean);

  // Also run whole prompt as one clause so single-sentence prompts still work
  if (clauses.length === 0) clauses.push(lower);

  const groups = [];

  const extractFromClause = (clause) => {
    // Find all type hits in this clause
    for (const [token, type] of TYPE_ALIASES) {
      // number? + optional side words + type (with optional trailing s already in token)
      // Allow words between number and type: "2 blue tanks", "1 blue SAM"
      const re = new RegExp(
        `(\\d+)\\s+(?:(?:blue|red|friendly|enemy|hostile|defender|attacker)\\s+)*${token}\\b`,
        "gi"
      );
      let m;
      let found = false;
      while ((m = re.exec(clause)) !== null) {
        found = true;
        const count = clamp(parseInt(m[1], 10), 1, 12);
        const slice = clause.slice(Math.max(0, m.index - 20), m.index + m[0].length + 40);
        const side = /\b(red|enemy|hostile|attacker)\b/.test(slice)
          ? SIDES.RED
          : /\b(blue|friendly|defender|allied)\b/.test(slice)
            ? SIDES.BLUE
            : SIDES.BLUE;
        const stationed =
          DEFAULT_STATIONED_TYPES.has(type) ||
          /\b(stationed|hold|holding|defend|defending|garrison|emplaced|fixed|static|covering)\b/.test(clause);
        const moving =
          /\b(advance|attack|transit|move|patrol|cap|route|toward|towards|from the)\b/.test(clause);
        groups.push({
          type,
          side,
          count,
          stationed: stationed && !moving ? true : moving ? false : DEFAULT_STATIONED_TYPES.has(type),
          clause
        });
      }
      // Type without leading number → count 1
      if (!found) {
        const re2 = new RegExp(`\\b${token}\\b`, "i");
        if (re2.test(clause)) {
          // Skip if this token is only the plural already captured via another alias in same clause
          // (e.g. tanks matched; skip bare tank if we already added tank from tanks)
          const already = groups.some(g => g.type === type && g.clause === clause);
          if (already) continue;

          // Require the type to appear near a side word or as a clear unit mention
          const side =
            /\b(red|enemy|hostile|attacker)\b/.test(clause)
              ? SIDES.RED
              : /\b(blue|friendly|defender|allied)\b/.test(clause)
                ? SIDES.BLUE
                : SIDES.BLUE;
          // Avoid double-counting when number form already matched in another pass
          const numForm = new RegExp(`\\d+\\s+(?:\\w+\\s+)*${token}\\b`, "i");
          if (numForm.test(clause)) continue;

          const stationed =
            DEFAULT_STATIONED_TYPES.has(type) ||
            /\b(stationed|hold|holding|defend|defending|garrison|emplaced|fixed|static|covering)\b/.test(clause);
          const moving =
            /\b(advance|attack|transit|move|patrol|cap|route|toward|towards|from the)\b/.test(clause);
          groups.push({
            type,
            side,
            count: 1,
            stationed: moving ? false : stationed || DEFAULT_STATIONED_TYPES.has(type),
            clause
          });
        }
      }
    }
  };

  clauses.forEach(extractFromClause);

  // Dedupe identical groups (same type+side+clause)
  const seen = new Set();
  return groups.filter(g => {
    const key = `${g.type}|${g.side}|${g.clause}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const ScenarioGenerator = {
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
          `- Example: "2 blue tanks …; 1 blue SAM …; 2 red tanks …" → 2 blue tank + 1 blue sam + 2 red tank.\n` +
          `Return JSON only.`;

        const raw = await OllamaClient.chatJSON(system, user, SCENARIO_SCHEMA);
        status("AI response received. Building units…");
        const result = this._fromAI(raw, text);

        // If model under-delivered vs deterministic parse, prefer merge/repair
        const expected = parseUnitMentions(text);
        const expectedCount = expected.reduce((s, g) => s + g.count, 0);
        if (expectedCount > 0 && result.units.length < expectedCount) {
          status(`AI returned ${result.units.length} units but prompt implies ${expectedCount} — using strict parser.`);
          return this._fallback(text, [
            `AI under-deployed (${result.units.length} < ${expectedCount}).`,
            "Repaired with strict phrase parser."
          ]);
        }
        return result;
      } catch (err) {
        console.warn("[ScenarioGenerator] Ollama failed:", err);
        status(`AI error: ${err.message}. Using strict fallback…`);
        return this._fallback(text, [`Ollama error: ${err.message}`, "Strict phrase parser fallback."]);
      }
    }

    status("Ollama offline — strict phrase parser.");
    return this._fallback(text, ["Ollama offline. Strict phrase parser."]);
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
          u.waypoints
            .map(w => ({ lat: Number(w.lat), lng: Number(w.lng) }))
            .filter(w => Number.isFinite(w.lat) && Number.isFinite(w.lng))
        );
        log.push(`${unit.name}: moving (${unit.waypoints.length} waypoints)`);
      } else {
        unit.clearWaypoints();
        unit.status = "ready";
        log.push(`${unit.name}: stationed at start`);
      }

      units.push(unit);
    });

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
   * Strict phrase parser fallback.
   * Parses "2 blue tanks…; 1 blue SAM…; 2 red tanks…" into separate groups.
   */
  _fallback(text, extraLog = []) {
    const lower = text.toLowerCase();
    const log = [...extraLog];
    log.push(`Prompt: "${text.slice(0, 120)}${text.length > 120 ? "…" : ""}"`);
    log.push("Skill: strict phrase parser");

    let center = { lat: 50.4501, lng: 30.5234, zoom: 11, name: "Kyiv" };
    for (const [key, loc] of Object.entries(LOCATIONS)) {
      if (lower.includes(key)) {
        center = { ...loc };
        break;
      }
    }
    log.push(`Location → ${center.name}`);

    const groups = parseUnitMentions(text);
    if (groups.length === 0) {
      log.push("No unit phrases found — deploying nothing.");
      return {
        title: `Operation — ${center.name}`,
        summary: "No units (none named in prompt)",
        center,
        units: [],
        log
      };
    }

    log.push(
      "Parsed groups → " +
        groups.map(g => `${g.count}× ${g.side} ${g.type} (${g.stationed ? "stationed" : "moving"})`).join("; ")
    );

    const units = [];
    let seq = 1;

    groups.forEach(g => {
      for (let i = 0; i < g.count; i++) {
        // Blue west / red east of center for Kyiv-style prompts
        const sideOffLng = g.side === SIDES.RED ? 0.08 + i * 0.012 : -0.08 - i * 0.012;
        const sideOffLat = (i - (g.count - 1) / 2) * 0.015;
        const lat = center.lat + sideOffLat + randomOffset(0.008);
        const lng = center.lng + sideOffLng + randomOffset(0.008);

        const u = UnitFactory.create(g.type, {
          side: g.side,
          lat,
          lng,
          name: `${g.side.toUpperCase()} ${capitalize(g.type)}-${seq++}`,
          notes: "From prompt"
        });
        u.setStartPosition(lat, lng);

        if (!g.stationed && u.speed > 0) {
          // Advance toward map center
          const midLat = (lat + center.lat) / 2;
          const midLng = (lng + center.lng) / 2;
          u.setWaypoints([
            { lat: midLat, lng: midLng },
            { lat: center.lat + randomOffset(0.01), lng: center.lng + randomOffset(0.01) }
          ]);
          log.push(`${u.name}: moving toward ${center.name}`);
        } else {
          u.clearWaypoints();
          log.push(`${u.name}: stationed`);
        }
        units.push(u);
      }
    });

    log.push(`Deployed ${units.length} units (prompt-only)`);

    return {
      title: `Operation — ${center.name}`,
      summary: `${units.length} units · ${groups.map(g => `${g.count} ${g.side} ${g.type}`).join(", ")}`,
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
window.parseUnitMentions = parseUnitMentions;
