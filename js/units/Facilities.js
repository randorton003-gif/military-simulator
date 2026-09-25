/** Fixed installations — domain FACILITY, limited/no offensive capability */

class Airbase extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "airbase",
      category: UNIT_CATEGORY.FACILITY,
      domain: DOMAIN.FACILITY,
      maxHealth: opts.maxHealth ?? 200,
      damage: opts.damage ?? 0,
      canTarget: [],
      detectionRangeKm: opts.detectionRangeKm ?? 10,
      engagementRangeKm: 0
    });
  }
}

class HQ extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "hq",
      category: UNIT_CATEGORY.FACILITY,
      domain: DOMAIN.FACILITY,
      maxHealth: opts.maxHealth ?? 80,
      damage: opts.damage ?? 0,
      canTarget: [],
      detectionRangeKm: opts.detectionRangeKm ?? 5,
      engagementRangeKm: 0
    });
  }
}

class Depot extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "depot",
      category: UNIT_CATEGORY.FACILITY,
      domain: DOMAIN.FACILITY,
      maxHealth: opts.maxHealth ?? 100,
      damage: 0,
      canTarget: [],
      detectionRangeKm: 2,
      engagementRangeKm: 0
    });
  }
}

class Port extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "port",
      category: UNIT_CATEGORY.FACILITY,
      domain: DOMAIN.FACILITY,
      maxHealth: opts.maxHealth ?? 180,
      damage: 0,
      canTarget: [],
      detectionRangeKm: 8,
      engagementRangeKm: 0
    });
  }
}

window.Airbase = Airbase;
window.HQ = HQ;
window.Depot = Depot;
window.Port = Port;
