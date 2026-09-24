/**
 * LogPanel — append-only operations log.
 */

const LogPanel = {
  container: null,

  init() {
    this.container = document.getElementById("logEntries");
  },

  /**
   * @param {string|string[]} messages
   * @param {"info"|"success"|"warn"} level
   */
  write(messages, level = "info") {
    const list = Array.isArray(messages) ? messages : [messages];
    list.forEach(msg => {
      const div = document.createElement("div");
      div.className = `log-entry ${level}`;
      div.innerHTML = `<span class="ts">[${timestamp()}]</span>${msg}`;
      this.container.prepend(div);
    });
  },

  clear() {
    this.container.innerHTML = "";
  }
};

window.LogPanel = LogPanel;
