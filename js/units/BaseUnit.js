/**
 * BaseUnit — abstract foundation for every unit type.
 * All concrete units extend this class.
 */
class BaseUnit {
  /**
   * @param {Object} opts
   * @param {string} opts.id
   * @param {string} opts.name
   * @param {string} opts.type
   * @param {string} opts.category   - from UNIT_CATEGORY
   * @param {string} opts.side       - from SIDES
   * @param {number} opts.lat
   * @param {number} opts.lng
   * @param {string} [opts.status]
   * @param {string} [opts.notes]
   */
  constructor({
    id,
    name,
    type,
    category,
    side = SIDES.BLUE,
    lat,
    lng,
    status = "ready",
    notes = ""
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
  }

  /** Human-readable summary for popups & lists */
  get summary() {
    return `${this.name} (${this.type}) · ${this.side} · ${this.status}`;
  }

  /** Leaflet-ready icon */
  createIcon() {
    const svg = getIconSvg(this.type);
    const html = `
      <div class="mil-icon" title="${this.name}">
        ${svg}
        <span class="mil-label">${this.name}</span>
      </div>`;
    return L.divIcon({
      className: "mil-marker",
      html,
      iconSize: [40, 48],
      iconAnchor: [20, 40],
      popupAnchor: [0, -36]
    });
  }

  /** HTML for the map popup */
  toPopupHtml() {
    return `
      <strong>${this.name}</strong><br/>
      Type: ${this.type}<br/>
      Category: ${this.category}<br/>
      Side: ${this.side}<br/>
      Status: ${this.status}<br/>
      ${this.notes ? this.notes + "<br/>" : ""}
      <small>${this.lat.toFixed(4)}, ${this.lng.toFixed(4)}</small>
    `;
  }

  /** Plain object suitable for serialization */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      category: this.category,
      side: this.side,
      lat: this.lat,
      lng: this.lng,
      status: this.status,
      notes: this.notes
    };
  }
}

window.BaseUnit = BaseUnit;
