/**
 * Application entry point.
 * Wires UI events to ScenarioGenerator + MapController + panels.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize subsystems
  MapController.init("map");
  Sidebar.init();
  LogPanel.init();

  const promptInput = document.getElementById("promptInput");
  const btnGenerate = document.getElementById("btnGenerate");
  const btnClear = document.getElementById("btnClear");

  let currentScenario = null;

  function runScenario(prompt) {
    const scenario = ScenarioGenerator.generate(prompt);
    currentScenario = scenario;

    MapController.applyScenario(scenario);
    Sidebar.render(scenario);
    LogPanel.write(scenario.log, "info");
    LogPanel.write(`▶ ${scenario.title}`, "success");
  }

  btnGenerate.addEventListener("click", () => {
    runScenario(promptInput.value);
  });

  btnClear.addEventListener("click", () => {
    MapController.clear();
    Sidebar.clear();
    currentScenario = null;
    LogPanel.write("Map and units cleared.", "warn");
  });

  // Allow Enter+Ctrl to generate
  promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runScenario(promptInput.value);
    }
  });

  // Seed with a rich example on load
  promptInput.value =
    "Blue force defense west of Kyiv with tanks, infantry, artillery and SAM coverage against red air threat";
  runScenario(promptInput.value);

  LogPanel.write("System online. Ready for scenario generation.", "success");
});
