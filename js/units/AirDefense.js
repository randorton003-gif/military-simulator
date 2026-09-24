/**
 * Air Defense — SAM, SHORAD, Radar, CIWS.
 * Each carries realistic default range values for range-ring display.
 */

class SAM extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "sam",
      category: UNIT_CATEGORY.AIR_DEFENSE,
      detectionRangeKm: opts.detectionRangeKm ?? 60,
      engagementRangeKm: opts.engagementRangeKm ?? 40
    });
  }
}

class SHORAD extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "shorad",
      category: UNIT_CATEGORY.AIR_DEFENSE,
      detectionRangeKm: opts.detectionRangeKm ?? 15,
      engagementRangeKm: opts.engagementRangeKm ?? 8
    });
  }
}

class Radar extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "radar",
      category: UNIT_CATEGORY.AIR_DEFENSE,
      detectionRangeKm: opts.detectionRangeKm ?? 120,
      engagementRangeKm: 0
    });
  }
}

class CIWS extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "ciws",
      category: UNIT_CATEGORY.AIR_DEFENSE,
      detectionRangeKm: opts.detectionRangeKm ?? 5,
      engagementRangeKm: opts.engagementRangeKm ?? 3
    });
  }
}

window.SAM = SAM;
window.SHORAD = SHORAD;
window.Radar = Radar;
window.CIWS = CIWS;
