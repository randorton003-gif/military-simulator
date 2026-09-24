/**
 * Shared constants and enumerations.
 * Single source of truth for sides, categories, and icon SVGs.
 */

const SIDES = Object.freeze({
  BLUE: "blue",
  RED: "red",
  NEUTRAL: "neutral"
});

const UNIT_CATEGORY = Object.freeze({
  GROUND: "ground",
  AIR: "air",
  NAVAL: "naval",
  AIR_DEFENSE: "air_defense",
  FACILITY: "facility"
});

/** Default map centers for known locations */
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

/** SVG icons keyed by unit type */
const UNIT_ICONS = Object.freeze({
  // Ground
  tank: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="18" width="28" height="12" rx="2" fill="#4a7c59"/><rect x="10" y="12" width="14" height="8" rx="1" fill="#3d6b4a"/><rect x="22" y="14" width="12" height="3" fill="#2d5a3a"/><circle cx="12" cy="32" r="3" fill="#222"/><circle cx="28" cy="32" r="3" fill="#222"/></svg>`,
  infantry: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="12" r="6" fill="#5a7a9a"/><rect x="14" y="18" width="12" height="14" rx="2" fill="#4a6a8a"/><rect x="10" y="20" width="4" height="10" fill="#3a5a7a"/><rect x="26" y="20" width="4" height="10" fill="#3a5a7a"/></svg>`,
  artillery: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="22" width="24" height="8" rx="1" fill="#7a5a3a"/><rect x="18" y="10" width="4" height="14" fill="#6a4a2a"/><circle cx="12" cy="32" r="3" fill="#222"/><circle cx="28" cy="32" r="3" fill="#222"/></svg>`,
  apc: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="16" width="28" height="14" rx="2" fill="#5a6a4a"/><rect x="10" y="12" width="16" height="6" rx="1" fill="#4a5a3a"/><circle cx="12" cy="32" r="3" fill="#222"/><circle cx="28" cy="32" r="3" fill="#222"/></svg>`,

  // Air
  fighter: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 4 L30 18 L20 16 L10 18 Z" fill="#5a8aaa"/><rect x="18" y="16" width="4" height="16" fill="#4a7a9a"/><path d="M6 22 L20 20 L34 22 L20 24 Z" fill="#3a6a8a"/></svg>`,
  bomber: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 6 L32 20 L20 18 L8 20 Z" fill="#6a7a9a"/><rect x="17" y="18" width="6" height="14" fill="#5a6a8a"/><path d="M4 24 L20 22 L36 24 L20 26 Z" fill="#4a5a7a"/></svg>`,
  helicopter: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="16" width="24" height="6" rx="1" fill="#6a5a8a"/><rect x="18" y="10" width="4" height="8" fill="#5a4a7a"/><line x1="4" y1="12" x2="36" y2="12" stroke="#4a3a6a" stroke-width="2"/><path d="M12 22 L20 28 L28 22" fill="none" stroke="#4a3a6a" stroke-width="2"/></svg>`,
  uav: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 8 L28 18 L20 16 L12 18 Z" fill="#7a9aaa"/><rect x="18" y="16" width="4" height="10" fill="#6a8a9a"/><circle cx="20" cy="28" r="3" fill="#5a7a8a"/></svg>`,

  // Naval
  destroyer: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M4 28 L8 16 L32 16 L36 28 Z" fill="#3a5a7a"/><rect x="14" y="10" width="12" height="6" fill="#2a4a6a"/><rect x="18" y="6" width="4" height="4" fill="#1a3a5a"/></svg>`,
  frigate: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M6 28 L10 18 L30 18 L34 28 Z" fill="#3a5a7a"/><rect x="15" y="12" width="10" height="6" fill="#2a4a6a"/></svg>`,
  carrier: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M2 30 L6 14 L34 14 L38 30 Z" fill="#2a4a6a"/><rect x="8" y="10" width="24" height="4" fill="#1a3a5a"/><rect x="16" y="6" width="8" height="4" fill="#0a2a4a"/></svg>`,
  submarine: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="22" rx="16" ry="8" fill="#2a3a4a"/><rect x="18" y="10" width="4" height="8" fill="#1a2a3a"/><circle cx="28" cy="20" r="2" fill="#4a6a8a"/></svg>`,

  // Air Defense
  sam: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="22" width="20" height="10" rx="1" fill="#8a4a3a"/><rect x="16" y="8" width="8" height="14" fill="#7a3a2a"/><circle cx="20" cy="6" r="3" fill="#f0a040"/></svg>`,
  shorad: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="20" width="16" height="12" rx="1" fill="#9a5a3a"/><rect x="17" y="10" width="6" height="10" fill="#8a4a2a"/><circle cx="20" cy="8" r="2" fill="#f0c040"/></svg>`,
  radar: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="12" fill="none" stroke="#4a9aaa" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="none" stroke="#3a8a9a" stroke-width="2"/><circle cx="20" cy="20" r="2" fill="#2a7a8a"/><line x1="20" y1="8" x2="20" y2="32" stroke="#4a9aaa" stroke-width="1"/></svg>`,
  ciws: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="22" r="10" fill="#6a4a3a"/><rect x="17" y="8" width="6" height="12" fill="#5a3a2a"/><circle cx="20" cy="6" r="2" fill="#f08040"/></svg>`,

  // Facilities
  airbase: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="24" width="32" height="8" fill="#4a5a6a"/><rect x="10" y="14" width="20" height="10" fill="#3a4a5a"/><path d="M8 24 L20 10 L32 24" fill="none" stroke="#5a7a9a" stroke-width="2"/></svg>`,
  hq: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="14" width="20" height="16" rx="2" fill="#8a6a3a"/><polygon points="20,6 26,14 14,14" fill="#7a5a2a"/><circle cx="20" cy="22" r="3" fill="#f0c040"/></svg>`,
  depot: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="16" width="24" height="16" fill="#5a5a4a"/><rect x="12" y="10" width="16" height="6" fill="#4a4a3a"/></svg>`,
  port: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="26" width="32" height="6" fill="#3a5a7a"/><rect x="10" y="16" width="8" height="10" fill="#2a4a6a"/><rect x="22" y="12" width="10" height="14" fill="#2a4a6a"/></svg>`,

  unknown: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="12" fill="#555"/><text x="20" y="25" text-anchor="middle" fill="#fff" font-size="16">?</text></svg>`
});

window.SIDES = SIDES;
window.UNIT_CATEGORY = UNIT_CATEGORY;
window.LOCATIONS = LOCATIONS;
window.UNIT_ICONS = UNIT_ICONS;
