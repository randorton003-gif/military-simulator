/** Air units with default detection ranges */

class Fighter extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "fighter",
      category: UNIT_CATEGORY.AIR,
      detectionRangeKm: opts.detectionRangeKm ?? 80,
      engagementRangeKm: opts.engagementRangeKm ?? 40
    });
  }
}

class Bomber extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "bomber",
      category: UNIT_CATEGORY.AIR,
      detectionRangeKm: opts.detectionRangeKm ?? 50,
      engagementRangeKm: opts.engagementRangeKm ?? 20
    });
  }
}

class Helicopter extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "helicopter",
      category: UNIT_CATEGORY.AIR,
      detectionRangeKm: opts.detectionRangeKm ?? 20,
      engagementRangeKm: opts.engagementRangeKm ?? 8
    });
  }
}

class UAV extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "uav",
      category: UNIT_CATEGORY.AIR,
      detectionRangeKm: opts.detectionRangeKm ?? 30,
      engagementRangeKm: 0
    });
  }
}

window.Fighter = Fighter;
window.Bomber = Bomber;
window.Helicopter = Helicopter;
window.UAV = UAV;
