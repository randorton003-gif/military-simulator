# Military Simulator — Local AI (Qwen / Ollama)

Panopticon-inspired military simulation. **Unit placement is decided by a local LLM**, not hardcoded coordinates.

## What the AI does

Given a natural-language prompt, the local model:

1. Chooses a real-world map center
2. Places an **enemy force first** (when the scenario implies opposition)
3. Positions friendly units in **tactically sound locations** relative to that enemy
   - SAMs / radars covering approaches
   - Armor in blocking positions
   - HQ set back from the front
4. Optionally assigns waypoints for movement

## Local AI setup (required for best results)

```bash
# Install Ollama: https://ollama.com

# Fast small models (recommended for quick iteration)
ollama pull qwen2.5:0.5b
ollama pull qwen2.5:1.5b
ollama pull qwen2.5:3b

# Larger / higher quality (optional)
ollama pull qwen2.5:7b
ollama pull qwen3.8-flash-next   # if available on your machine
```

Keep Ollama running (`ollama serve` is automatic on most installs).

The UI talks to `http://localhost:11434`. If Ollama is offline, a keyword fallback still works.

## Run the app

```bash
git clone https://github.com/randorton003-gif/military-simulator.git
cd military-simulator
python -m http.server 8000
```

Open http://localhost:8000

1. Pick a model in the sidebar (1.5B is a good default)
2. Enter a tactical prompt
3. Click **Generate** — watch the log for AI status
4. Press **▶** to run waypoint movement

## Example prompts

- `Blue force must defend western approaches to Kyiv. Red armor advancing from the east. Place SAMs for best coverage and keep HQ protected.`
- `Red amphibious threat against Taiwan's western coast. Blue places coastal SAMs, fighters on CAP, and naval pickets.`
- `Meeting engagement near Baghdad: blue mechanized vs red armor. Contested airspace.`

## Architecture

```
js/ai/
  OllamaClient.js      → localhost:11434 chat + JSON schema
  ScenarioGenerator.js → AI placement (with fallback)
js/core/Simulation.js  → play / pause / 2x
js/units/              → modular types + ranges
js/map/MapController.js→ markers, radar rings, routes
```

## License

MIT
