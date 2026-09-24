/**
 * Application entry — wires UI, simulation, map, and scenario generation.
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

  let currentScenario = null;

  function updateTransportUI() {
    btnPlay.disabled = Simulation.running;
    btnPause.disabled = !Simulation.running;
    btnSpeed.textContent = Simulation.speed === 2 ? "2×" : "1×";
    simStatus.textContent = Simulation.running ? "PLAYING" : "PAUSED";
    simStatus.classList.toggle("playing", Simulation.running);
  }

  function runScenario(prompt) {
    Simulation.pause();
    const scenario = ScenarioGenerator.generate(prompt);
    currentScenario = scenario;

    MapController.applyScenario(scenario);
    Sidebar.render(scenario);
    Simulation.setUnits(scenario.units);

    LogPanel.write(scenario.log, "info");
    LogPanel.write(`▶ ${scenario.title}`, "success");
    updateTransportUI();
  }

  // Simulation tick → refresh markers
  Simulation.onTick = () => {
    if (currentScenario) {
      MapController.syncUnits(currentScenario.units);
    }
  };

  btnGenerate.addEventListener("click", () => runScenario(promptInput.value));

  btnClear.addEventListener("click", () => {
    Simulation.pause();
    MapController.clear();
    Sidebar.clear();
    Simulation.setUnits([]);
    currentScenario = null;
    LogPanel.write("Map and units cleared.", "warn");
    updateTransportUI();
  });

  btnPlay.addEventListener("click", () => {
    Simulation.play();
    LogPanel.write("Simulation playing", "success");
    updateTransportUI();
  });

  btnPause.addEventListener("click", () => {
    Simulation.pause();
    LogPanel.write("Simulation paused", "warn");
    updateTransportUI();
  });

  btnSpeed.addEventListener("click", () => {
    Simulation.toggleSpeed();
    LogPanel.write(`Speed set to ${Simulation.speed}×`, "info");
    updateTransportUI();
  });

  btnRanges.addEventListener("click", () => {
    MapController.toggleRanges();
    btnRanges.classList.toggle("on", MapController.showRanges);
    if (currentScenario) MapController.syncUnits(currentScenario.units);
    LogPanel.write(`Range rings ${MapController.showRanges ? "ON" : "OFF"}`, "info");
  });

  btnRoutes.addEventListener("click", () => {
    MapController.toggleRoutes();
    btnRoutes.classList.toggle("on", MapController.showRoutes);
    if (currentScenario) MapController.syncUnits(currentScenario.units);
    LogPanel.write(`Routes ${MapController.showRoutes ? "ON" : "OFF"}`, "info");
  });

  promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runScenario(promptInput.value);
    }
  });

  // Seed
  promptInput.value =
    "Blue force defense west of Kyiv with tanks, infantry, artillery and SAM coverage against red air threat";
  runScenario(promptInput.value);
  LogPanel.write("System online. Press ▶ to run dictated movements.", "success");
  updateTransportUI();
});
