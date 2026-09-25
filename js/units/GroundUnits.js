/**
 * Ground combat units.
 * domain: GROUND
 * Targeting rules encoded per class.
 */

class Tank extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "tank",
      category: UNIT_CATEGORY.GROUND,
      domain: DOMAIN.GROUND,
      maxHealth: opts.maxHealth ?? 120,
      damage: opts.damage ?? 18,
      // Tanks primarily engage ground & light maritime; limited vs air
      canTarget: opts.canTarget ?? [DOMAIN.GROUND, DOMAIN.NAVAL, DOMAIN.FACILITY],
      detectionRangeKm: opts.detectionRangeKm ?? 8,
      engagementRangeKm: opts.engagementRangeKm ?? 4,
      fireCooldownSec: opts.fireCooldownSec ?? 2.5
    });
  }
}

class Infantry extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "infantry",
      category: UNIT_CATEGORY.GROUND,
      domain: DOMAIN.GROUND,
      maxHealth: opts.maxHealth ?? 60,
      damage: opts.damage ?? 8,
      // Troops can engage flying (MANPADS/small arms), ground, and maritime (near shore)
      canTarget: opts.canTarget ?? [DOMAIN.GROUND, DOMAIN.AIR, DOMAIN.NAVAL, DOMAIN.FACILITY],
      detectionRangeKm: opts.detectionRangeKm ?? 3,
      engagementRangeKm: opts.engagementRangeKm ?? 1.5,
      fireCooldownSec: opts.fireCooldownSec ?? 1.5
    });
  }
}

class Artillery extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "artillery",
      category: UNIT_CATEGORY.GROUND,
      domain: DOMAIN.GROUND,
      maxHealth: opts.maxHealth ?? 80,
      damage: opts.damage ?? 25,
      canTarget: opts.canTarget ?? [DOMAIN.GROUND, DOMAIN.NAVAL, DOMAIN.FACILITY],
      detectionRangeKm: opts.detectionRangeKm ?? 15,
      engagementRangeKm: opts.engagementRangeKm ?? 12,
      fireCooldownSec: opts.fireCooldownSec ?? 4
    });
  }
}

class APC extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "apc",
      category: UNIT_CATEGORY.GROUND,
      domain: DOMAIN.GROUND,
      maxHealth: opts.maxHealth ?? 90,
      damage: opts.damage ?? 10,
      canTarget: opts.canTarget ?? [DOMAIN.GROUND, DOMAIN.AIR],
      detectionRangeKm: opts.detectionRangeKm ?? 5,
      engagementRangeKm: opts.engagementRangeKm ?? 2.5,
      fireCooldownSec: opts.fireCooldownSec ?? 2
    });
  }
}

window.Tank = Tank;
window.Infantry = Infantry;
window.Artillery = Artillery;
window.APC = APC;
