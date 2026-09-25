/**
 * Air Defense — domain GROUND (fixed/semi-fixed systems).
 * SHORAD / SAM / CIWS primarily engage AIR.
 * Radar detects but does not damage.
 */

class SAM extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "sam",
      category: UNIT_CATEGORY.AIR_DEFENSE,
      domain: DOMAIN.GROUND,
      maxHealth: opts.maxHealth ?? 70,
      damage: opts.damage ?? 30,
      canTarget: opts.canTarget ?? [DOMAIN.AIR],
      detectionRangeKm: opts.detectionRangeKm ?? 60,
      engagementRangeKm: opts.engagementRangeKm ?? 40,
      fireCooldownSec: opts.fireCooldownSec ?? 3
    });
  }
}

class SHORAD extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "shorad",
      category: UNIT_CATEGORY.AIR_DEFENSE,
      domain: DOMAIN.GROUND,
      maxHealth: opts.maxHealth ?? 50,
      damage: opts.damage ?? 16,
      // Short-range air defense — flying units only
      canTarget: opts.canTarget ?? [DOMAIN.AIR],
      detectionRangeKm: opts.detectionRangeKm ?? 15,
      engagementRangeKm: opts.engagementRangeKm ?? 8,
      fireCooldownSec: opts.fireCooldownSec ?? 1.5
    });
  }
}

class Radar extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "radar",
      category: UNIT_CATEGORY.AIR_DEFENSE,
      domain: DOMAIN.GROUND,
      maxHealth: opts.maxHealth ?? 40,
      damage: opts.damage ?? 0,
      canTarget: opts.canTarget ?? [],
      detectionRangeKm: opts.detectionRangeKm ?? 120,
      engagementRangeKm: 0,
      fireCooldownSec: 999
    });
  }
}

class CIWS extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "ciws",
      category: UNIT_CATEGORY.AIR_DEFENSE,
      domain: DOMAIN.GROUND,
      maxHealth: opts.maxHealth ?? 45,
      damage: opts.damage ?? 12,
      canTarget: opts.canTarget ?? [DOMAIN.AIR],
      detectionRangeKm: opts.detectionRangeKm ?? 5,
      engagementRangeKm: opts.engagementRangeKm ?? 3,
      fireCooldownSec: opts.fireCooldownSec ?? 0.8
    });
  }
}

window.SAM = SAM;
window.SHORAD = SHORAD;
window.Radar = Radar;
window.CIWS = CIWS;
