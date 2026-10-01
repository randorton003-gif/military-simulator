import { CATALOG, TYPE_TOKEN_LIST, createUnit } from "./catalog";
import { resolveCenter } from "./locations";
import { clamp } from "@/lib/utils";
import type { PlannedUnit, ScenarioPlan, Side, Unit, UnitType } from "./types";

const SIDE_RE = /\b(blue|red|friendly|enemy|hostile|defender|attacker|allied)\b/i;
const MOVE_RE =
  /\b(advance|attack|transit|move|moving|patrol|cap|route|toward|towards|from the east|from the west)\b/i;
const HOLD_RE =
  /\b(stationed|hold|holding|defend|defending|garrison|emplaced|fixed|static|covering)\b/i;

function sideFrom(text: string, fallback: Side = "blue"): Side {
  const m = text.match(SIDE_RE);
  if (!m) return fallback;
  const w = m[1].toLowerCase();
  if (w === "red" || w === "enemy" || w === "hostile" || w === "attacker") return "red";
  return "blue";
}

function findType(clause: string): { type: UnitType; token: string } | null {
  const lower = clause.toLowerCase();
  for (const { token, type } of TYPE_TOKEN_LIST) {
    const re = new RegExp(`\\b${token}\\b`, "i");
    if (re.test(lower)) return { type, token };
  }
  return null;
}

function countFor(clause: string, token: string): number {
  const re = new RegExp(
    `(\\d+)\\s+(?:(?:blue|red|friendly|enemy|hostile|defender|attacker|allied)\\s+)*${token}\\b`,
    "i",
  );
  const m = clause.match(re);
  if (m) return clamp(parseInt(m[1], 10), 1, 16);
  return 1;
}

/** Phrase parser is the source of truth for which units exist. */
export function parseUnitMentions(text: string): PlannedUnit[] {
  const clauses = text
    .split(/;|\n/)
    .map((c) => c.trim())
    .filter(Boolean);
  if (clauses.length === 0 && text.trim()) clauses.push(text.trim());

  const groups: PlannedUnit[] = [];

  for (const clause of clauses) {
    const hit = findType(clause);
    if (!hit) continue;
    const count = countFor(clause, hit.token);
    const side = sideFrom(clause);
    const moving = MOVE_RE.test(clause);
    const holding = HOLD_RE.test(clause) || CATALOG[hit.type].immobile;
    const stationed = moving ? false : holding || CATALOG[hit.type].immobile;
    groups.push({ type: hit.type, side, count, stationed, clause });
  }

  return groups;
}

export function buildPlan(prompt: string): ScenarioPlan {
  const groups = parseUnitMentions(prompt);
  const center = resolveCenter(prompt);
  const total = groups.reduce((s, g) => s + g.count, 0);
  const summary =
    total === 0
      ? "No named units — nothing will deploy"
      : groups.map((g) => `${g.count} ${g.side} ${g.type} (${g.stationed ? "stationed" : "moving"})`).join(" · ");
  return {
    title: `Operation — ${center.name}`,
    summary,
    center,
    groups,
    total,
    prompt: prompt.trim(),
  };
}

export function deployPlan(plan: ScenarioPlan): Unit[] {
  const units: Unit[] = [];
  let seq = 1;
  const { center } = plan;

  plan.groups.forEach((g) => {
    for (let i = 0; i < g.count; i++) {
      const spread = (i - (g.count - 1) / 2) * 0.014;
      const lngOff = g.side === "red" ? 0.085 + i * 0.01 : -0.085 - i * 0.01;
      const lat = center.lat + spread;
      const lng = center.lng + lngOff;
      const spec = CATALOG[g.type];
      const u = createUnit(g.type, {
        side: g.side,
        lat,
        lng,
        name: `${g.side.toUpperCase()} ${spec.label}-${seq++}`,
        notes: g.clause.slice(0, 80),
      });
      if (!g.stationed && u.speed > 0) {
        u.waypoints = [
          { lat: (lat + center.lat) / 2, lng: (lng + center.lng) / 2 },
          { lat: center.lat + spread * 0.3, lng: center.lng + lngOff * 0.15 },
        ];
        u.status = "moving";
      }
      units.push(u);
    }
  });

  return units;
}

export function composeClause(opts: {
  count: number;
  side: Side;
  type: UnitType;
  stationed: boolean;
  place: string;
}): string {
  const noun = opts.count === 1 ? opts.type : `${opts.type}${opts.type.endsWith("s") ? "" : "s"}`;
  const verb = opts.stationed
    ? "stationed"
    : opts.side === "red"
      ? "advance toward the area"
      : "move toward the area";
  const loc = opts.place.trim() || "the operational area";
  return `${opts.count} ${opts.side} ${noun} ${verb} ${opts.stationed ? loc : `from ${loc}`}`;
}

export const PROMPT_TEMPLATES: { id: string; label: string; prompt: string }[] = [
  {
    id: "kyiv-armor",
    label: "Kyiv armor",
    prompt:
      "2 blue tanks stationed west of Kyiv; 1 blue sam stationed covering the western approach; 2 red tanks advance from the east toward the city",
  },
  {
    id: "air-cap",
    label: "Air CAP",
    prompt:
      "1 blue fighter transits west of Taipei; 1 blue sam stationed on the western coast; 2 red bombers advance from the strait toward Taipei",
  },
  {
    id: "infantry-hold",
    label: "Hold the line",
    prompt:
      "3 blue infantry stationed west of Kyiv; 1 blue artillery stationed nearby; 2 red apc advance from the east toward the city",
  },
  {
    id: "black-sea",
    label: "Black Sea",
    prompt:
      "1 blue frigate stationed near the western Black Sea; 2 red destroyers advance toward the Black Sea center",
  },
  {
    id: "radar-net",
    label: "Radar net",
    prompt:
      "1 blue radar stationed west of Seoul; 1 blue shorad stationed nearby; 2 red uav advance from the east toward Seoul",
  },
];
