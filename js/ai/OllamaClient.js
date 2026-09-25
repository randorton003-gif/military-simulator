/**
 * OllamaClient — talks to a local Ollama instance.
 * Defaults to a small/fast model; can be switched to qwen3.8-flash-next.
 */

const OllamaClient = {
  baseUrl: "http://localhost:11434",

  // Prefer a small model for speed; user can switch in the UI
  model: "qwen2.5:1.5b",

  // Alternatives the UI can pick
  availableModels: [
    { id: "qwen2.5:0.5b", label: "Qwen2.5 0.5B (fastest)" },
    { id: "qwen2.5:1.5b", label: "Qwen2.5 1.5B (recommended)" },
    { id: "qwen2.5:3b", label: "Qwen2.5 3B" },
    { id: "qwen2.5:7b", label: "Qwen2.5 7B" },
    { id: "qwen3.8-flash-next", label: "Qwen3.8-Flash-Next (large)" }
  ],

  setModel(id) {
    this.model = id;
  },

  /**
   * Check if Ollama is reachable.
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { method: "GET" });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Chat with structured JSON output.
   * @param {string} system
   * @param {string} user
   * @param {object|null} schema  - JSON schema for format constraint
   * @returns {Promise<object>} parsed JSON
   */
  async chatJSON(system, user, schema = null) {
    const body = {
      model: this.model,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      options: {
        temperature: 0.4,
        num_predict: 2048
      }
    };

    if (schema) {
      body.format = schema;
    } else {
      body.format = "json";
    }

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama error ${res.status}: ${text}`);
    }

    const data = await res.json();
    const content = data.message?.content || data.response || "{}";

    // Model sometimes wraps JSON in markdown fences
    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return JSON.parse(cleaned);
  }
};

window.OllamaClient = OllamaClient;
