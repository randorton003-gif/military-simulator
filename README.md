# Military Simulator v5 — Combat & Editing

## Combat model

Each unit type defines in its class file:

| Field | Meaning |
|-------|--------|
| `domain` | Where the unit lives: `ground` / `air` / `naval` / `facility` |
| `canTarget` | Domains it may engage |
| `maxHealth` / `health` | Hit points |
| `damage` | Damage per shot |
| `detectionRangeKm` | Sensor ring |
| `engagementRangeKm` | Weapon range (combat) |
| `fireCooldownSec` | Time between shots |

### Targeting examples

- **SHORAD / SAM / CIWS** → only `air`
- **Infantry** → `ground`, `air`, `naval`, `facility`
- **Tank** → `ground`, `naval`, `facility`
- **Fighter** → all domains
- **Radar** → detects only (damage 0)

When simulation is **playing**, units auto-acquire the nearest valid enemy inside engagement range and apply damage. Destroyed units show greyed icons and stop acting.

## Map tools

| Mode | Action |
|------|--------|
| **Select / Drag** | Click to select; drag marker to move start position |
| **Add unit** | Click map to place selected type/side |
| **Add waypoint** | Select a mobile unit, then click map for each waypoint |

Also: **Delete selected**, **Clear WPs**, keyboard `Delete`.

## Local AI

```bash
ollama pull qwen2.5:1.5b
# keep Ollama running
```

AI chooses center, enemy placement, and friendly positions relative to the threat.

## Run

```bash
git clone https://github.com/randorton003-gif/military-simulator.git
cd military-simulator
python -m http.server 8000
```

Open http://localhost:8000 → Generate → ▶ Play to see movement **and** combat.
