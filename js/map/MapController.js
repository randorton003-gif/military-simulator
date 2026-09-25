/**
 * MapController — markers, range rings, routes, drag, click-to-place, waypoint mode.
 */

const MapController = {
  map: null,
  markers: new Map(),
  rangeLayers: new Map(),
  routeLayers: new Map(),
  showRanges: true,
  showRoutes: true,

  // Interaction modes: 'select' | 'add' | 'waypoint'
  mode: "select",
  addType: "tank",
  addSide: SIDES.BLUE,
  selectedId: null,
  onSelect: null,
  onAddAt: null,
  onWaypointAt: null,
  onMoved: null,

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

    this.map.on("click", (e) => {
      if (this.mode === "add" && typeof this.onAddAt === "function") {
        this.onAddAt(e.latlng.lat, e.latlng.lng);
      } else if (this.mode === "waypoint" && this.selectedId && typeof this.onWaypointAt === "function") {
        this.onWaypointAt(this.selectedId, e.latlng.lat, e.latlng.lng);
      }
    });
  },

  setMode(mode) {
    this.mode = mode;
    const el = this.map.getContainer();
    el.style.cursor = mode === "add" || mode === "waypoint" ? "crosshair" : "";
  },

  clear() {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers.clear();
    this.rangeLayers.forEach(arr => arr.forEach(l => this.map.removeLayer(l)));
    this.rangeLayers.clear();
    this.routeLayers.forEach(l => this.map.removeLayer(l));
    this.routeLayers.clear();
    this.selectedId = null;
  },

  addUnit(unit) {
    const marker = L.marker([unit.lat, unit.lng], {
      icon: unit.createIcon(),
      draggable: true
    }).addTo(this.map);

    marker.bindPopup(() => unit.toPopupHtml());

    marker.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      this.selectedId = unit.id;
      if (typeof this.onSelect === "function") this.onSelect(unit);
    });

    marker.on("dragend", (e) => {
      const ll = e.target.getLatLng();
      unit.setPosition(ll.lat, ll.lng);
      this._drawRanges(unit);
      this._drawRoute(unit);
      if (typeof this.onMoved === "function") this.onMoved(unit);
    });

    this.markers.set(unit.id, marker);
    this._drawRanges(unit);
    this._drawRoute(unit);
    return marker;
  },

  removeUnit(unitId) {
    const m = this.markers.get(unitId);
    if (m) this.map.removeLayer(m);
    this.markers.delete(unitId);
    const ranges = this.rangeLayers.get(unitId) || [];
    ranges.forEach(l => this.map.removeLayer(l));
    this.rangeLayers.delete(unitId);
    const route = this.routeLayers.get(unitId);
    if (route) this.map.removeLayer(route);
    this.routeLayers.delete(unitId);
    if (this.selectedId === unitId) this.selectedId = null;
  },

  _drawRanges(unit) {
    const old = this.rangeLayers.get(unit.id) || [];
    old.forEach(l => this.map.removeLayer(l));

    if (!this.showRanges || !unit.isAlive) {
      this.rangeLayers.set(unit.id, []);
      return;
    }

    const layers = [];
    const sideColor = unit.side === SIDES.RED ? "#c0392b" : "#2980b9";

    if (unit.detectionRangeKm > 0) {
      layers.push(L.circle([unit.lat, unit.lng], {
        radius: unit.detectionRangeKm * 1000,
        color: sideColor, weight: 1, dashArray: "6 4",
        fillColor: sideColor, fillOpacity: 0.03, interactive: false
      }).addTo(this.map));
    }
    if (unit.engagementRangeKm > 0) {
      layers.push(L.circle([unit.lat, unit.lng], {
        radius: unit.engagementRangeKm * 1000,
        color: sideColor, weight: 1.5,
        fillColor: sideColor, fillOpacity: 0.07, interactive: false
      }).addTo(this.map));
    }
    this.rangeLayers.set(unit.id, layers);
  },

  _drawRoute(unit) {
    const old = this.routeLayers.get(unit.id);
    if (old) this.map.removeLayer(old);

    if (!this.showRoutes || !unit.waypoints?.length) {
      this.routeLayers.delete(unit.id);
      return;
    }

    const pts = [[unit.lat, unit.lng], ...unit.waypoints.map(w => [w.lat, w.lng])];
    const line = L.polyline(pts, {
      color: unit.side === SIDES.RED ? "#c0392b" : "#2980b9",
      weight: 2, dashArray: "4 6", opacity: 0.75
    }).addTo(this.map);
    this.routeLayers.set(unit.id, line);
  },

  syncUnits(units) {
    // Remove markers for destroyed units still shown, update living
    const ids = new Set(units.map(u => u.id));
    this.markers.forEach((m, id) => {
      if (!ids.has(id)) this.removeUnit(id);
    });

    units.forEach(unit => {
      let marker = this.markers.get(unit.id);
      if (!marker) {
        this.addUnit(unit);
        return;
      }
      if (!marker.dragging?._enabled) {
        // don't fight user drag
      }
      marker.setLatLng([unit.lat, unit.lng]);
      marker.setIcon(unit.createIcon());
      if (marker.isPopupOpen()) marker.setPopupContent(unit.toPopupHtml());
      this._drawRanges(unit);
      this._drawRoute(unit);
    });
  },

  focusUnit(unitId) {
    const marker = this.markers.get(unitId);
    if (!marker) return;
    this.map.setView(marker.getLatLng(), Math.max(this.map.getZoom(), 12));
    marker.openPopup();
    this.selectedId = unitId;
  },

  applyScenario(scenario) {
    this.clear();
    if (scenario.center) {
      this.map.setView([scenario.center.lat, scenario.center.lng], scenario.center.zoom || 10);
    }
    (scenario.units || []).forEach(u => this.addUnit(u));
  },

  toggleRanges() { this.showRanges = !this.showRanges; },
  toggleRoutes() { this.showRoutes = !this.showRoutes; }
};

window.MapController = MapController;
