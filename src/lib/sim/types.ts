export type Side = "blue" | "red";
export type Domain = "ground" | "air" | "naval" | "facility";
export type Roe = "hold" | "tight" | "free";
export type MapMode = "select" | "add" | "waypoint";

export type UnitType =
  | "tank"
  | "infantry"
  | "artillery"
  | "apc"
  | "fighter"
  | "bomber"
  | "helicopter"
  | "uav"
  | "destroyer"
  | "frigate"
  | "carrier"
  | "submarine"
  | "sam"
  | "shorad"
  | "radar"
  | "ciws"
  | "airbase"
  | "hq"
  | "depot"
  | "port";

export type UnitStatus = "ready" | "moving" | "engaged" | "reloading" | "destroyed";

export interface Waypoint {
  lat: number;
  lng: number;
}

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  domain: Domain;
  side: Side;
  lat: number;
  lng: number;
  startLat: number;
  startLng: number;
  status: UnitStatus;
  notes: string;
  speed: number;
  waypoints: Waypoint[];
  waypointIndex: number;
  maxHealth: number;
  health: number;
  damage: number;
  canTarget: Domain[];
  detectionRangeKm: number;
  engagementRangeKm: number;
  fireCooldownSec: number;
  cooldownLeft: number;
  magazine: number;
  ammo: number;
  reloadSec: number;
  reloadLeft: number;
  targetId: string | null;
}

export interface CatalogEntry {
  type: UnitType;
  domain: Domain;
  label: string;
  tokens: string[];
  immobile: boolean;
  speed: number;
  maxHealth: number;
  damage: number;
  canTarget: Domain[];
  detectionRangeKm: number;
  engagementRangeKm: number;
  fireCooldownSec: number;
  magazine: number;
  reloadSec: number;
}

export interface MapCenter {
  lat: number;
  lng: number;
  zoom: number;
  name: string;
}

export interface PlannedUnit {
  type: UnitType;
  side: Side;
  count: number;
  stationed: boolean;
  clause: string;
}

export interface ScenarioPlan {
  title: string;
  summary: string;
  center: MapCenter;
  groups: PlannedUnit[];
  total: number;
  prompt: string;
}

export interface CombatEvent {
  attackerName: string;
  targetName: string;
  damage: number;
  destroyed: boolean;
  reason: "hit" | "nodetect" | "noroe" | "empty";
}

export interface LogEntry {
  id: string;
  ts: number;
  level: "info" | "success" | "warn";
  text: string;
}

export interface SimSnapshot {
  units: Unit[];
  selectedIds: string[];
  center: MapCenter;
  roe: Roe;
  friendlyFire: boolean;
}
