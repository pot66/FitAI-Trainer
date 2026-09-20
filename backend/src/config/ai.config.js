require("./env");

const rawAiUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const cleanAiUrl = rawAiUrl.replace("://ai-service:", "://127.0.0.1:").replace(/\/$/, "");

const aiConfig = {
  ollama: {
    enabled: String(process.env.OLLAMA_ENABLED || "true").toLowerCase() !== "false",
    url: (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || "http://127.0.0.1:11434")
      .replace("://ollama:", "://127.0.0.1:")
      .replace(/\/$/, ""),
    model: process.env.OLLAMA_MODEL || "qwen2.5:3b",
    timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || 12000),
  },

  aiService: {
    url: cleanAiUrl,
  },

  email: {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.EMAIL_FROM || "FitAI Trainer <onboarding@resend.dev>",
  },
};

module.exports = aiConfig;
