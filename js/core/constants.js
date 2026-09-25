/**
 * Shared constants — sides, categories, combat target classes, icons, speeds.
 */

const SIDES = Object.freeze({
  BLUE: "blue",
  RED: "red",
  NEUTRAL: "neutral"
});

/** What domain a unit lives in (for targeting rules) */
const DOMAIN = Object.freeze({
  GROUND: "ground",
  AIR: "air",
  NAVAL: "naval",
  FACILITY: "facility"
});

const UNIT_CATEGORY = Object.freeze({
  GROUND: "ground",
  AIR: "air",
  NAVAL: "naval",
  AIR_DEFENSE: "air_defense",
  FACILITY: "facility"
});

const LOCATIONS = Object.freeze({
  kyiv:       { lat: 50.4501, lng: 30.5234, zoom: 11, name: "Kyiv" },
  kiev:       { lat: 50.4501, lng: 30.5234, zoom: 11, name: "Kyiv" },
  moscow:     { lat: 55.7558, lng: 37.6173, zoom: 10, name: "Moscow" },
  taiwan:     { lat: 23.6978, lng: 120.9605, zoom: 8,  name: "Taiwan" },
  taipei:     { lat: 25.0330, lng: 121.5654, zoom: 11, name: "Taipei" },
  berlin:     { lat: 52.5200, lng: 13.4050, zoom: 11, name: "Berlin" },
  baghdad:    { lat: 33.3152, lng: 44.3661, zoom: 11, name: "Baghdad" },
  seoul:      { lat: 37.5665, lng: 126.9780, zoom: 11, name: "Seoul" },
  "south china sea": { lat: 12.0, lng: 114.0, zoom: 6, name: "South China Sea" },
  "black sea":       { lat: 43.0, lng: 34.0,  zoom: 6, name: "Black Sea" },
  "persian gulf":    { lat: 26.5, lng: 51.5,  zoom: 7, name: "Persian Gulf" }
});

/** Simple black monochrome icons */
const UNIT_ICONS = Object.freeze({
  tank: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="14" width="24" height="10" rx="1" fill="#111"/><rect x="8" y="9" width="12" height="6" fill="#111"/><rect x="18" y="11" width="10" height="2" fill="#111"/><circle cx="10" cy="26" r="2.5" fill="#111"/><circle cx="22" cy="26" r="2.5" fill="#111"/></svg>`,
  infantry: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="9" r="5" fill="#111"/><rect x="11" y="14" width="10" height="12" rx="1" fill="#111"/><rect x="7" y="16" width="4" height="8" fill="#111"/><rect x="21" y="16" width="4" height="8" fill="#111"/></svg>`,
  artillery: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="18" width="22" height="7" rx="1" fill="#111"/><rect x="14" y="6" width="4" height="13" fill="#111"/><circle cx="10" cy="27" r="2.5" fill="#111"/><circle cx="22" cy="27" r="2.5" fill="#111"/></svg>`,
  apc: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="13" width="24" height="12" rx="1" fill="#111"/><rect x="8" y="9" width="14" height="5" fill="#111"/><circle cx="10" cy="27" r="2.5" fill="#111"/><circle cx="22" cy="27" r="2.5" fill="#111"/></svg>`,
  fighter: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 3 L26 15 L16 13 L6 15 Z" fill="#111"/><rect x="14" y="13" width="4" height="14" fill="#111"/><path d="M4 18 L16 16 L28 18 L16 20 Z" fill="#111"/></svg>`,
  bomber: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 4 L28 16 L16 14 L4 16 Z" fill="#111"/><rect x="13" y="14" width="6" height="12" fill="#111"/><path d="M2 20 L16 18 L30 20 L16 22 Z" fill="#111"/></svg>`,
  helicopter: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="13" width="20" height="5" rx="1" fill="#111"/><rect x="14" y="7" width="4" height="7" fill="#111"/><line x1="2" y1="9" x2="30" y2="9" stroke="#111" stroke-width="2"/><path d="M9 18 L16 24 L23 18" fill="none" stroke="#111" stroke-width="2"/></svg>`,
  uav: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 5 L24 14 L16 12 L8 14 Z" fill="#111"/><rect x="14" y="12" width="4" height="9" fill="#111"/><circle cx="16" cy="24" r="3" fill="#111"/></svg>`,
  destroyer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M2 24 L6 12 L26 12 L30 24 Z" fill="#111"/><rect x="11" y="7" width="10" height="5" fill="#111"/><rect x="14" y="3" width="4" height="4" fill="#111"/></svg>`,
  frigate: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4 24 L8 14 L24 14 L28 24 Z" fill="#111"/><rect x="12" y="9" width="8" height="5" fill="#111"/></svg>`,
  carrier: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M1 26 L5 10 L27 10 L31 26 Z" fill="#111"/><rect x="7" y="6" width="18" height="4" fill="#111"/><rect x="12" y="2" width="8" height="4" fill="#111"/></svg>`,
  submarine: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="18" rx="14" ry="7" fill="#111"/><rect x="14" y="6" width="4" height="8" fill="#111"/><circle cx="24" cy="16" r="2" fill="#333"/></svg>`,
  sam: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="18" width="18" height="9" rx="1" fill="#111"/><rect x="12" y="5" width="8" height="13" fill="#111"/><circle cx="16" cy="4" r="2.5" fill="#111"/></svg>`,
  shorad: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="17" width="14" height="10" rx="1" fill="#111"/><rect x="13" y="7" width="6" height="10" fill="#111"/><circle cx="16" cy="5" r="2" fill="#111"/></svg>`,
  radar: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="11" fill="none" stroke="#111" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="none" stroke="#111" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="#111"/><line x1="16" y1="5" x2="16" y2="27" stroke="#111" stroke-width="1.5"/></svg>`,
  ciws: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="18" r="9" fill="#111"/><rect x="13" y="5" width="6" height="11" fill="#111"/><circle cx="16" cy="4" r="2" fill="#111"/></svg>`,
  airbase: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="20" width="28" height="7" fill="#111"/><rect x="8" y="11" width="16" height="9" fill="#111"/><path d="M6 20 L16 6 L26 20" fill="none" stroke="#111" stroke-width="2"/></svg>`,
  hq: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="12" width="16" height="14" rx="1" fill="#111"/><polygon points="16,4 22,12 10,12" fill="#111"/><circle cx="16" cy="19" r="2.5" fill="#fff"/></svg>`,
  depot: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="13" width="22" height="14" fill="#111"/><rect x="9" y="7" width="14" height="6" fill="#111"/></svg>`,
  port: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="22" width="28" height="5" fill="#111"/><rect x="7" y="12" width="7" height="10" fill="#111"/><rect x="18" y="8" width="9" height="14" fill="#111"/></svg>`,
  unknown: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="11" fill="#111"/><text x="16" y="21" text-anchor="middle" fill="#fff" font-size="14" font-family="sans-serif">?</text></svg>`
});

/** Degrees per second at 1x (visual scale) */
const DEFAULT_SPEED = Object.freeze({
  tank: 0.0008, infantry: 0.0003, artillery: 0.0004, apc: 0.0007,
  fighter: 0.004, bomber: 0.003, helicopter: 0.002, uav: 0.0025,
  destroyer: 0.0012, frigate: 0.001, carrier: 0.0006, submarine: 0.0008,
  sam: 0, shorad: 0, radar: 0, ciws: 0,
  airbase: 0, hq: 0, depot: 0, port: 0
});

window.SIDES = SIDES;
window.DOMAIN = DOMAIN;
window.UNIT_CATEGORY = UNIT_CATEGORY;
window.LOCATIONS = LOCATIONS;
window.UNIT_ICONS = UNIT_ICONS;
window.DEFAULT_SPEED = DEFAULT_SPEED;
