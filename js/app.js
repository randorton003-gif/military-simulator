/**
 * Application entry — local AI (Ollama/Qwen) + simulation + map.
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

  let currentScenario = null;
  let generating = false;

  // Populate model dropdown
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
      LogPanel.write(`Model set to ${modelSelect.value}`, "info");
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
      Sidebar.render(scenario);
      Simulation.setUnits(scenario.units);

      LogPanel.write(scenario.log, "info");
      LogPanel.write(`▶ ${scenario.title}`, "success");
      if (scenario.reasoning) {
        LogPanel.write(`Tactical reasoning: ${scenario.reasoning}`, "info");
      }
    } catch (err) {
      LogPanel.write(`Generation failed: ${err.message}`, "warn");
      console.error(err);
    } finally {
      generating = false;
      btnGenerate.disabled = false;
      btnGenerate.textContent = "Generate";
      updateTransportUI();
    }
  }

  Simulation.onTick = () => {
    if (currentScenario) MapController.syncUnits(currentScenario.units);
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

  // Seed with a rich adversarial prompt
  promptInput.value =
    "Blue force must defend the western approaches to Kyiv. Red armor and air are advancing from the east. Place SAMs and radars for best coverage, tanks in blocking positions, and keep HQ protected.";
  runScenario(promptInput.value);
  updateTransportUI();
});
