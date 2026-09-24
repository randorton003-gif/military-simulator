/**
 * ScenarioGenerator — prompt → units + automatic waypoints for movement demo.
 */

const ScenarioGenerator = {
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

    // Location
    let center = { lat: 50.45, lng: 30.52, zoom: 10, name: "Operational Area" };
    for (const [key, loc] of Object.entries(LOCATIONS)) {
      if (text.includes(key)) {
        center = { ...loc };
        break;
      }
    }
    log.push(`Location → ${center.name}`);

    // Sides
    const sides = [];
    if (text.includes("blue") || text.includes("friendly") || text.includes("defender")) sides.push(SIDES.BLUE);
    if (text.includes("red") || text.includes("enemy") || text.includes("hostile") || text.includes("attacker")) sides.push(SIDES.RED);
    if (sides.length === 0) sides.push(SIDES.BLUE);
    if (sides.length === 1 && (text.includes("vs") || text.includes("against") || text.includes("versus"))) {
      sides.push(sides[0] === SIDES.BLUE ? SIDES.RED : SIDES.BLUE);
    }
    log.push(`Sides → ${sides.join(", ")}`);

    // Unit types
    const allTypes = UnitFactory.availableTypes();
    const requested = allTypes.filter(t => text.includes(t));

    if (text.includes("air defense") || text.includes("sam coverage") || text.includes("aa")) {
      ["sam", "shorad", "radar"].forEach(t => { if (!requested.includes(t)) requested.push(t); });
    }
    if (text.includes("armor") || text.includes("mechanized")) {
      ["tank", "apc"].forEach(t => { if (!requested.includes(t)) requested.push(t); });
    }
    if (text.includes("air support") || text.includes("airpower") || text.includes("air threat")) {
      ["fighter", "helicopter"].forEach(t => { if (!requested.includes(t)) requested.push(t); });
    }
    if (text.includes("naval") || text.includes("fleet") || text.includes("maritime")) {
      ["destroyer", "frigate"].forEach(t => { if (!requested.includes(t)) requested.push(t); });
    }
    if (requested.length === 0) {
      requested.push("tank", "infantry", "artillery", "sam");
    }
    log.push(`Unit types → ${requested.join(", ")}`);

    const countMatch = text.match(/(\d+)\s*(tank|infantry|artillery|sam|fighter|ship|destroyer)/);
    const baseCount = countMatch ? clamp(parseInt(countMatch[1], 10), 1, 6) : 2;

    const units = [];

    sides.forEach((side) => {
      const sideOffset = side === SIDES.RED ? 0.08 : -0.05;

      requested.forEach((type, typeIdx) => {
        const count = typeIdx === 0 ? baseCount : Math.max(1, Math.floor(baseCount / 2));
        for (let i = 0; i < count; i++) {
          const lat = center.lat + randomOffset(0.06);
          const lng = center.lng + randomOffset(0.09) + sideOffset;

          const unit = UnitFactory.create(type, {
            side,
            lat,
            lng,
            name: `${side.toUpperCase()} ${capitalize(type)}-${i + 1}`,
            notes: "Generated from prompt"
          });

          // Give mobile units a short dictated path so Play is meaningful
          if (unit.speed > 0) {
            const dir = side === SIDES.RED ? -1 : 1;
            unit.setWaypoints([
              { lat: lat + dir * 0.03 + randomOffset(0.01), lng: lng + dir * 0.04 + randomOffset(0.015) },
              { lat: lat + dir * 0.06 + randomOffset(0.01), lng: lng + dir * 0.08 + randomOffset(0.015) }
            ]);
          }

          units.push(unit);
        }
      });
    });

    // HQ
    units.push(UnitFactory.create("hq", {
      side: sides[0],
      lat: center.lat,
      lng: center.lng,
      name: `${sides[0].toUpperCase()} HQ`,
      notes: "Primary command node"
    }));

    log.push(`Deployed ${units.length} units (mobile units have waypoints)`);

    return {
      title: `Operation — ${center.name}`,
      summary: `${units.length} units · ${requested.join(", ")} · ${sides.join(" vs ")}`,
      center,
      units,
      log
    };
  }
};

window.ScenarioGenerator = ScenarioGenerator;
