# Military Simulator (Panopticon-inspired)

Professional web-based military simulation with clean modular architecture.

## Features (v3)

- **Play / Pause / 2× speed** — transport controls in the command bar
- **Dictated movements** — units follow waypoints when simulation is running
- **Radar & engagement range rings** — toggleable detection/engagement circles
- **Route lines** — dashed paths show planned movement
- **Simple black icons** — monochrome NATO-style symbols with side-colored borders
- **Modular unit system** — Ground, Air, Naval, Air Defense, Facilities
- **Prompt-driven scenarios** on OpenStreetMap

## Controls

| Control | Action |
|---------|--------|
| ▶ Play  | Start simulation (units move along waypoints) |
| ⏸ Pause | Stop simulation |
| 1× / 2× | Toggle simulation speed |
| RADAR   | Toggle range rings |
| ROUTES  | Toggle waypoint paths |

## Project Structure

```
js/
├── core/
│   ├── constants.js      # Icons, speeds, locations
│   ├── utils.js
│   └── Simulation.js     # Play/pause/speed engine
├── units/
│   ├── BaseUnit.js       # Waypoints + ranges
│   ├── GroundUnits.js
│   ├── AirUnits.js
│   ├── NavalUnits.js
│   ├── AirDefense.js     # SAM, SHORAD, Radar, CIWS
│   ├── Facilities.js
│   └── UnitFactory.js
├── map/MapController.js  # Markers, rings, routes
├── ai/ScenarioGenerator.js
├── ui/
└── app.js
```

## Run

```bash
git clone https://github.com/randorton003-gif/military-simulator.git
cd military-simulator
python -m http.server 8000
```

Open http://localhost:8000 → Generate a scenario → press **▶**

## License

MIT
