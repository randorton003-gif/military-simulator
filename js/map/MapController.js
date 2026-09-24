/**
 * MapController — owns the Leaflet map and all unit markers.
 */

const MapController = {
  map: null,
  markers: new Map(), // unitId → L.Marker

  init(containerId = "map") {
    this.map = L.map(containerId, {
      zoomControl: true,
      attributionControl: true
    }).setView([50.45, 30.52], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    // Subtle darkening for command-center feel
    this.map.getContainer().style.filter = "brightness(0.90) contrast(1.05)";
  },

  clear() {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers.clear();
  },

  addUnit(unit) {
    const marker = L.marker([unit.lat, unit.lng], {
      icon: unit.createIcon()
    })
      .addTo(this.map)
      .bindPopup(unit.toPopupHtml());

    this.markers.set(unit.id, marker);
    return marker;
  },

  focusUnit(unitId) {
    const marker = this.markers.get(unitId);
    if (!marker) return;
    this.map.setView(marker.getLatLng(), Math.max(this.map.getZoom(), 13));
    marker.openPopup();
  },

  /**
   * Apply a full scenario: clear, center, place all units.
   * @param {Object} scenario
   * @param {BaseUnit[]} scenario.units
   * @param {{lat,lng,zoom}} scenario.center
   */
  applyScenario(scenario) {
    this.clear();
    if (scenario.center) {
      this.map.setView(
        [scenario.center.lat, scenario.center.lng],
        scenario.center.zoom || 10
      );
    }
    (scenario.units || []).forEach(u => this.addUnit(u));
  }
};

window.MapController = MapController;
