/**
 * Main application logic
 */

document.addEventListener("DOMContentLoaded", () => {
  initMap();

  const promptEl = document.getElementById("prompt");
  const generateBtn = document.getElementById("generateBtn");
  const clearBtn = document.getElementById("clearBtn");
  const unitListEl = document.getElementById("unitList");
  const logEl = document.getElementById("log");

  let currentScenario = null;

  function renderUnitList(units) {
    unitListEl.innerHTML = "";
    if (!units || units.length === 0) {
      unitListEl.innerHTML = "<li style=\"color:var(--muted)\">No units yet</li>";
      return;
    }
    units.forEach(u => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="icon">${getUnitIconSvg(u.type)}</span>
        <span>${u.name} <small style="color:var(--muted)">(${u.type})</small></span>
      `;
      li.addEventListener("click", () => focusUnit(u.id));
      unitListEl.appendChild(li);
    });
  }

  function appendLog(entries) {
    entries.forEach(text => {
      const div = document.createElement("div");
      div.className = "entry";
      div.textContent = text;
      logEl.prepend(div);
    });
  }

  generateBtn.addEventListener("click", () => {
    const prompt = promptEl.value;
    const scenario = generateScenarioFromPrompt(prompt);
    currentScenario = scenario;

    applyScenario(scenario);
    renderUnitList(scenario.units);
    appendLog(scenario.logEntries);

    // Optional: flash title in log
    appendLog([`▶ ${scenario.title}`]);
  });

  clearBtn.addEventListener("click", () => {
    clearAllMarkers();
    renderUnitList([]);
    currentScenario = null;
    appendLog(["Map cleared."]);
  });

  // Seed with a sample scenario on first load
  promptEl.value = "Defensive position west of Kyiv with tanks, infantry and artillery";
  generateBtn.click();
});
