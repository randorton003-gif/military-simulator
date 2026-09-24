/**
 * Simulated AI scenario generator.
 * Replace `generateScenarioFromPrompt` with a real LLM call later.
 * Expected output shape is documented below.
 */

const KNOWN_LOCATIONS = {
  kyiv: { lat: 50.4501, lng: 30.5234, zoom: 11 },
  kiev: { lat: 50.4501, lng: 30.5234, zoom: 11 },
  moscow: { lat: 55.7558, lng: 37.6173, zoom: 10 },
  taiwan: { lat: 23.6978, lng: 120.9605, zoom: 8 },
  taipei: { lat: 25.0330, lng: 121.5654, zoom: 11 },
  berlin: { lat: 52.5200, lng: 13.4050, zoom: 11 },
  paris: { lat: 48.8566, lng: 2.3522, zoom: 11 },
  washington: { lat: 38.9072, lng: -77.0369, zoom: 11 },
  baghdad: { lat: 33.3152, lng: 44.3661, zoom: 11 },
  seoul: { lat: 37.5665, lng: 126.9780, zoom: 11 },
  tokyo: { lat: 35.6762, lng: 139.6503, zoom: 11 },
  london: { lat: 51.5074, lng: -0.1278, zoom: 11 },
  "south china sea": { lat: 12.0, lng: 114.0, zoom: 6 },
  "persian gulf": { lat: 26.5, lng: 51.5, zoom: 7 },
  "black sea": { lat: 43.0, lng: 34.0, zoom: 6 },
  "red sea": { lat: 20.0, lng: 38.0, zoom: 6 }
};

const UNIT_TYPES = ["tank", "infantry", "artillery", "aircraft", "ship", "helicopter", "command"];

/**
 * @typedef {Object} UnitSpec
 * @property {string} id
 * @property {string} type        - one of UNIT_TYPES or custom
 * @property {string} name
 * @property {number} lat
 * @property {number} lng
 * @property {string} [side]      - "blue" | "red" | "green" etc.
 * @property {string} [status]    - "ready" | "moving" | "engaged"
 * @property {string} [notes]
 */

/**
 * @typedef {Object} Scenario
 * @property {string} title
 * @property {string} summary
 * @property {{lat:number,lng:number,zoom:number}} center
 * @property {UnitSpec[]} units
 * @property {string[]} logEntries
 */

/**
 * Very lightweight keyword-based "AI".
 * In production, call an LLM and ask it to return JSON matching the Scenario shape.
 */
function generateScenarioFromPrompt(prompt) {
  const text = (prompt || "").toLowerCase().trim();
  if (!text) {
    return {
      title: "Empty prompt",
      summary: "Please enter a scenario description.",
      center: { lat: 50.45, lng: 30.52, zoom: 10 },
      units: [],
      logEntries: ["No prompt provided."]
    };
  }

  // Detect location
  let center = { lat: 50.45, lng: 30.52, zoom: 10 }; // default Kyiv area
  let locationName = "Operational Area";
  for (const [key, loc] of Object.entries(KNOWN_LOCATIONS)) {
    if (text.includes(key)) {
      center = { ...loc };
      locationName = key.replace(/\b\w/g, c => c.toUpperCase());
      break;
    }
  }

  // Detect unit types mentioned
  const requestedTypes = UNIT_TYPES.filter(t => text.includes(t));
  if (requestedTypes.length === 0) {
    // default mix
    requestedTypes.push("tank", "infantry", "artillery");
  }

  // Detect rough counts (simple)
  const countMatch = text.match(/(\d+)\s*(tank|infantry|artillery|aircraft|ship|helicopter)/);
  const defaultCount = countMatch ? Math.min(parseInt(countMatch[1], 10), 8) : 3;

  const units = [];
  const sides = text.includes("blue") && text.includes("red")
    ? ["blue", "red"]
    : text.includes("red force") || text.includes("enemy")
      ? ["blue", "red"]
      : ["blue"];

  let idCounter = 1;
  for (const side of sides) {
    for (const type of requestedTypes) {
      const n = type === requestedTypes[0] ? defaultCount : Math.max(1, Math.floor(defaultCount / 2));
      for (let i = 0; i < n; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.08;
        const offsetLng = (Math.random() - 0.5) * 0.12;
        // push red units a bit east/west depending on side
        const sideOffset = side === "red" ? 0.06 : -0.04;
        units.push({
          id: `u${idCounter++}`,
          type,
          name: `${side.toUpperCase()} ${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
          lat: center.lat + offsetLat,
          lng: center.lng + offsetLng + sideOffset,
          side,
          status: "ready",
          notes: `Generated from prompt`
        });
      }
    }
  }

  // Add a command post near center
  units.push({
    id: `u${idCounter++}`,
    type: "command",
    name: "HQ Command",
    lat: center.lat,
    lng: center.lng,
    side: "blue",
    status: "ready",
    notes: "Primary command node"
  });

  const title = `Operation near ${locationName}`;
  const summary = `AI generated ${units.length} units (${requestedTypes.join(", ")}) centered on ${locationName}.`;

  return {
    title,
    summary,
    center,
    units,
    logEntries: [
      `Prompt received: "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}"`,
      `Location resolved → ${locationName} (${center.lat.toFixed(3)}, ${center.lng.toFixed(3)})`,
      `Unit types: ${requestedTypes.join(", ")}`,
      `Deployed ${units.length} units across ${sides.length} side(s).`,
      `Map and icons updated.`
    ]
  };
}

// Export for browser
window.generateScenarioFromPrompt = generateScenarioFromPrompt;
