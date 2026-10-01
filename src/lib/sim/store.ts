import { create } from "zustand";
import { cloneUnits, createUnit } from "./catalog";
import { computeSpotted, stepSimulation } from "./engine";
import { buildPlan, deployPlan } from "./parser";
import type {
  LogEntry,
  MapCenter,
  MapMode,
  Roe,
  ScenarioPlan,
  Side,
  SimSnapshot,
  Unit,
  UnitType,
} from "./types";
import { uid } from "@/lib/utils";

const MAX_HISTORY = 40;

function snap(s: {
  units: Unit[];
  selectedIds: string[];
  center: MapCenter;
  roe: Roe;
  friendlyFire: boolean;
}): SimSnapshot {
  return {
    units: cloneUnits(s.units),
    selectedIds: [...s.selectedIds],
    center: { ...s.center },
    roe: s.roe,
    friendlyFire: s.friendlyFire,
  };
}

interface SimStore {
  units: Unit[];
  selectedIds: string[];
  center: MapCenter;
  running: boolean;
  speed: 1 | 2;
  showRanges: boolean;
  showRoutes: boolean;
  showDetection: boolean;
  roe: Roe;
  friendlyFire: boolean;
  prompt: string;
  pendingPlan: ScenarioPlan | null;
  logs: LogEntry[];
  history: SimSnapshot[];
  future: SimSnapshot[];
  mode: MapMode;
  addType: UnitType;
  addSide: Side;
  spotted: Record<Side, string[]>;
  simTime: number;

  log: (text: string, level?: LogEntry["level"]) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  setPrompt: (v: string) => void;
  appendPromptClause: (clause: string) => void;
  parseForReview: () => void;
  cancelPlan: () => void;
  confirmPlan: () => void;
  play: () => void;
  pause: () => void;
  toggleSpeed: () => void;
  setRoe: (roe: Roe) => void;
  setFriendlyFire: (v: boolean) => void;
  toggleRanges: () => void;
  toggleRoutes: () => void;
  toggleDetection: () => void;
  setMode: (m: MapMode) => void;
  setAddType: (t: UnitType) => void;
  setAddSide: (s: Side) => void;
  select: (id: string | null, additive?: boolean) => void;
  selectMany: (ids: string[]) => void;
  clearSelection: () => void;
  addUnitAt: (lat: number, lng: number) => void;
  addWaypointAt: (lat: number, lng: number) => void;
  moveUnit: (id: string, lat: number, lng: number) => void;
  deleteSelected: () => void;
  clearWaypointsSelected: () => void;
  patchUnit: (id: string, patch: Partial<Unit>) => void;
  tick: (dt: number) => void;
  clearAll: () => void;
}

const seedPlan = buildPlan(
  "2 blue tanks stationed west of Kyiv; 1 blue sam stationed covering the western approach; 2 red tanks advance from the east toward the city",
);

export const useSim = create<SimStore>((set, get) => ({
  units: [],
  selectedIds: [],
  center: seedPlan.center,
  running: false,
  speed: 1,
  showRanges: true,
  showRoutes: true,
  showDetection: true,
  roe: "tight",
  friendlyFire: false,
  prompt: seedPlan.prompt,
  pendingPlan: seedPlan,
  logs: [],
  history: [],
  future: [],
  mode: "select",
  addType: "tank",
  addSide: "blue",
  spotted: { blue: [], red: [] },
  simTime: 0,

  log: (text, level = "info") =>
    set((s) => ({
      logs: [{ id: uid("l"), ts: Date.now(), level, text }, ...s.logs].slice(0, 80),
    })),

  pushHistory: () => {
    const s = get();
    set({
      history: [...s.history, snap(s)].slice(-MAX_HISTORY),
      future: [],
    });
  },

  undo: () => {
    const s = get();
    const prev = s.history[s.history.length - 1];
    if (!prev) return;
    set({
      history: s.history.slice(0, -1),
      future: [snap(s), ...s.future].slice(0, MAX_HISTORY),
      units: cloneUnits(prev.units),
      selectedIds: [...prev.selectedIds],
      center: { ...prev.center },
      roe: prev.roe,
      friendlyFire: prev.friendlyFire,
      spotted: computeSpotted(prev.units),
      running: false,
    });
    get().log("Undo", "warn");
  },

  redo: () => {
    const s = get();
    const next = s.future[0];
    if (!next) return;
    set({
      future: s.future.slice(1),
      history: [...s.history, snap(s)].slice(-MAX_HISTORY),
      units: cloneUnits(next.units),
      selectedIds: [...next.selectedIds],
      center: { ...next.center },
      roe: next.roe,
      friendlyFire: next.friendlyFire,
      spotted: computeSpotted(next.units),
      running: false,
    });
    get().log("Redo", "info");
  },

  setPrompt: (v) => set({ prompt: v }),

  appendPromptClause: (clause) =>
    set((s) => ({
      prompt: s.prompt.trim() ? `${s.prompt.trim()}; ${clause}` : clause,
    })),

  parseForReview: () => {
    const plan = buildPlan(get().prompt);
    set({ pendingPlan: plan, running: false });
    get().log(
      plan.total === 0
        ? "Parser found no named units"
        : `Plan: ${plan.total} units — confirm to deploy`,
      plan.total === 0 ? "warn" : "info",
    );
  },

  cancelPlan: () => set({ pendingPlan: null }),

  confirmPlan: () => {
    const plan = get().pendingPlan;
    if (!plan) return;
    get().pushHistory();
    const units = deployPlan(plan);
    set({
      units,
      center: plan.center,
      pendingPlan: null,
      selectedIds: [],
      spotted: computeSpotted(units),
      simTime: 0,
    });
    get().log(`Deployed ${units.length} units (parser is source of truth)`, "success");
  },

  play: () => set({ running: true }),
  pause: () => set({ running: false }),
  toggleSpeed: () => set((s) => ({ speed: s.speed === 1 ? 2 : 1 })),
  setRoe: (roe) => {
    get().pushHistory();
    set({ roe });
    get().log(`ROE → ${roe}`, "info");
  },
  setFriendlyFire: (v) => {
    get().pushHistory();
    set({ friendlyFire: v });
    get().log(`Friendly fire ${v ? "ON" : "OFF"}`, "warn");
  },
  toggleRanges: () => set((s) => ({ showRanges: !s.showRanges })),
  toggleRoutes: () => set((s) => ({ showRoutes: !s.showRoutes })),
  toggleDetection: () => set((s) => ({ showDetection: !s.showDetection })),
  setMode: (m) => set({ mode: m }),
  setAddType: (t) => set({ addType: t }),
  setAddSide: (s) => set({ addSide: s }),

  select: (id, additive) => {
    if (!id) {
      set({ selectedIds: [] });
      return;
    }
    set((s) => {
      if (additive) {
        return s.selectedIds.includes(id)
          ? { selectedIds: s.selectedIds.filter((x) => x !== id) }
          : { selectedIds: [...s.selectedIds, id] };
      }
      return { selectedIds: [id] };
    });
  },

  selectMany: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  addUnitAt: (lat, lng) => {
    const s = get();
    s.pushHistory();
    const u = createUnit(s.addType, {
      side: s.addSide,
      lat,
      lng,
      name: `${s.addSide.toUpperCase()} ${s.addType}-${s.units.length + 1}`,
      notes: "Placed on map",
    });
    set({ units: [...s.units, u], selectedIds: [u.id] });
    s.log(`Added ${u.name}`, "success");
  },

  addWaypointAt: (lat, lng) => {
    const s = get();
    const ids = s.selectedIds;
    if (ids.length === 0) {
      s.log("Select one or more mobile units first", "warn");
      return;
    }
    s.pushHistory();
    set({
      units: s.units.map((u) => {
        if (!ids.includes(u.id) || u.speed <= 0) return u;
        return {
          ...u,
          waypoints: [...u.waypoints, { lat, lng }],
          status: "moving" as const,
        };
      }),
    });
    s.log(`Waypoint added to ${ids.length} unit(s)`, "info");
  },

  moveUnit: (id, lat, lng) => {
    set((s) => ({
      units: s.units.map((u) =>
        u.id === id ? { ...u, lat, lng, startLat: lat, startLng: lng } : u,
      ),
    }));
  },

  deleteSelected: () => {
    const s = get();
    if (s.selectedIds.length === 0) {
      s.log("Nothing selected", "warn");
      return;
    }
    s.pushHistory();
    const n = s.selectedIds.length;
    set({
      units: s.units.filter((u) => !s.selectedIds.includes(u.id)),
      selectedIds: [],
    });
    s.log(`Deleted ${n} unit(s)`, "warn");
  },

  clearWaypointsSelected: () => {
    const s = get();
    if (s.selectedIds.length === 0) return;
    s.pushHistory();
    set({
      units: s.units.map((u) =>
        s.selectedIds.includes(u.id)
          ? { ...u, waypoints: [], waypointIndex: 0, status: u.status === "moving" ? "ready" : u.status }
          : u,
      ),
    });
    s.log("Cleared waypoints on selection", "info");
  },

  patchUnit: (id, patch) => {
    get().pushHistory();
    set((s) => ({
      units: s.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
  },

  tick: (dt) => {
    const s = get();
    if (!s.running) return;
    const { units, events, spotted } = stepSimulation(s.units, dt * s.speed, {
      roe: s.roe,
      friendlyFire: s.friendlyFire,
    });
    const extra: LogEntry[] = events.map((e) => ({
      id: uid("c"),
      ts: Date.now(),
      level: e.destroyed ? "warn" : "info",
      text: e.destroyed
        ? `${e.attackerName} destroyed ${e.targetName}`
        : `${e.attackerName} hit ${e.targetName} (${e.damage.toFixed(0)})`,
    }));
    set({
      units,
      spotted,
      simTime: s.simTime + dt * s.speed,
      logs: extra.length ? [...extra, ...s.logs].slice(0, 80) : s.logs,
    });
  },

  clearAll: () => {
    get().pushHistory();
    set({ units: [], selectedIds: [], spotted: { blue: [], red: [] }, running: false });
    get().log("Map cleared", "warn");
  },
}));
