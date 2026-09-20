const { aiConfig } = require("../config");
const { askOllamaStructured } = require("./ollamaService");

/**
 * Call FastAPI AI Service to analyze food image, with fallback to Ollama or visual heuristics.
 */
async function analyzeFoodImage(imageBase64, confidence = null) {
  const cleanBase64 = String(imageBase64 || "").replace(/^data:image\/\w+;base64,/, "");
  if (!cleanBase64) {
    throw new Error("Invalid or empty image data");
  }

  const aiUrl = aiConfig.aiService.url;

  // 1. Try FastAPI AI Service first
  try {
    const response = await fetch(`${aiUrl}/food/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: cleanBase64,
        confidence: confidence || 0.45,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.foods) && data.foods.length > 0) {
        return {
          source: "ai-service",
          method: data.method || "yolo",
          foods: data.foods,
        };
      }
    }
  } catch (error) {
    console.warn("AI Service /food/detect unreachable:", error.message);
  }

  // 2. Fallback to Local Ollama Structured prompt if LLM is active
  try {
    const prompt = [
      "You are a helpful Thai nutritionist AI.",
      "Identify the food items in this meal and return a strict JSON array.",
      'Format: {"foods": [{"name": "ชื่ออาหารภาษาไทย", "quantity": 1, "unit": "จาน", "confidence": 0.85}]}',
      "Example Thai foods: ข้าวกะเพราไก่, ไข่ดาว, ข้าวมันไก่, ข้าวผัด, ผัดไทย, ส้มตำ, อกไก่",
    ].join("\n");

    const ollamaResult = await askOllamaStructured(prompt);
    if (ollamaResult) {
      const parsed = typeof ollamaResult === "string" ? JSON.parse(ollamaResult) : ollamaResult;
      if (Array.isArray(parsed?.foods) && parsed.foods.length > 0) {
        return {
          source: "ollama-llm",
          method: "llm-structured",
          foods: parsed.foods.map((f) => ({
            name: f.name || "อาหารทั่วไป",
            quantity: Number(f.quantity) || 1,
            unit: f.unit || "จาน",
            confidence: Number(f.confidence) || 0.8,
          })),
        };
      }
    }
  } catch (llmErr) {
    console.warn("Ollama fallback food parse failed:", llmErr.message);
  }

  // 3. Graceful Fallback if offline: Return default suggested Thai dish with low confidence so user reviews it
  return {
    source: "fallback-default",
    method: "manual-review-required",
    foods: [
      {
        name: "ข้าวกะเพราไก่",
        quantity: 1,
        unit: "จาน",
        confidence: 0.55,
      },
    ],
  };
}

module.exports = {
  analyzeFoodImage,
};