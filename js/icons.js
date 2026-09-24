/**
 * Procedural military unit icons (SVG).
 * The AI can request any of these types; unknown types fall back to "unknown".
 */
const UNIT_ICONS = {
  tank: `
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="18" width="28" height="12" rx="2" fill="#4a7c59"/>
      <rect x="10" y="12" width="14" height="8" rx="1" fill="#3d6b4a"/>
      <rect x="22" y="14" width="12" height="3" fill="#2d5a3a"/>
      <circle cx="12" cy="32" r="3" fill="#222"/>
      <circle cx="28" cy="32" r="3" fill="#222"/>
    </svg>`,
  infantry: `
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="12" r="6" fill="#5a7a9a"/>
      <rect x="14" y="18" width="12" height="14" rx="2" fill="#4a6a8a"/>
      <rect x="10" y="20" width="4" height="10" fill="#3a5a7a"/>
      <rect x="26" y="20" width="4" height="10" fill="#3a5a7a"/>
    </svg>`,
  artillery: `
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="22" width="24" height="8" rx="1" fill="#7a5a3a"/>
      <rect x="18" y="10" width="4" height="14" fill="#6a4a2a"/>
      <circle cx="12" cy="32" r="3" fill="#222"/>
      <circle cx="28" cy="32" r="3" fill="#222"/>
    </svg>`,
  aircraft: `
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6 L28 18 L20 16 L12 18 Z" fill="#5a8aaa"/>
      <rect x="18" y="16" width="4" height="14" fill="#4a7a9a"/>
      <path d="M8 22 L20 20 L32 22 L20 24 Z" fill="#3a6a8a"/>
    </svg>`,
  ship: `
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 28 L10 18 L30 18 L34 28 Z" fill="#3a5a7a"/>
      <rect x="14" y="12" width="12" height="6" fill="#2a4a6a"/>
      <rect x="18" y="6" width="4" height="6" fill="#1a3a5a"/>
    </svg>`,
  helicopter: `
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="16" width="24" height="6" rx="1" fill="#6a5a8a"/>
      <rect x="18" y="10" width="4" height="8" fill="#5a4a7a"/>
      <line x1="4" y1="12" x2="36" y2="12" stroke="#4a3a6a" stroke-width="2"/>
      <path d="M12 22 L20 28 L28 22" fill="none" stroke="#4a3a6a" stroke-width="2"/>
    </svg>`,
  command: `
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="14" width="20" height="16" rx="2" fill="#8a6a3a"/>
      <polygon points="20,6 26,14 14,14" fill="#7a5a2a"/>
      <circle cx="20" cy="22" r="3" fill="#f0c040"/>
    </svg>`,
  unknown: `
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12" fill="#555"/>
      <text x="20" y="25" text-anchor="middle" fill="#fff" font-size="16">?</text>
    </svg>`
};

function getUnitIconSvg(type) {
  const key = (type || "unknown").toLowerCase();
  return UNIT_ICONS[key] || UNIT_ICONS.unknown;
}

/** Create a Leaflet DivIcon from a unit type */
function createLeafletIcon(type, label) {
  const svg = getUnitIconSvg(type);
  const html = `
    <div class="mil-icon" title="${label || type}">
      ${svg}
      <span class="mil-label">${label || ""}</span>
    </div>`;
  return L.divIcon({
    className: "mil-marker",
    html,
    iconSize: [40, 48],
    iconAnchor: [20, 40],
    popupAnchor: [0, -36]
  });
}

// Inject minimal styles for the markers
(function injectIconStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .mil-marker { background: transparent !important; border: none !important; }
    .mil-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.7));
    }
    .mil-icon svg { width: 36px; height: 36px; }
    .mil-label {
      font-size: 10px;
      color: #fff;
      background: rgba(0,0,0,0.65);
      padding: 1px 4px;
      border-radius: 3px;
      margin-top: 2px;
      white-space: nowrap;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;
  document.head.appendChild(style);
})();
