/** Naval units — domain NAVAL */

class Destroyer extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "destroyer",
      category: UNIT_CATEGORY.NAVAL,
      domain: DOMAIN.NAVAL,
      maxHealth: opts.maxHealth ?? 150,
      damage: opts.damage ?? 20,
      canTarget: opts.canTarget ?? [DOMAIN.NAVAL, DOMAIN.AIR, DOMAIN.GROUND],
      detectionRangeKm: opts.detectionRangeKm ?? 40,
      engagementRangeKm: opts.engagementRangeKm ?? 25,
      fireCooldownSec: opts.fireCooldownSec ?? 3
    });
  }
}

class Frigate extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "frigate",
      category: UNIT_CATEGORY.NAVAL,
      domain: DOMAIN.NAVAL,
      maxHealth: opts.maxHealth ?? 110,
      damage: opts.damage ?? 14,
      canTarget: opts.canTarget ?? [DOMAIN.NAVAL, DOMAIN.AIR],
      detectionRangeKm: opts.detectionRangeKm ?? 30,
      engagementRangeKm: opts.engagementRangeKm ?? 18,
      fireCooldownSec: opts.fireCooldownSec ?? 2.5
    });
  }
}

class Carrier extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "carrier",
      category: UNIT_CATEGORY.NAVAL,
      domain: DOMAIN.NAVAL,
      maxHealth: opts.maxHealth ?? 300,
      damage: opts.damage ?? 8,
      canTarget: opts.canTarget ?? [DOMAIN.AIR, DOMAIN.NAVAL],
      detectionRangeKm: opts.detectionRangeKm ?? 50,
      engagementRangeKm: opts.engagementRangeKm ?? 15,
      fireCooldownSec: opts.fireCooldownSec ?? 4
    });
  }
}

class Submarine extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "submarine",
      category: UNIT_CATEGORY.NAVAL,
      domain: DOMAIN.NAVAL,
      maxHealth: opts.maxHealth ?? 90,
      damage: opts.damage ?? 40,
      canTarget: opts.canTarget ?? [DOMAIN.NAVAL, DOMAIN.GROUND],
      detectionRangeKm: opts.detectionRangeKm ?? 25,
      engagementRangeKm: opts.engagementRangeKm ?? 15,
      fireCooldownSec: opts.fireCooldownSec ?? 6
    });
  }
}

window.Destroyer = Destroyer;
window.Frigate = Frigate;
window.Carrier = Carrier;
window.Submarine = Submarine;
