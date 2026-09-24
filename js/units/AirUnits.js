/**
 * Air units — fixed-wing, rotary, and unmanned.
 */

class Fighter extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "fighter",
      category: UNIT_CATEGORY.AIR
    });
  }
}

class Bomber extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "bomber",
      category: UNIT_CATEGORY.AIR
    });
  }
}

class Helicopter extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "helicopter",
      category: UNIT_CATEGORY.AIR
    });
  }
}

class UAV extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "uav",
      category: UNIT_CATEGORY.AIR
    });
  }
}

window.Fighter = Fighter;
window.Bomber = Bomber;
window.Helicopter = Helicopter;
window.UAV = UAV;
