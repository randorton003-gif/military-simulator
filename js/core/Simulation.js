/**
 * Simulation — play/pause/speed + movement + combat resolution.
 */

const Simulation = {
  running: false,
  speed: 1,
  lastTs: 0,
  units: [],
  onTick: null,
  onCombat: null, // (event) => {}
  _rafId: null,

  setUnits(units) {
    this.units = units || [];
  },

  play() {
    if (this.running) return;
    this.running = true;
    this.lastTs = performance.now();
    this._loop();
  },

  pause() {
    this.running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  },

  toggle() {
    if (this.running) this.pause();
    else this.play();
  },

  setSpeed(mult) {
    this.speed = mult === 2 ? 2 : 1;
  },

  toggleSpeed() {
    this.speed = this.speed === 1 ? 2 : 1;
  },

  _loop() {
    if (!this.running) return;

    const now = performance.now();
    const dt = ((now - this.lastTs) / 1000) * this.speed;
    this.lastTs = now;

    const alive = this.units.filter(u => u.isAlive);

    // Movement
    alive.forEach(u => u.updateMovement(dt));

    // Combat
    alive.forEach(u => {
      const ev = u.updateCombat(dt, this.units);
      if (ev && typeof this.onCombat === "function") this.onCombat(ev);
    });

    if (typeof this.onTick === "function") this.onTick();

    this._rafId = requestAnimationFrame(() => this._loop());
  }
};

window.Simulation = Simulation;
