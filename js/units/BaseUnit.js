/**
 * BaseUnit — foundation for every unit.
 * Supports waypoints (dictated movement), speed, and optional range rings.
 */
class BaseUnit {
  constructor({
    id,
    name,
    type,
    category,
    side = SIDES.BLUE,
    lat,
    lng,
    status = "ready",
    notes = "",
    speed = null,
    detectionRangeKm = 0,
    engagementRangeKm = 0
  }) {
    this.id = id || uid();
    this.name = name;
    this.type = type;
    this.category = category;
    this.side = side;
    this.lat = lat;
    this.lng = lng;
    this.status = status;
    this.notes = notes;

    // Movement
    this.speed = speed != null ? speed : (DEFAULT_SPEED[type] || 0.001);
    this.waypoints = [];       // [{lat, lng}, ...]
    this.waypointIndex = 0;

    // Sensor / weapon ranges (km) — used for range rings
    this.detectionRangeKm = detectionRangeKm;
    this.engagementRangeKm = engagementRangeKm;
  }

  get summary() {
    return `${this.name} (${this.type}) · ${this.side} · ${this.status}`;
  }

  /** Set a path the unit will follow when simulation is running */
  setWaypoints(points) {
    this.waypoints = points || [];
    this.waypointIndex = 0;
    if (this.waypoints.length > 0) this.status = "moving";
  }

  /** Advance along waypoints. dt = seconds at current sim speed. */
  update(dt) {
    if (!this.waypoints.length || this.waypointIndex >= this.waypoints.length) {
      if (this.status === "moving") this.status = "ready";
      return;
    }

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
        this.status = "ready";
      }
    } else {
      const ratio = step / dist;
      this.lat += dLat * ratio;
      this.lng += dLng * ratio;
      this.status = "moving";
    }
  }

  createIcon() {
    const svg = getIconSvg(this.type);
    const sideColor = this.side === SIDES.RED ? "#c0392b" : this.side === SIDES.BLUE ? "#2980b9" : "#555";
    const html = `
      <div class="mil-icon" title="${this.name}">
        <div class="mil-icon-bg" style="border-color:${sideColor}">${svg}</div>
        <span class="mil-label">${this.name}</span>
      </div>`;
    return L.divIcon({
      className: "mil-marker",
      html,
      iconSize: [36, 44],
      iconAnchor: [18, 36],
      popupAnchor: [0, -32]
    });
  }

  toPopupHtml() {
    let extra = "";
    if (this.detectionRangeKm > 0) extra += `<br/>Detection: ~${this.detectionRangeKm} km`;
    if (this.engagementRangeKm > 0) extra += `<br/>Engagement: ~${this.engagementRangeKm} km`;
    if (this.waypoints.length) extra += `<br/>Waypoints: ${this.waypointIndex}/${this.waypoints.length}`;

    return `
      <strong>${this.name}</strong><br/>
      Type: ${this.type}<br/>
      Category: ${this.category}<br/>
      Side: ${this.side}<br/>
      Status: ${this.status}
      ${extra}
      ${this.notes ? "<br/>" + this.notes : ""}
      <br/><small>${this.lat.toFixed(4)}, ${this.lng.toFixed(4)}</small>
    `;
  }

  toJSON() {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category,
      side: this.side, lat: this.lat, lng: this.lng, status: this.status,
      notes: this.notes, detectionRangeKm: this.detectionRangeKm,
      engagementRangeKm: this.engagementRangeKm
    };
  }
}

window.BaseUnit = BaseUnit;
