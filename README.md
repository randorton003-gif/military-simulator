# Military Simulator — Strict Prompt Skill

Local AI (Ollama / Qwen) deploys **only what you name** in the prompt.

## Skill file

See **[js/ai/skills.md](js/ai/skills.md)** — formal rules for the local model.

Embedded at runtime via `js/ai/ScenarioSkill.js` into the system prompt.

### Rules summary

1. **Only units in the prompt** — no auto HQ, radar, or filler forces  
2. **Start location** — every unit gets `lat`/`lng` from the prompt (or theater)  
3. **Stationed vs waypoints** — static hold vs multi-point routes as written  
4. **Sides** — blue/red only when the prompt assigns them  

### Good prompts

```
2 blue tanks stationed west of Kyiv; 1 blue SAM stationed covering the western approach; 2 red tanks advance from the east toward the city
```

```
1 red fighter transits from 50.50,30.70 toward Kyiv; no other units
```

```
3 blue infantry hold the bridge near 50.45,30.50
```

## Combat

Each unit class defines `domain`, `canTarget`, `health`, `damage`, ranges.  
SHORAD → air only. Infantry → ground, air, naval, facility. etc.

## Map tools

- Drag markers to change start position  
- Mode: Add unit / Add waypoint  
- Delete selected  

## Run

```bash
ollama pull qwen2.5:1.5b
git clone https://github.com/randorton003-gif/military-simulator.git
cd military-simulator
python -m http.server 8000
```

Open http://localhost:8000
