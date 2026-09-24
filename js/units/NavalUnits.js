/**
 * Naval surface and subsurface units.
 */

class Destroyer extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "destroyer",
      category: UNIT_CATEGORY.NAVAL
    });
  }
}

class Frigate extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "frigate",
      category: UNIT_CATEGORY.NAVAL
    });
  }
}

class Carrier extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "carrier",
      category: UNIT_CATEGORY.NAVAL
    });
  }
}

class Submarine extends BaseUnit {
  constructor(opts) {
    super({
      ...opts,
      type: "submarine",
      category: UNIT_CATEGORY.NAVAL
    });
  }
}

window.Destroyer = Destroyer;
window.Frigate = Frigate;
window.Carrier = Carrier;
window.Submarine = Submarine;
