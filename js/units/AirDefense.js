/**
 * Air Defense systems — SAMs, short-range, sensors, point defense.
 * Compartmentalized so air-defense logic can grow independently.
 */

class SAM extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "sam",
      category: UNIT_CATEGORY.AIR_DEFENSE
    });
    this.engagementRangeKm = opts.engagementRangeKm || 40;
  }

  toPopupHtml() {
    return super.toPopupHtml() +
      `<br/><em>Engagement range: ~${this.engagementRangeKm} km</em>`;
  }
}

class SHORAD extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "shorad",
      category: UNIT_CATEGORY.AIR_DEFENSE
    });
    this.engagementRangeKm = opts.engagementRangeKm || 8;
  }

  toPopupHtml() {
    return super.toPopupHtml() +
      `<br/><em>SHORAD range: ~${this.engagementRangeKm} km</em>`;
  }
}

class Radar extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "radar",
      category: UNIT_CATEGORY.AIR_DEFENSE
    });
    this.detectionRangeKm = opts.detectionRangeKm || 120;
  }

  toPopupHtml() {
    return super.toPopupHtml() +
      `<br/><em>Detection range: ~${this.detectionRangeKm} km</em>`;
  }
}

class CIWS extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "ciws",
      category: UNIT_CATEGORY.AIR_DEFENSE
    });
    this.engagementRangeKm = opts.engagementRangeKm || 3;
  }

  toPopupHtml() {
    return super.toPopupHtml() +
      `<br/><em>Point defense: ~${this.engagementRangeKm} km</em>`;
  }
}

window.SAM = SAM;
window.SHORAD = SHORAD;
window.Radar = Radar;
window.CIWS = CIWS;
