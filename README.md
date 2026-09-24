# Military Simulator (Panopticon-inspired)

A clean, modular, professional web-based military simulation platform.

Inspired by [Panopticon AI](https://panopticon-ai.com/) — built for clarity, extensibility, and real-world map visualization using OpenStreetMap.

## Design Goals

- **Compartmentalized code** — every concern lives in its own module
- **Clear unit hierarchy** — BaseUnit → specialized types (Ground, Air, Naval, AirDefense, Facility…)
- **Professional command-center UI**
- **Prompt-driven scenario generation**
- **Easy to extend** with new unit types or real AI backends

## Project Structure

```
├── index.html
├── css/
│   └── styles.css              # Professional dark theme
├── js/
│   ├── core/
│   │   ├── constants.js        # Shared constants & enums
│   │   └── utils.js            # Small helpers
│   ├── units/
│   │   ├── BaseUnit.js         # Abstract base class
│   │   ├── GroundUnits.js      # Tank, Infantry, Artillery, APC
│   │   ├── AirUnits.js         # Fighter, Bomber, Helicopter, UAV
│   │   ├── NavalUnits.js       # Destroyer, Frigate, Carrier, Submarine
│   │   ├── AirDefense.js       # SAM, SHORAD, Radar, CIWS
│   │   ├── Facilities.js       # Airbase, HQ, Depot, Port
│   │   └── UnitFactory.js      # Creates the right unit from type string
│   ├── map/
│   │   └── MapController.js    # Leaflet + OpenStreetMap
│   ├── ai/
│   │   └── ScenarioGenerator.js# Prompt → structured scenario
│   ├── ui/
│   │   ├── Sidebar.js
│   │   └── LogPanel.js
│   └── app.js                  # Application entry point
└── README.md
```

## How to Run

```bash
git clone https://github.com/randorton003-gif/military-simulator.git
cd military-simulator
python -m http.server 8000
```

Open http://localhost:8000

## Unit Categories

| Category     | Types                                      |
|--------------|--------------------------------------------|
| Ground       | Tank, Infantry, Artillery, APC             |
| Air          | Fighter, Bomber, Helicopter, UAV           |
| Naval        | Destroyer, Frigate, Carrier, Submarine     |
| Air Defense  | SAM, SHORAD, Radar, CIWS                   |
| Facility     | Airbase, HQ, Depot, Port                   |

## Extending

1. Add a new class in the appropriate `units/*.js` file (extend `BaseUnit`)
2. Register it in `UnitFactory.js`
3. Add an icon mapping in `constants.js`

## License

MIT
