# Aegis Command

Parser-first military simulator on OpenStreetMap. Units exist only if you name them in the prompt.

The previous static / Ollama build is on the `legacy-static` branch.

## Run on Windows (PowerShell)

You need [Git](https://git-scm.com/download/win) and [Node.js LTS](https://nodejs.org/) (includes `npm`).

```powershell
cd $HOME

# Optional: remove an old copy first
if (Test-Path .\military-simulator) {
  Remove-Item -Recurse -Force .\military-simulator
}

git clone https://github.com/randorton003-gif/military-simulator.git
cd military-simulator
npm install
npm run dev
```

Then open **http://localhost:8000** in your browser.

Stop the server with `Ctrl+C` in that PowerShell window.

Do **not** use `python -m http.server` for this version. It is a Node/Vite app, not a folder of static files.

If `npm` is not recognized, install Node.js LTS, close PowerShell, open a new window, and run `node -v` then `npm -v` to confirm.

## Try this prompt

```
2 blue tanks stationed west of Kyiv; 1 blue SAM stationed covering the western approach; 2 red tanks advance from the east toward the city
```

1. Confirm the plan (should list **5** units).
2. Play. Dashed rings = detection, solid rings = engagement.
3. Shift-click to multi-select, switch to waypoint mode for group move. Ctrl+Z undoes.

## Prompt templates

Kyiv armor, Air CAP, Hold the line, Black Sea, Radar net — plus a structured helper to append clauses.

## Combat rules

- Phrase parser is the source of truth (no extra units).
- Fire only after detection, in engagement range, if the unit can target that domain.
- Magazines empty then reload.
- ROE: Hold / Tight / Free. Friendly fire off unless enabled.

## Unit types you can name

tank, infantry, artillery, apc, fighter, bomber, helicopter, uav, destroyer, frigate, carrier, submarine, sam, shorad, radar, ciws, airbase, hq, depot, port
