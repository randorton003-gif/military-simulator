/**
 * Fixed installations and support facilities.
 */

class Airbase extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "airbase",
      category: UNIT_CATEGORY.FACILITY
    });
  }
}

class HQ extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "hq",
      category: UNIT_CATEGORY.FACILITY
    });
  }
}

class Depot extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "depot",
      category: UNIT_CATEGORY.FACILITY
    });
  }
}

class Port extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "port",
      category: UNIT_CATEGORY.FACILITY
    });
  }
}

window.Airbase = Airbase;
window.HQ = HQ;
window.Depot = Depot;
window.Port = Port;
