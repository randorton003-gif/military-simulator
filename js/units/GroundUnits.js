/**
 * Ground combat units.
 */

class Tank extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "tank",
      category: UNIT_CATEGORY.GROUND
    });
  }
}

class Infantry extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "infantry",
      category: UNIT_CATEGORY.GROUND
    });
  }
}

class Artillery extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "artillery",
      category: UNIT_CATEGORY.GROUND
    });
  }
}

class APC extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "apc",
      category: UNIT_CATEGORY.GROUND
    });
  }
}

window.Tank = Tank;
window.Infantry = Infantry;
window.Artillery = Artillery;
window.APC = APC;
