import type { MapCenter } from "./types";

export const LOCATIONS: Record<string, MapCenter> = {
  kyiv: { lat: 50.4501, lng: 30.5234, zoom: 11, name: "Kyiv" },
  kiev: { lat: 50.4501, lng: 30.5234, zoom: 11, name: "Kyiv" },
  moscow: { lat: 55.7558, lng: 37.6173, zoom: 10, name: "Moscow" },
  taiwan: { lat: 23.6978, lng: 120.9605, zoom: 8, name: "Taiwan" },
  taipei: { lat: 25.033, lng: 121.5654, zoom: 11, name: "Taipei" },
  berlin: { lat: 52.52, lng: 13.405, zoom: 11, name: "Berlin" },
  baghdad: { lat: 33.3152, lng: 44.3661, zoom: 11, name: "Baghdad" },
  seoul: { lat: 37.5665, lng: 126.978, zoom: 11, name: "Seoul" },
  london: { lat: 51.5074, lng: -0.1278, zoom: 11, name: "London" },
  "south china sea": { lat: 12, lng: 114, zoom: 6, name: "South China Sea" },
  "black sea": { lat: 43, lng: 34, zoom: 6, name: "Black Sea" },
  "persian gulf": { lat: 26.5, lng: 51.5, zoom: 7, name: "Persian Gulf" },
};

export const DEFAULT_CENTER: MapCenter = LOCATIONS.kyiv;

export function resolveCenter(text: string): MapCenter {
  const lower = text.toLowerCase();
  const coord = lower.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  for (const [key, loc] of Object.entries(LOCATIONS)) {
    if (lower.includes(key)) {
      if (coord) {
        return {
          ...loc,
          lat: Number(coord[1]),
          lng: Number(coord[2]),
        };
      }
      return { ...loc };
    }
  }
  if (coord) {
    return {
      lat: Number(coord[1]),
      lng: Number(coord[2]),
      zoom: 10,
      name: "Named coordinates",
    };
  }
  return { ...DEFAULT_CENTER };
}
