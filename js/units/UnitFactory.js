/**
 * UnitFactory — single entry point for creating any unit.
 * Keeps creation logic centralized and type-safe.
 */

const UNIT_REGISTRY = {
  // Ground
  tank: Tank,
  infantry: Infantry,
  artillery: Artillery,
  apc: APC,

  // Air
  fighter: Fighter,
  bomber: Bomber,
  helicopter: Helicopter,
  uav: UAV,

  // Naval
  destroyer: Destroyer,
  frigate: Frigate,
  carrier: Carrier,
  submarine: Submarine,

  // Air Defense
  sam: SAM,
  shorad: SHORAD,
  radar: Radar,
  ciws: CIWS,

  // Facilities
  airbase: Airbase,
  hq: HQ,
  depot: Depot,
  port: Port
};

const UnitFactory = {
  /**
   * Create a unit instance from a type string + options.
   * @param {string} type
   * @param {Object} opts  - lat, lng, side, name, etc.
   * @returns {BaseUnit}
   */
  create(type, opts = {}) {
    const key = (type || "").toLowerCase();
    const Cls = UNIT_REGISTRY[key];

    if (!Cls) {
      console.warn(`[UnitFactory] Unknown type "${type}", falling back to Tank`);
      return new Tank({ ...opts, name: opts.name || `Unknown ${type}` });
    }

    const name = opts.name || `${capitalize(opts.side || "blue")} ${capitalize(key)}`;
    return new Cls({ ...opts, name });
  },

  /** List all registered type keys */
  availableTypes() {
    return Object.keys(UNIT_REGISTRY);
  },

  /** Types belonging to a given category */
  typesByCategory(category) {
    return Object.entries(UNIT_REGISTRY)
      .filter(([, Cls]) => {
        const tmp = new Cls({ lat: 0, lng: 0 });
        return tmp.category === category;
      })
      .map(([key]) => key);
  }
};

window.UnitFactory = UnitFactory;
window.UNIT_REGISTRY = UNIT_REGISTRY;
