import type { CombatEvent, Roe, Side, Unit } from "./types";

export function distKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = (b.lat - a.lat) * 111;
  const dLng = (b.lng - a.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

export function isAlive(u: Unit) {
  return u.health > 0;
}

/** Side-wide detection picture: anyone on the side who can sense a target spots it for all. */
export function computeSpotted(units: Unit[]): Record<Side, string[]> {
  const spotted: Record<Side, string[]> = { blue: [], red: [] };
  const add = (side: Side, id: string) => {
    if (!spotted[side].includes(id)) spotted[side].push(id);
  };
  for (const u of units) {
    if (!isAlive(u) || u.detectionRangeKm <= 0) continue;
    for (const t of units) {
      if (!isAlive(t) || t.id === u.id) continue;
      if (t.side === u.side) continue;
      if (distKm(u, t) <= u.detectionRangeKm) add(u.side, t.id);
    }
  }
  return spotted;
}

function stepMovement(u: Unit, dt: number) {
  if (!isAlive(u) || u.speed <= 0 || u.waypoints.length === 0) return;
  if (u.waypointIndex >= u.waypoints.length) {
    if (u.status === "moving") u.status = u.targetId ? "engaged" : "ready";
    return;
  }
  const wp = u.waypoints[u.waypointIndex];
  const dLat = wp.lat - u.lat;
  const dLng = wp.lng - u.lng;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  const step = u.speed * dt;
  if (dist <= step || dist < 0.00005) {
    u.lat = wp.lat;
    u.lng = wp.lng;
    u.waypointIndex += 1;
    if (u.waypointIndex >= u.waypoints.length) {
      u.status = u.targetId ? "engaged" : "ready";
    }
  } else {
    u.lat += (dLat / dist) * step;
    u.lng += (dLng / dist) * step;
    u.status = "moving";
  }
}

function stepReload(u: Unit, dt: number) {
  if (u.magazine <= 0) return;
  if (u.ammo > 0) return;
  u.reloadLeft -= dt;
  u.status = "reloading";
  if (u.reloadLeft <= 0) {
    u.ammo = u.magazine;
    u.reloadLeft = 0;
    if (u.status === "reloading") u.status = "ready";
  }
}

function allowedByRoe(u: Unit, t: Unit, roe: Roe, friendlyFire: boolean): boolean {
  if (roe === "hold") return false;
  if (t.side === u.side) return friendlyFire && roe === "free";
  return true;
}

function pickTarget(
  u: Unit,
  units: Unit[],
  spotted: Record<Side, string[]>,
  roe: Roe,
  friendlyFire: boolean,
): Unit | null {
  if (u.engagementRangeKm <= 0 || u.damage <= 0) return null;
  const seen = spotted[u.side];
  const current = u.targetId ? units.find((x) => x.id === u.targetId) : null;
  if (
    current &&
    isAlive(current) &&
    seen.includes(current.id) &&
    u.canTarget.includes(current.domain) &&
    allowedByRoe(u, current, roe, friendlyFire) &&
    distKm(u, current) <= u.engagementRangeKm
  ) {
    return current;
  }
  let best: Unit | null = null;
  let bestD = Infinity;
  for (const t of units) {
    if (!isAlive(t) || t.id === u.id) continue;
    if (!seen.includes(t.id)) continue; // detection gate
    if (!u.canTarget.includes(t.domain)) continue;
    if (!allowedByRoe(u, t, roe, friendlyFire)) continue;
    const d = distKm(u, t);
    if (d <= u.engagementRangeKm && d < bestD) {
      best = t;
      bestD = d;
    }
  }
  return best;
}

function fire(u: Unit, t: Unit): CombatEvent | null {
  const dealt = Math.min(u.damage, t.health);
  t.health -= dealt;
  u.ammo -= 1;
  if (u.ammo <= 0) {
    u.ammo = 0;
    u.reloadLeft = u.reloadSec;
  }
  if (t.health <= 0) {
    t.health = 0;
    t.status = "destroyed";
    t.targetId = null;
  }
  u.status = "engaged";
  return {
    attackerName: u.name,
    targetName: t.name,
    damage: dealt,
    destroyed: t.health <= 0,
    reason: "hit",
  };
}

export function stepSimulation(
  units: Unit[],
  dt: number,
  opts: { roe: Roe; friendlyFire: boolean },
): { units: Unit[]; events: CombatEvent[]; spotted: Record<Side, string[]> } {
  const next = units.map((u) => ({
    ...u,
    waypoints: u.waypoints.map((w) => ({ ...w })),
    canTarget: [...u.canTarget],
  }));

  for (const u of next) {
    if (!isAlive(u)) continue;
    stepMovement(u, dt);
    stepReload(u, dt);
    u.cooldownLeft = Math.max(0, u.cooldownLeft - dt);
  }

  const spotted = computeSpotted(next);
  const events: CombatEvent[] = [];

  for (const u of next) {
    if (!isAlive(u) || u.damage <= 0 || u.engagementRangeKm <= 0) continue;
    if (u.ammo <= 0) continue;
    const t = pickTarget(u, next, spotted, opts.roe, opts.friendlyFire);
    u.targetId = t ? t.id : null;
    if (!t) continue;
    if (u.cooldownLeft > 0) continue;
    u.cooldownLeft = u.fireCooldownSec;
    const ev = fire(u, t);
    if (ev) events.push(ev);
  }

  return { units: next, events, spotted };
}
