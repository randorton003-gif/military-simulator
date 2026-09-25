/**
 * Application entry — strict skill, combat, drag, add/delete, waypoints.
 */

document.addEventListener("DOMContentLoaded", () => {
  MapController.init("map");
  Sidebar.init();
  LogPanel.init();

  const promptInput = document.getElementById("promptInput");
  const btnGenerate = document.getElementById("btnGenerate");
  const btnClear = document.getElementById("btnClear");
  const btnPlay = document.getElementById("btnPlay");
  const btnPause = document.getElementById("btnPause");
  const btnSpeed = document.getElementById("btnSpeed");
  const btnRanges = document.getElementById("btnRanges");
  const btnRoutes = document.getElementById("btnRoutes");
  const simStatus = document.getElementById("simStatus");
  const modelSelect = document.getElementById("modelSelect");
  const aiStatus = document.getElementById("aiStatus");

  const modeSelect = document.getElementById("modeSelect");
  const addTypeSelect = document.getElementById("addTypeSelect");
  const addSideSelect = document.getElementById("addSideSelect");
  const btnDelete = document.getElementById("btnDelete");
  const btnClearWp = document.getElementById("btnClearWp");
  const selectedInfo = document.getElementById("selectedInfo");

  let currentScenario = { title: "", units: [], center: null };
  let generating = false;

  UnitFactory.availableTypes().forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    addTypeSelect.appendChild(opt);
  });

  if (modelSelect) {
    OllamaClient.availableModels.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.label;
      if (m.id === OllamaClient.model) opt.selected = true;
      modelSelect.appendChild(opt);
    });
    modelSelect.addEventListener("change", () => {
      OllamaClient.setModel(modelSelect.value);
      LogPanel.write(`Model → ${modelSelect.value}`, "info");
    });
  }

  async function refreshAiStatus() {
    if (!aiStatus) return;
    const ok = await OllamaClient.isAvailable();
    aiStatus.textContent = ok ? "AI ONLINE" : "AI OFFLINE";
    aiStatus.classList.toggle("online", ok);
    aiStatus.classList.toggle("muted", !ok);
  }
  refreshAiStatus();
  setInterval(refreshAiStatus, 15000);

  function updateTransportUI() {
    btnPlay.disabled = Simulation.running;
    btnPause.disabled = !Simulation.running;
    btnSpeed.textContent = Simulation.speed === 2 ? "2×" : "1×";
    simStatus.textContent = Simulation.running ? "PLAYING" : "PAUSED";
    simStatus.classList.toggle("playing", Simulation.running);
  }

  function refreshUI() {
    Sidebar.render(currentScenario);
    Simulation.setUnits(currentScenario.units);
  }

  function selectUnit(unit) {
    MapController.selectedId = unit?.id || null;
    Sidebar.selectedId = unit?.id || null;
    if (unit) {
      const wp = unit.waypoints?.length || 0;
      selectedInfo.textContent =
        `${unit.name} · ${unit.type} · HP ${Math.ceil(unit.health)}/${unit.maxHealth}` +
        ` · ${wp ? wp + " waypoints" : "stationed"}` +
        ` · targets: ${unit.canTarget.join(",")}`;
    } else {
      selectedInfo.textContent = "None selected";
    }
    Sidebar.render(currentScenario);
  }

  MapController.onSelect = selectUnit;
  Sidebar.onSelect = selectUnit;

  MapController.onMoved = (unit) => {
    unit.setStartPosition(unit.lat, unit.lng);
    LogPanel.write(`Start moved: ${unit.name} → ${unit.lat.toFixed(4)}, ${unit.lng.toFixed(4)}`, "info");
    MapController.syncUnits(currentScenario.units);
  };

  MapController.onAddAt = (lat, lng) => {
    const type = addTypeSelect.value;
    const side = addSideSelect.value;
    const unit = UnitFactory.create(type, {
      side,
      lat,
      lng,
      name: `${side.toUpperCase()} ${capitalize(type)}-${currentScenario.units.length + 1}`,
      notes: "User-placed"
    });
    unit.setStartPosition(lat, lng);
    currentScenario.units.push(unit);
    MapController.addUnit(unit);
    refreshUI();
    LogPanel.write(`Added ${unit.name} at ${lat.toFixed(4)}, ${lng.toFixed(4)}`, "success");
  };

  MapController.onWaypointAt = (unitId, lat, lng) => {
    const unit = currentScenario.units.find(u => u.id === unitId);
    if (!unit || unit.speed <= 0) {
      LogPanel.write("Select a mobile unit first.", "warn");
      return;
    }
    unit.addWaypoint(lat, lng);
    MapController.syncUnits(currentScenario.units);
    LogPanel.write(`Waypoint for ${unit.name} (${unit.waypoints.length} total)`, "info");
    selectUnit(unit);
  };

  modeSelect.addEventListener("change", () => {
    MapController.setMode(modeSelect.value);
    LogPanel.write(`Mode → ${modeSelect.value}`, "info");
  });

  btnDelete.addEventListener("click", () => {
    const id = MapController.selectedId || Sidebar.selectedId;
    if (!id) {
      LogPanel.write("Select a unit first.", "warn");
      return;
    }
    const idx = currentScenario.units.findIndex(u => u.id === id);
    if (idx < 0) return;
    const name = currentScenario.units[idx].name;
    currentScenario.units.splice(idx, 1);
    MapController.removeUnit(id);
    selectUnit(null);
    refreshUI();
    LogPanel.write(`Deleted ${name}`, "warn");
  });

  btnClearWp.addEventListener("click", () => {
    const id = MapController.selectedId || Sidebar.selectedId;
    const unit = currentScenario.units.find(u => u.id === id);
    if (!unit) {
      LogPanel.write("Select a unit first.", "warn");
      return;
    }
    unit.clearWaypoints();
    MapController.syncUnits(currentScenario.units);
    LogPanel.write(`Cleared waypoints for ${unit.name}`, "info");
    selectUnit(unit);
  });

  async function runScenario(prompt) {
    if (generating) return;
    generating = true;
    btnGenerate.disabled = true;
    btnGenerate.textContent = "Generating…";
    Simulation.pause();

    try {
      const scenario = await ScenarioGenerator.generate(prompt, {
        onStatus: (msg) => LogPanel.write(msg, "info")
      });
      currentScenario = scenario;
      MapController.applyScenario(scenario);
      refreshUI();
      LogPanel.write(scenario.log, "info");
      LogPanel.write(`▶ ${scenario.title}`, "success");
    } catch (err) {
      LogPanel.write(`Generation failed: ${err.message}`, "warn");
    } finally {
      generating = false;
      btnGenerate.disabled = false;
      btnGenerate.textContent = "Generate";
      updateTransportUI();
    }
  }

  Simulation.onTick = () => {
    if (currentScenario) {
      MapController.syncUnits(currentScenario.units);
      Sidebar.render(currentScenario);
    }
  };

  Simulation.onCombat = (ev) => {
    const msg = ev.targetDestroyed
      ? `${ev.attacker.name} destroyed ${ev.target.name}`
      : `${ev.attacker.name} hit ${ev.target.name} for ${ev.damage.toFixed(0)} dmg`;
    LogPanel.write(msg, ev.targetDestroyed ? "warn" : "info");
  };

  btnGenerate.addEventListener("click", () => runScenario(promptInput.value));
  btnClear.addEventListener("click", () => {
    Simulation.pause();
    MapController.clear();
    currentScenario = { title: "", units: [], center: null };
    Sidebar.clear();
    Simulation.setUnits([]);
    selectUnit(null);
    LogPanel.write("Map cleared.", "warn");
    updateTransportUI();
  });

  btnPlay.addEventListener("click", () => {
    Simulation.play();
    LogPanel.write("Playing — movement + combat", "success");
    updateTransportUI();
  });
  btnPause.addEventListener("click", () => {
    Simulation.pause();
    LogPanel.write("Paused", "warn");
    updateTransportUI();
  });
  btnSpeed.addEventListener("click", () => {
    Simulation.toggleSpeed();
    LogPanel.write(`Speed ${Simulation.speed}×`, "info");
    updateTransportUI();
  });
  btnRanges.addEventListener("click", () => {
    MapController.toggleRanges();
    btnRanges.classList.toggle("on", MapController.showRanges);
    MapController.syncUnits(currentScenario.units);
  });
  btnRoutes.addEventListener("click", () => {
    MapController.toggleRoutes();
    btnRoutes.classList.toggle("on", MapController.showRoutes);
    MapController.syncUnits(currentScenario.units);
  });

  promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runScenario(promptInput.value);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") return;
      btnDelete.click();
    }
  });

  // Example that names units, starts, and motion explicitly
  promptInput.value =
    "2 blue tanks stationed west of Kyiv; 1 blue SAM stationed covering the western approach; 2 red tanks advance from the east toward the city";
  runScenario(promptInput.value);
  updateTransportUI();
});
