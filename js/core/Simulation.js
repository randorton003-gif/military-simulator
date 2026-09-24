/**
 * Simulation — play / pause / speed control + unit updates.
 * Panopticon-style time control.
 */

const Simulation = {
  running: false,
  speed: 1,          // 1x or 2x
  lastTs: 0,
  units: [],         // reference to current scenario units
  onTick: null,      // callback after each update (for UI refresh)

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
    const dt = ((now - this.lastTs) / 1000) * this.speed; // seconds
    this.lastTs = now;

    // Update every unit
    this.units.forEach(u => u.update(dt));

    if (typeof this.onTick === "function") this.onTick();

    this._rafId = requestAnimationFrame(() => this._loop());
  }
};

window.Simulation = Simulation;
