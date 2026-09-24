/**
 * Map controller – OpenStreetMap via Leaflet
 */

let map = null;
const markers = new Map(); // id -> L.Marker

function initMap() {
  map = L.map("map", {
    zoomControl: true,
    attributionControl: true
  }).setView([50.45, 30.52], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
  }).addTo(map);

  // Dark-ish feel with a subtle filter (optional)
  map.getContainer().style.filter = "brightness(0.92) contrast(1.05)";
}

function clearAllMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers.clear();
}

function addUnitToMap(unit) {
  const icon = createLeafletIcon(unit.type, unit.name);
  const marker = L.marker([unit.lat, unit.lng], { icon })
    .addTo(map)
    .bindPopup(`
      <strong>${unit.name}</strong><br/>
      Type: ${unit.type}<br/>
      Side: ${unit.side || "—"}<br/>
      Status: ${unit.status || "—"}<br/>
      ${unit.notes ? unit.notes : ""}
    `);

  markers.set(unit.id, marker);
  return marker;
}

function focusUnit(unitId) {
  const marker = markers.get(unitId);
  if (marker) {
    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 13));
    marker.openPopup();
  }
}

function applyScenario(scenario) {
  clearAllMarkers();
  if (scenario.center) {
    map.setView([scenario.center.lat, scenario.center.lng], scenario.center.zoom || 10);
  }
  scenario.units.forEach(u => addUnitToMap(u));
}

window.initMap = initMap;
window.clearAllMarkers = clearAllMarkers;
window.addUnitToMap = addUnitToMap;
window.focusUnit = focusUnit;
window.applyScenario = applyScenario;
