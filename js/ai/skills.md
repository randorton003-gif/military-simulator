# Local AI Skill: Scenario Deployment (Strict Prompt Fidelity)

This skill governs how the local model (Ollama / Qwen) turns a user prompt into a military scenario JSON.

## Purpose

Place **only** the units the user named, at the start positions they implied, with movement only when they asked for it.

## Hard rules (must follow)

### 1. Units only from the prompt

- Deploy **only** unit types explicitly named or clearly implied in the prompt.
- Allowed type tokens: `tank`, `infantry`, `artillery`, `apc`, `fighter`, `bomber`, `helicopter`, `uav`, `destroyer`, `frigate`, `carrier`, `submarine`, `sam`, `shorad`, `radar`, `ciws`, `airbase`, `hq`, `depot`, `port`.
- **Do not** add HQ, radar, infantry, or any other type “for completeness” if the prompt did not mention it.
- If the prompt names a count (e.g. “3 tanks”), respect that count as closely as possible.
- If the prompt names no unit types, return an empty `units` array and explain in `reasoning`.

### 2. Starting location

- Every unit **must** have a start position (`lat`, `lng`).
- Prefer coordinates stated or strongly implied in the prompt (place names, “west of Kyiv”, “on the coast”, grid references).
- If only a theater is given (e.g. “near Kyiv”), pick realistic start coords inside that area and set `center` accordingly.
- Do not invent a second theater.

### 3. Stationed vs waypoints

- **Stationed** (static): unit stays at start. Set `stationed: true` and `waypoints: []`.
  - Use when the prompt says stationed, defending, holding, garrison, emplaced, fixed, or names static systems (SAM, SHORAD, radar, CIWS, HQ, airbase, depot, port) without ordering movement.
- **Moving**: set `stationed: false` and provide one or more `waypoints`.
  - Use when the prompt says advance, attack, transit, route, patrol, CAP, move to, or lists multiple locations for that unit.
- Multiple waypoints: ordered path from start → wp1 → wp2 → …
- Never give waypoints to true fixed systems unless the prompt explicitly orders them to relocate.

### 4. Sides

- `side` is `"blue"` or `"red"` only when the prompt assigns that force.
- Do not invent an opposing force the prompt did not mention.

### 5. Output discipline

- Return **only** JSON matching the scenario schema.
- No markdown fences, no extra prose outside JSON.
- `reasoning` may briefly cite which prompt phrases justified each unit and whether it is stationed or routed.

## Prompt patterns (examples)

| Prompt fragment | Result |
|-----------------|--------|
| `2 blue tanks stationed west of Kyiv` | 2× tank, blue, stationed, start west of Kyiv |
| `red fighters transit from east toward the city` | fighters, red, waypoints toward city |
| `one SAM battery at 50.45, 30.40` | 1× sam at those coords, stationed |
| `blue infantry hold the bridge; no other forces` | only infantry, blue, stationed |

## Anti-patterns (forbidden)

- Adding HQ/radar/infantry when the prompt only said “tanks”
- Auto-spawning a full combined-arms package
- Giving every mobile unit default waypoints when the prompt said “stationed”
- Ignoring explicit coordinates in the prompt
