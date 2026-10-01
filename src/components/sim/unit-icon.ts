import type { UnitType } from "@/lib/sim/types";

const ICONS: Record<UnitType, string> = {
  tank: `<svg viewBox="0 0 32 32"><rect x="4" y="14" width="24" height="10" rx="1" fill="#111"/><rect x="8" y="9" width="12" height="6" fill="#111"/><circle cx="10" cy="26" r="2.5" fill="#111"/><circle cx="22" cy="26" r="2.5" fill="#111"/></svg>`,
  infantry: `<svg viewBox="0 0 32 32"><circle cx="16" cy="9" r="5" fill="#111"/><rect x="11" y="14" width="10" height="12" rx="1" fill="#111"/></svg>`,
  artillery: `<svg viewBox="0 0 32 32"><rect x="5" y="18" width="22" height="7" rx="1" fill="#111"/><rect x="14" y="6" width="4" height="13" fill="#111"/></svg>`,
  apc: `<svg viewBox="0 0 32 32"><rect x="4" y="13" width="24" height="12" rx="1" fill="#111"/><rect x="8" y="9" width="14" height="5" fill="#111"/></svg>`,
  fighter: `<svg viewBox="0 0 32 32"><path d="M16 3 L26 15 L16 13 L6 15 Z" fill="#111"/><rect x="14" y="13" width="4" height="14" fill="#111"/></svg>`,
  bomber: `<svg viewBox="0 0 32 32"><path d="M16 4 L28 16 L16 14 L4 16 Z" fill="#111"/><rect x="13" y="14" width="6" height="12" fill="#111"/></svg>`,
  helicopter: `<svg viewBox="0 0 32 32"><rect x="6" y="13" width="20" height="5" rx="1" fill="#111"/><line x1="2" y1="9" x2="30" y2="9" stroke="#111" stroke-width="2"/></svg>`,
  uav: `<svg viewBox="0 0 32 32"><path d="M16 5 L24 14 L16 12 L8 14 Z" fill="#111"/><circle cx="16" cy="24" r="3" fill="#111"/></svg>`,
  destroyer: `<svg viewBox="0 0 32 32"><path d="M2 24 L6 12 L26 12 L30 24 Z" fill="#111"/><rect x="11" y="7" width="10" height="5" fill="#111"/></svg>`,
  frigate: `<svg viewBox="0 0 32 32"><path d="M4 24 L8 14 L24 14 L28 24 Z" fill="#111"/></svg>`,
  carrier: `<svg viewBox="0 0 32 32"><path d="M1 26 L5 10 L27 10 L31 26 Z" fill="#111"/></svg>`,
  submarine: `<svg viewBox="0 0 32 32"><ellipse cx="16" cy="18" rx="14" ry="7" fill="#111"/><rect x="14" y="6" width="4" height="8" fill="#111"/></svg>`,
  sam: `<svg viewBox="0 0 32 32"><rect x="7" y="18" width="18" height="9" rx="1" fill="#111"/><rect x="12" y="5" width="8" height="13" fill="#111"/></svg>`,
  shorad: `<svg viewBox="0 0 32 32"><rect x="9" y="17" width="14" height="10" rx="1" fill="#111"/><rect x="13" y="7" width="6" height="10" fill="#111"/></svg>`,
  radar: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="none" stroke="#111" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="none" stroke="#111" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="#111"/></svg>`,
  ciws: `<svg viewBox="0 0 32 32"><circle cx="16" cy="18" r="9" fill="#111"/><rect x="13" y="5" width="6" height="11" fill="#111"/></svg>`,
  airbase: `<svg viewBox="0 0 32 32"><rect x="2" y="20" width="28" height="7" fill="#111"/><rect x="8" y="11" width="16" height="9" fill="#111"/></svg>`,
  hq: `<svg viewBox="0 0 32 32"><rect x="8" y="12" width="16" height="14" rx="1" fill="#111"/><polygon points="16,4 22,12 10,12" fill="#111"/></svg>`,
  depot: `<svg viewBox="0 0 32 32"><rect x="5" y="13" width="22" height="14" fill="#111"/><rect x="9" y="7" width="14" height="6" fill="#111"/></svg>`,
  port: `<svg viewBox="0 0 32 32"><rect x="2" y="22" width="28" height="5" fill="#111"/><rect x="18" y="8" width="9" height="14" fill="#111"/></svg>`,
};

export function unitIconSvg(type: UnitType) {
  return ICONS[type] ?? ICONS.tank;
}
