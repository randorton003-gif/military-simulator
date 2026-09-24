/**
 * Small pure helpers used across the application.
 */

function uid(prefix = "u") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomOffset(range = 0.06) {
  return (Math.random() - 0.5) * range * 2;
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function timestamp() {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

function getIconSvg(type) {
  const key = (type || "unknown").toLowerCase();
  return UNIT_ICONS[key] || UNIT_ICONS.unknown;
}

window.uid = uid;
window.clamp = clamp;
window.randomOffset = randomOffset;
window.capitalize = capitalize;
window.timestamp = timestamp;
window.getIconSvg = getIconSvg;
