/** Sidebar — force chips, unit list, selection highlight */

const Sidebar = {
  unitListEl: null,
  forceSummaryEl: null,
  unitCountEl: null,
  scenarioTitleEl: null,
  selectedId: null,
  onSelect: null,

  init() {
    this.unitListEl = document.getElementById("unitList");
    this.forceSummaryEl = document.getElementById("forceSummary");
    this.unitCountEl = document.getElementById("unitCount");
    this.scenarioTitleEl = document.getElementById("scenarioTitle");
  },

  render(scenario) {
    const units = scenario?.units || [];
    const alive = units.filter(u => u.isAlive);

    this.unitCountEl.textContent = `${alive.length}/${units.length} UNITS`;
    this.scenarioTitleEl.textContent = scenario?.title
      ? scenario.title.toUpperCase()
      : "NO SCENARIO";

    const byType = {};
    alive.forEach(u => { byType[u.type] = (byType[u.type] || 0) + 1; });
    this.forceSummaryEl.innerHTML = Object.entries(byType)
      .map(([type, count]) =>
        `<span class="force-chip"><span class="count">${count}</span> ${type}</span>`
      ).join("") || `<span class="force-chip">No units</span>`;

    this.unitListEl.innerHTML = "";
    if (units.length === 0) {
      this.unitListEl.innerHTML = `<li style="color:var(--text-dim)">No units deployed</li>`;
      return;
    }

    units.forEach(u => {
      const li = document.createElement("li");
      if (u.id === this.selectedId) li.classList.add("selected");
      if (!u.isAlive) li.classList.add("dead");
      const hp = Math.ceil(u.health);
      li.innerHTML = `
        <span class="u-icon">${getIconSvg(u.type)}</span>
        <span class="u-name">${u.name} <small style="color:var(--text-dim)">${hp}hp</small></span>
        <span class="u-side ${u.side}">${u.side}</span>
      `;
      li.addEventListener("click", () => {
        this.selectedId = u.id;
        this.render(scenario);
        if (typeof this.onSelect === "function") this.onSelect(u);
        MapController.focusUnit(u.id);
      });
      this.unitListEl.appendChild(li);
    });
  },

  clear() {
    this.selectedId = null;
    this.render(null);
  }
};

window.Sidebar = Sidebar;
