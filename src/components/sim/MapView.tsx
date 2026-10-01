import { useEffect, useRef, useState } from "react";
import type { Map as LMap, Marker, Circle, Polyline } from "leaflet";
import { FORCE_HEX } from "@/lib/sim/catalog";
import { useSim } from "@/lib/sim/store";
import { unitIconSvg } from "./unit-icon";
import type { Unit } from "@/lib/sim/types";

function markerHtml(u: Unit, selected: boolean) {
  const border = FORCE_HEX[u.side];
  const hp = Math.max(0, u.health / u.maxHealth);
  const dead = u.health <= 0;
  return `<div class="mil ${selected ? "sel" : ""} ${dead ? "dead" : ""}">
    <div class="mil-bg" style="border-color:${border}">${unitIconSvg(u.type)}</div>
    <div class="hp"><i style="width:${hp * 100}%"></i></div>
    <span class="mil-n">${u.name}</span>
  </div>`;
}

export function MapView() {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const layers = useRef({
    markers: new Map<string, Marker>(),
    ranges: new Map<string, Circle[]>(),
    routes: new Map<string, Polyline>(),
  });
  const Lref = useRef<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(0);

  const units = useSim((s) => s.units);
  const center = useSim((s) => s.center);
  const selectedIds = useSim((s) => s.selectedIds);
  const showRanges = useSim((s) => s.showRanges);
  const showDetection = useSim((s) => s.showDetection);
  const showRoutes = useSim((s) => s.showRoutes);
  const mode = useSim((s) => s.mode);

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    let cancelled = false;
    void import("leaflet").then((mod) => {
      if (cancelled || !host.current) return;
      const L = ((mod as { default?: typeof import("leaflet") }).default ?? mod) as typeof import("leaflet");
      Lref.current = L;
      const map = L.map(host.current, { zoomControl: true, attributionControl: true }).setView(
        [center.lat, center.lng],
        center.zoom,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);
      map.getContainer().style.filter = "brightness(0.92) contrast(1.04)";
      map.on("click", (e) => {
        const st = useSim.getState();
        if (st.mode === "add") st.addUnitAt(e.latlng.lat, e.latlng.lng);
        else if (st.mode === "waypoint") st.addWaypointAt(e.latlng.lat, e.latlng.lng);
        else if (!(e.originalEvent as MouseEvent).shiftKey && !(e.originalEvent as MouseEvent).metaKey) {
          st.clearSelection();
        }
      });
      mapRef.current = map;
      const recenter = () => {
        map.invalidateSize();
        map.setView([useSim.getState().center.lat, useSim.getState().center.lng], useSim.getState().center.zoom);
      };
      requestAnimationFrame(recenter);
      map.whenReady(recenter);
      setReady((n) => n + 1);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const el = host.current;
    if (!map || !el) return;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.lat, center.lng], center.zoom);
  }, [center.lat, center.lng, center.zoom, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getContainer().style.cursor = mode === "select" ? "" : "crosshair";
  }, [mode, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const L = Lref.current;
    if (!map || !L) return;
    const { markers, ranges, routes } = layers.current;
    const ids = new Set(units.map((u) => u.id));

    markers.forEach((m, id) => {
      if (!ids.has(id)) {
        map.removeLayer(m);
        markers.delete(id);
      }
    });
    ranges.forEach((arr, id) => {
      if (!ids.has(id)) {
        arr.forEach((c) => map.removeLayer(c));
        ranges.delete(id);
      }
    });
    routes.forEach((p, id) => {
      if (!ids.has(id)) {
        map.removeLayer(p);
        routes.delete(id);
      }
    });

    units.forEach((u) => {
      const selected = selectedIds.includes(u.id);
      const icon = L.divIcon({
        className: "mil-marker",
        html: markerHtml(u, selected),
        iconSize: [40, 52],
        iconAnchor: [20, 40],
      });
      let marker = markers.get(u.id);
      if (!marker) {
        const id = u.id;
        marker = L.marker([u.lat, u.lng], { icon, draggable: true }).addTo(map);
        marker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          const ev = e.originalEvent as MouseEvent;
          useSim.getState().select(id, ev.shiftKey || ev.metaKey || ev.ctrlKey);
        });
        marker.on("dragstart", () => useSim.getState().pushHistory());
        marker.on("dragend", (e) => {
          const ll = (e.target as Marker).getLatLng();
          useSim.getState().moveUnit(id, ll.lat, ll.lng);
        });
        markers.set(u.id, marker);
      } else {
        marker.setLatLng([u.lat, u.lng]);
        marker.setIcon(icon);
      }

      const oldR = ranges.get(u.id) ?? [];
      oldR.forEach((c) => map.removeLayer(c));
      const nextR: Circle[] = [];
      const color = FORCE_HEX[u.side];
      if (u.health > 0) {
        if (showDetection && u.detectionRangeKm > 0) {
          nextR.push(
            L.circle([u.lat, u.lng], {
              radius: u.detectionRangeKm * 1000,
              color,
              weight: 1,
              dashArray: "6 4",
              fillColor: color,
              fillOpacity: 0.03,
              interactive: false,
            }).addTo(map),
          );
        }
        if (showRanges && u.engagementRangeKm > 0) {
          nextR.push(
            L.circle([u.lat, u.lng], {
              radius: u.engagementRangeKm * 1000,
              color,
              weight: 1.5,
              fillColor: color,
              fillOpacity: 0.07,
              interactive: false,
            }).addTo(map),
          );
        }
      }
      ranges.set(u.id, nextR);

      const oldP = routes.get(u.id);
      if (oldP) map.removeLayer(oldP);
      if (showRoutes && u.waypoints.length) {
        const line = L.polyline(
          [[u.lat, u.lng], ...u.waypoints.map((w) => [w.lat, w.lng] as [number, number])],
          { color, weight: 2, dashArray: "4 6", opacity: 0.75 },
        ).addTo(map);
        routes.set(u.id, line);
      } else {
        routes.delete(u.id);
      }
    });
  }, [units, selectedIds, showRanges, showDetection, showRoutes, ready]);

  return <div ref={host} className="absolute inset-0 bg-background" />;
}
