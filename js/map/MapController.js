/**
 * MapController — Leaflet map, markers, range rings, route lines.
 */

const MapController = {
  map: null,
  markers: new Map(),
  rangeLayers: new Map(),   // unitId → [L.Circle, ...]
  routeLayers: new Map(),   // unitId → L.Polyline
  showRanges: true,
  showRoutes: true,

  init(containerId = "map") {
    this.map = L.map(containerId, {
      zoomControl: true,
      attributionControl: true
    }).setView([50.45, 30.52], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.map.getContainer().style.filter = "brightness(0.92) contrast(1.04)";
  },

  clear() {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers.clear();
    this.rangeLayers.forEach(arr => arr.forEach(l => this.map.removeLayer(l)));
    this.rangeLayers.clear();
    this.routeLayers.forEach(l => this.map.removeLayer(l));
    this.routeLayers.clear();
  },

  /** Convert km to approximate degrees (good enough for mid-latitudes) */
  _kmToDeg(km) {
    return km / 111;
  },

  addUnit(unit) {
    const marker = L.marker([unit.lat, unit.lng], {
      icon: unit.createIcon()
    })
      .addTo(this.map)
      .bindPopup(unit.toPopupHtml());

    this.markers.set(unit.id, marker);
    this._drawRanges(unit);
    this._drawRoute(unit);
    return marker;
  },

  _drawRanges(unit) {
    // Remove old
    const old = this.rangeLayers.get(unit.id) || [];
    old.forEach(l => this.map.removeLayer(l));

    if (!this.showRanges) {
      this.rangeLayers.set(unit.id, []);
      return;
    }

    const layers = [];
    const sideColor = unit.side === SIDES.RED ? "#c0392b" : "#2980b9";

    if (unit.detectionRangeKm > 0) {
      const c = L.circle([unit.lat, unit.lng], {
        radius: unit.detectionRangeKm * 1000,
        color: sideColor,
        weight: 1,
        dashArray: "6 4",
        fillColor: sideColor,
        fillOpacity: 0.04,
        interactive: false
      }).addTo(this.map);
      layers.push(c);
    }

    if (unit.engagementRangeKm > 0) {
      const c = L.circle([unit.lat, unit.lng], {
        radius: unit.engagementRangeKm * 1000,
        color: sideColor,
        weight: 1.5,
        fillColor: sideColor,
        fillOpacity: 0.08,
        interactive: false
      }).addTo(this.map);
      layers.push(c);
    }

    this.rangeLayers.set(unit.id, layers);
  },

  _drawRoute(unit) {
    const old = this.routeLayers.get(unit.id);
    if (old) this.map.removeLayer(old);

    if (!this.showRoutes || !unit.waypoints || unit.waypoints.length === 0) {
      this.routeLayers.delete(unit.id);
      return;
    }

    const pts = [[unit.lat, unit.lng], ...unit.waypoints.map(w => [w.lat, w.lng])];
    const line = L.polyline(pts, {
      color: unit.side === SIDES.RED ? "#c0392b" : "#2980b9",
      weight: 2,
      dashArray: "4 6",
      opacity: 0.7
    }).addTo(this.map);

    this.routeLayers.set(unit.id, line);
  },

  /** Call every sim tick to move markers + update rings/routes */
  syncUnits(units) {
    units.forEach(unit => {
      const marker = this.markers.get(unit.id);
      if (marker) {
        marker.setLatLng([unit.lat, unit.lng]);
        // Refresh popup content if open
        if (marker.isPopupOpen()) marker.setPopupContent(unit.toPopupHtml());
      }
      this._drawRanges(unit);
      this._drawRoute(unit);
    });
  },

  focusUnit(unitId) {
    const marker = this.markers.get(unitId);
    if (!marker) return;
    this.map.setView(marker.getLatLng(), Math.max(this.map.getZoom(), 12));
    marker.openPopup();
  },

  applyScenario(scenario) {
    this.clear();
    if (scenario.center) {
      this.map.setView(
        [scenario.center.lat, scenario.center.lng],
        scenario.center.zoom || 10
      );
    }
    (scenario.units || []).forEach(u => this.addUnit(u));
  },

  toggleRanges() {
    this.showRanges = !this.showRanges;
  },

  toggleRoutes() {
    this.showRoutes = !this.showRoutes;
  }
};

window.MapController = MapController;
