/**
 * BaseUnit — health, damage, target domains, waypoints, combat helpers.
 */
class BaseUnit {
  /**
   * @param {Object} opts
   * @param {string} opts.domain - DOMAIN.GROUND | AIR | NAVAL | FACILITY
   * @param {string[]} opts.canTarget - list of DOMAIN values this unit may engage
   * @param {number} opts.maxHealth
   * @param {number} opts.damage - damage per engagement tick
   * @param {number} opts.detectionRangeKm
   * @param {number} opts.engagementRangeKm
   * @param {number} opts.fireCooldownSec - seconds between shots
   */
  constructor({
    id, name, type, category, domain,
    side = SIDES.BLUE,
    lat, lng,
    status = "ready",
    notes = "",
    speed = null,
    maxHealth = 100,
    damage = 10,
    canTarget = [],
    detectionRangeKm = 0,
    engagementRangeKm = 0,
    fireCooldownSec = 2
  }) {
    this.id = id || uid();
    this.name = name;
    this.type = type;
    this.category = category;
    this.domain = domain || DOMAIN.GROUND;
    this.side = side;
    this.lat = lat;
    this.lng = lng;
    this.startLat = lat;
    this.startLng = lng;
    this.status = status;
    this.notes = notes;

    this.speed = speed != null ? speed : (DEFAULT_SPEED[type] || 0);
    this.waypoints = [];
    this.waypointIndex = 0;

    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.damage = damage;
    this.canTarget = canTarget;
    this.detectionRangeKm = detectionRangeKm;
    this.engagementRangeKm = engagementRangeKm;
    this.fireCooldownSec = fireCooldownSec;
    this._cooldownLeft = 0;

    this.targetId = null; // current engagement target
  }

  get isAlive() {
    return this.health > 0;
  }

  get summary() {
    return `${this.name} (${this.type}) · ${this.side} · HP ${Math.ceil(this.health)}/${this.maxHealth}`;
  }

  /** Can this unit legally engage the target domain? */
  canEngage(target) {
    if (!target || !target.isAlive) return false;
    if (target.side === this.side) return false;
    if (!this.canTarget.includes(target.domain)) return false;
    return true;
  }

  distanceKmTo(other) {
    // Equirectangular approximation
    const dLat = (other.lat - this.lat) * 111;
    const dLng = (other.lng - this.lng) * 111 * Math.cos((this.lat * Math.PI) / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }

  setWaypoints(points) {
    this.waypoints = (points || []).map(p => ({ lat: p.lat, lng: p.lng }));
    this.waypointIndex = 0;
    if (this.waypoints.length > 0 && this.speed > 0) this.status = "moving";
  }

  addWaypoint(lat, lng) {
    this.waypoints.push({ lat, lng });
    if (this.speed > 0) this.status = "moving";
  }

  clearWaypoints() {
    this.waypoints = [];
    this.waypointIndex = 0;
    if (this.status === "moving") this.status = "ready";
  }

  setPosition(lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }

  setStartPosition(lat, lng) {
    this.startLat = lat;
    this.startLng = lng;
    this.lat = lat;
    this.lng = lng;
  }

  /** Movement along waypoints */
  updateMovement(dt) {
    if (!this.isAlive || !this.waypoints.length || this.waypointIndex >= this.waypoints.length) {
      if (this.status === "moving") this.status = this.targetId ? "engaged" : "ready";
      return;
    }
    if (this.speed <= 0) return;

    const target = this.waypoints[this.waypointIndex];
    const dLat = target.lat - this.lat;
    const dLng = target.lng - this.lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    const step = this.speed * dt;

    if (dist <= step || dist < 0.00005) {
      this.lat = target.lat;
      this.lng = target.lng;
      this.waypointIndex += 1;
      if (this.waypointIndex >= this.waypoints.length) {
        this.status = this.targetId ? "engaged" : "ready";
      }
    } else {
      const ratio = step / dist;
      this.lat += dLat * ratio;
      this.lng += dLng * ratio;
      this.status = "moving";
    }
  }

  /** Combat tick: find target in engagement range, apply damage */
  updateCombat(dt, allUnits) {
    if (!this.isAlive) return null;
    if (this.engagementRangeKm <= 0 || this.damage <= 0) return null;

    this._cooldownLeft = Math.max(0, this._cooldownLeft - dt);

    // Keep current target if still valid
    let target = this.targetId
      ? allUnits.find(u => u.id === this.targetId && u.isAlive)
      : null;

    if (target) {
      const d = this.distanceKmTo(target);
      if (d > this.engagementRangeKm || !this.canEngage(target)) {
        target = null;
        this.targetId = null;
      }
    }

    // Acquire new target — closest valid enemy in engagement range
    if (!target) {
      let best = null;
      let bestD = Infinity;
      for (const u of allUnits) {
        if (!this.canEngage(u)) continue;
        const d = this.distanceKmTo(u);
        if (d <= this.engagementRangeKm && d < bestD) {
          best = u;
          bestD = d;
        }
      }
      target = best;
      this.targetId = target ? target.id : null;
    }

    if (!target) {
      if (this.status === "engaged") this.status = "ready";
      return null;
    }

    this.status = "engaged";

    if (this._cooldownLeft > 0) return null;

    // Fire
    this._cooldownLeft = this.fireCooldownSec;
    const dealt = Math.min(this.damage, target.health);
    target.health -= dealt;
    if (target.health <= 0) {
      target.health = 0;
      target.status = "destroyed";
      target.targetId = null;
    }

    return {
      attacker: this,
      target,
      damage: dealt,
      targetDestroyed: target.health <= 0
    };
  }

  createIcon() {
    const svg = getIconSvg(this.type);
    const sideColor = this.side === SIDES.RED ? "#c0392b" : this.side === SIDES.BLUE ? "#2980b9" : "#555";
    const hpPct = Math.max(0, this.health / this.maxHealth);
    const destroyed = !this.isAlive;

    const html = `
      <div class="mil-icon ${destroyed ? "destroyed" : ""}" title="${this.name}">
        <div class="mil-icon-bg" style="border-color:${sideColor};opacity:${destroyed ? 0.35 : 1}">${svg}</div>
        <div class="hp-bar"><div class="hp-fill" style="width:${hpPct * 100}%"></div></div>
        <span class="mil-label">${this.name}</span>
      </div>`;

    return L.divIcon({
      className: "mil-marker",
      html,
      iconSize: [36, 50],
      iconAnchor: [18, 40],
      popupAnchor: [0, -36]
    });
  }

  toPopupHtml() {
    const targets = this.canTarget.join(", ") || "none";
    let extra = "";
    if (this.detectionRangeKm > 0) extra += `<br/>Detection: ~${this.detectionRangeKm} km`;
    if (this.engagementRangeKm > 0) extra += `<br/>Engagement: ~${this.engagementRangeKm} km`;
    if (this.waypoints.length) extra += `<br/>Waypoints: ${this.waypointIndex}/${this.waypoints.length}`;

    return `
      <strong>${this.name}</strong><br/>
      Type: ${this.type} · Domain: ${this.domain}<br/>
      Side: ${this.side} · Status: ${this.status}<br/>
      HP: ${Math.ceil(this.health)} / ${this.maxHealth}<br/>
      Damage: ${this.damage} · Can target: ${targets}
      ${extra}
      ${this.notes ? "<br/>" + this.notes : ""}
      <br/><small>${this.lat.toFixed(4)}, ${this.lng.toFixed(4)}</small>
    `;
  }

  toJSON() {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category,
      domain: this.domain, side: this.side, lat: this.lat, lng: this.lng,
      status: this.status, notes: this.notes,
      health: this.health, maxHealth: this.maxHealth, damage: this.damage,
      canTarget: this.canTarget,
      detectionRangeKm: this.detectionRangeKm,
      engagementRangeKm: this.engagementRangeKm,
      waypoints: this.waypoints
    };
  }
}

window.BaseUnit = BaseUnit;
