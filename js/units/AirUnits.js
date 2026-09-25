/** Air units — domain AIR */

class Fighter extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "fighter",
      category: UNIT_CATEGORY.AIR,
      domain: DOMAIN.AIR,
      maxHealth: opts.maxHealth ?? 80,
      damage: opts.damage ?? 22,
      canTarget: opts.canTarget ?? [DOMAIN.AIR, DOMAIN.GROUND, DOMAIN.NAVAL, DOMAIN.FACILITY],
      detectionRangeKm: opts.detectionRangeKm ?? 80,
      engagementRangeKm: opts.engagementRangeKm ?? 40,
      fireCooldownSec: opts.fireCooldownSec ?? 2
    });
  }
}

class Bomber extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "bomber",
      category: UNIT_CATEGORY.AIR,
      domain: DOMAIN.AIR,
      maxHealth: opts.maxHealth ?? 100,
      damage: opts.damage ?? 35,
      canTarget: opts.canTarget ?? [DOMAIN.GROUND, DOMAIN.NAVAL, DOMAIN.FACILITY],
      detectionRangeKm: opts.detectionRangeKm ?? 50,
      engagementRangeKm: opts.engagementRangeKm ?? 20,
      fireCooldownSec: opts.fireCooldownSec ?? 5
    });
  }
}

class Helicopter extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "helicopter",
      category: UNIT_CATEGORY.AIR,
      domain: DOMAIN.AIR,
      maxHealth: opts.maxHealth ?? 55,
      damage: opts.damage ?? 14,
      canTarget: opts.canTarget ?? [DOMAIN.GROUND, DOMAIN.AIR, DOMAIN.NAVAL],
      detectionRangeKm: opts.detectionRangeKm ?? 20,
      engagementRangeKm: opts.engagementRangeKm ?? 8,
      fireCooldownSec: opts.fireCooldownSec ?? 2
    });
  }
}

class UAV extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "uav",
      category: UNIT_CATEGORY.AIR,
      domain: DOMAIN.AIR,
      maxHealth: opts.maxHealth ?? 30,
      damage: opts.damage ?? 6,
      canTarget: opts.canTarget ?? [DOMAIN.GROUND, DOMAIN.FACILITY],
      detectionRangeKm: opts.detectionRangeKm ?? 30,
      engagementRangeKm: opts.engagementRangeKm ?? 5,
      fireCooldownSec: opts.fireCooldownSec ?? 3
    });
  }
}

window.Fighter = Fighter;
window.Bomber = Bomber;
window.Helicopter = Helicopter;
window.UAV = UAV;
