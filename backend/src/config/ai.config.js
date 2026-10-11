require("./env");
const fs = require("fs");

const isDocker = process.env.IS_DOCKER === "true" || fs.existsSync("/.dockerenv");

const rawAiUrl = process.env.AI_SERVICE_URL || (isDocker ? "http://ai-service:8000" : "http://127.0.0.1:8000");
const cleanAiUrl = isDocker
  ? rawAiUrl.replace(/\/$/, "")
  : rawAiUrl.replace("://ai-service:", "://127.0.0.1:").replace(/\/$/, "");

const rawOllamaUrl =
  process.env.OLLAMA_BASE_URL ||
  process.env.OLLAMA_URL ||
  (isDocker ? "http://host.docker.internal:11434" : "http://127.0.0.1:11434");

const cleanOllamaUrl = isDocker
  ? rawOllamaUrl.replace(/\/$/, "")
  : rawOllamaUrl.replace("://ollama:", "://127.0.0.1:").replace(/\/$/, "");

const aiConfig = {
  ollama: {
    enabled: String(process.env.OLLAMA_ENABLED || "true").toLowerCase() !== "false",
    url: cleanOllamaUrl,
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
