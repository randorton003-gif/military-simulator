/**
 * Sidebar — force composition chips + clickable unit list.
 */

const Sidebar = {
  unitListEl: null,
  forceSummaryEl: null,
  unitCountEl: null,
  scenarioTitleEl: null,

  init() {
    this.unitListEl = document.getElementById("unitList");
    this.forceSummaryEl = document.getElementById("forceSummary");
    this.unitCountEl = document.getElementById("unitCount");
    this.scenarioTitleEl = document.getElementById("scenarioTitle");
  },

  render(scenario) {
    const units = scenario?.units || [];

    // Header pills
    this.unitCountEl.textContent = `${units.length} UNITS`;
    this.scenarioTitleEl.textContent = scenario?.title
      ? scenario.title.toUpperCase()
      : "NO SCENARIO";

    // Force composition chips
    const byType = {};
    units.forEach(u => {
      byType[u.type] = (byType[u.type] || 0) + 1;
    });
    this.forceSummaryEl.innerHTML = Object.entries(byType)
      .map(([type, count]) =>
        `<span class="force-chip"><span class="count">${count}</span> ${type}</span>`
      )
      .join("") || `<span class="force-chip">No units</span>`;

    // Unit list
    this.unitListEl.innerHTML = "";
    if (units.length === 0) {
      this.unitListEl.innerHTML = `<li style="color:var(--text-dim)">No units deployed</li>`;
      return;
    }

    units.forEach(u => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="u-icon">${getIconSvg(u.type)}</span>
        <span class="u-name">${u.name}</span>
        <span class="u-side ${u.side}">${u.side}</span>
      `;
      li.addEventListener("click", () => MapController.focusUnit(u.id));
      this.unitListEl.appendChild(li);
    });
  },

  clear() {
    this.render(null);
  }
};

window.Sidebar = Sidebar;
