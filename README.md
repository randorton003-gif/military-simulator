# Military Simulator

AI-driven military simulator game that generates **maps**, **units**, and **icons** from natural-language prompts.

## Features

- **Real-world maps** powered by OpenStreetMap (Leaflet)
- **Prompt-based scenario generation** — type something like:
  - `"Create a defensive position around Kyiv with tanks and infantry"`
  - `"Amphibious assault on Taiwan beaches with naval and air support"`
  - `"Urban warfare in a fictional city called New Bastion"`
- **Dynamic icons** generated on the fly for units (tanks, infantry, artillery, aircraft, ships, etc.)
- **Interactive map** — pan, zoom, click units for details
- **Scenario log** of all AI-generated actions

## How to Run

1. Clone the repo or open the GitHub Pages link (once enabled).
2. Open `index.html` in a modern browser (or serve with any static server).
3. Type a prompt and press **Generate Scenario**.

No backend or API keys required for the demo — the AI logic is simulated client-side and can be replaced with a real LLM later.

## Tech Stack

- HTML / CSS / Vanilla JS
- [Leaflet](https://leafletjs.com/) + OpenStreetMap tiles
- Procedural SVG icons

## Extending with Real AI

Replace the logic in `js/ai.js` with calls to Grok, OpenAI, or any other model. The expected output shape is documented in the file.

## License

MIT
