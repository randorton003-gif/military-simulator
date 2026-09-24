/**
 * ScenarioGenerator — turns a natural-language prompt into a structured scenario.
 * Currently a lightweight keyword engine; swap the body of `generate()` for a real LLM later.
 */

const ScenarioGenerator = {
  /**
   * @param {string} prompt
   * @returns {{ title, summary, center, units: BaseUnit[], log: string[] }}
   */
  generate(prompt) {
    const text = (prompt || "").toLowerCase().trim();
    const log = [];

    if (!text) {
      return {
        title: "Empty Prompt",
        summary: "No scenario description provided.",
        center: { lat: 50.45, lng: 30.52, zoom: 10 },
        units: [],
        log: ["Empty prompt received."]
      };
    }

    log.push(`Prompt: "${prompt.slice(0, 90)}${prompt.length > 90 ? "…" : ""}"`);

    // --- Location ---
    let center = { lat: 50.45, lng: 30.52, zoom: 10, name: "Operational Area" };
    for (const [key, loc] of Object.entries(LOCATIONS)) {
      if (text.includes(key)) {
        center = { ...loc };
        break;
      }
    }
    log.push(`Location → ${center.name} (${center.lat.toFixed(3)}, ${center.lng.toFixed(3)})`);

    // --- Sides ---
    const sides = [];
    if (text.includes("blue") || text.includes("friendly") || text.includes("defender")) sides.push(SIDES.BLUE);
    if (text.includes("red") || text.includes("enemy") || text.includes("hostile") || text.includes("attacker")) sides.push(SIDES.RED);
    if (sides.length === 0) sides.push(SIDES.BLUE);
    if (sides.length === 1 && (text.includes("vs") || text.includes("against") || text.includes("versus"))) {
      sides.push(sides[0] === SIDES.BLUE ? SIDES.RED : SIDES.BLUE);
    }
    log.push(`Sides → ${sides.join(", ")}`);

    // --- Requested unit types ---
    const allTypes = UnitFactory.availableTypes();
    const requested = allTypes.filter(t => text.includes(t));

    // Special keywords that expand into groups
    if (text.includes("air defense") || text.includes("sam coverage") || text.includes("aa")) {
      ["sam", "shorad", "radar"].forEach(t => {
        if (!requested.includes(t)) requested.push(t);
      });
    }
    if (text.includes("armor") || text.includes("mechanized")) {
      ["tank", "apc"].forEach(t => { if (!requested.includes(t)) requested.push(t); });
    }
    if (text.includes("air support") || text.includes("airpower")) {
      ["fighter", "helicopter"].forEach(t => { if (!requested.includes(t)) requested.push(t); });
    }
    if (text.includes("naval") || text.includes("fleet") || text.includes("maritime")) {
      ["destroyer", "frigate"].forEach(t => { if (!requested.includes(t)) requested.push(t); });
    }

    // Sensible defaults if nothing matched
    if (requested.length === 0) {
      requested.push("tank", "infantry", "artillery", "sam");
    }
    log.push(`Unit types → ${requested.join(", ")}`);

    // --- Count ---
    const countMatch = text.match(/(\d+)\s*(tank|infantry|artillery|sam|fighter|ship|destroyer)/);
    const baseCount = countMatch ? clamp(parseInt(countMatch[1], 10), 1, 8) : 2;

    // --- Build units ---
    const units = [];
    sides.forEach((side, sideIdx) => {
      const sideOffset = side === SIDES.RED ? 0.07 : -0.05;

      requested.forEach((type, typeIdx) => {
        const count = typeIdx === 0 ? baseCount : Math.max(1, Math.floor(baseCount / 2));
        for (let i = 0; i < count; i++) {
          const unit = UnitFactory.create(type, {
            side,
            lat: center.lat + randomOffset(0.07),
            lng: center.lng + randomOffset(0.10) + sideOffset,
            name: `${side.toUpperCase()} ${capitalize(type)}-${i + 1}`,
            notes: "Generated from prompt"
          });
          units.push(unit);
        }
      });
    });

    // Always place an HQ for the primary side
    units.push(UnitFactory.create("hq", {
      side: sides[0],
      lat: center.lat,
      lng: center.lng,
      name: `${sides[0].toUpperCase()} HQ`,
      notes: "Primary command node"
    }));

    log.push(`Deployed ${units.length} units`);

    const title = `Operation — ${center.name}`;
    const summary = `${units.length} units · ${requested.join(", ")} · ${sides.join(" vs ")}`;

    return { title, summary, center, units, log };
  }
};

window.ScenarioGenerator = ScenarioGenerator;
