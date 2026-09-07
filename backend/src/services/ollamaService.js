const { getPromptCatalog } = require("./exerciseVideoService");
const { aiConfig } = require("../config");

function compactProfile(profile) {
  if (!profile) return "ยังไม่มีข้อมูล Profile";
  return `อายุ ${profile.age ?? "-"} ปี, ส่วนสูง ${profile.height ?? "-"} ซม., น้ำหนัก ${profile.weight ?? "-"} กก., BMI ${profile.bmi ?? "-"} (${profile.bmiStatus ?? "-"})`;
}

function compactWorkouts(workouts = []) {
  if (!workouts.length) return "ยังไม่มีประวัติการฝึก";
  return workouts.slice(0, 6).map((workout) => {
    const name = workout.exercise?.name || "การออกกำลังกาย";
    return `${name}: ${workout.repetitions ?? 0} ครั้ง, คะแนน ${workout.score ?? "-"}`;
  }).join(" | ");
}

function compactActivePlan(plan) {
  if (!plan) return "ไม่มีแผนวันนี้ส่งมา";
  const exercises = Array.isArray(plan.exercises) && plan.exercises.length
    ? plan.exercises
    : plan.exerciseName ? [{ name: plan.exerciseName, sets: plan.sets, repetitions: plan.repetitions }] : [];
  return `${plan.focus || "การออกกำลังกาย"}: ${exercises.map((item) => `${item.name} (${item.sets || "-"} เซ็ต, ${item.repetitions || "-"})`).join(", ") || "วันพัก"}`;
}

function createSystemPrompt(context, videoCatalog = "") {
  const lines = [
    "คุณคือ FitAI Trainer ผู้ช่วยฟิตเนสภาษาไทยที่เป็นมิตร กระชับ และใช้งานได้จริง",
    "ตอบเป็นภาษาเดียวกับผู้ใช้ โดยปกติใช้ภาษาไทย และใช้หัวข้อหรือ bullet เฉพาะเมื่อช่วยให้อ่านง่าย",
    "อ้างอิงข้อมูลผู้ใช้และประวัติการฝึกที่ให้ไว้ ห้ามแต่งข้อมูลเพิ่ม",
    "ให้คำแนะนำออกกำลังกายแบบค่อยเป็นค่อยไป เน้นฟอร์ม การพัก และทางเลือกแรงกระแทกต่ำเมื่อเหมาะสม",
    "หากมี 'แผนวันนี้' กำหนดไว้ และผู้ใช้ถามถึงท่าที่ควรทำ ท่าออกกำลังกายวันนี้ หรือขอคำแนะนำท่าฝึก ให้ยึดท่าและจำนวนเซ็ตตาม 'แผนวันนี้' ในระบบเป็นหลักเสมอ และแนบลิงก์วิดีโอ YouTube ของแต่ละท่าให้ถูกต้อง",
    "หากมีอาการเจ็บหน้าอก หายใจลำบาก เป็นลม ชา อ่อนแรงฉับพลัน หรือปวดรุนแรง ให้แนะนำหยุดออกกำลังกายและพบแพทย์/ฉุกเฉินทันที ไม่วินิจฉัยโรค",
    "เมื่อแนะนำท่าออกกำลังกาย ให้ระบุชื่อท่า วิธีทำสั้น ๆ และแนบลิงก์วิดีโอ YouTube ของแต่ละท่า โดยเขียนในรูปแบบ [ชื่อวิดีโอ](URL)",
  ];

  if (videoCatalog) {
    lines.push(
      "รายการท่าออกกำลังกายและลิงก์ YouTube ที่ถูกต้องในระบบ (เมื่อแนะนำท่าให้ใช้ลิงก์จากรายการนี้เท่านั้น ห้ามสร้าง URL เอง):",
      videoCatalog
    );
  }

  lines.push(
    `ข้อมูล Profile: ${compactProfile(context.profile)}`,
    `ประวัติการฝึกล่าสุด: ${compactWorkouts(context.workout)}`,
    `แผนวันนี้: ${compactActivePlan(context.activePlan)}`
  );

  return lines.join("\n");
}

function getOllamaUrl() {
  return aiConfig.ollama.url;
}

function getOllamaModel() {
  return aiConfig.ollama.model;
}

async function callOllamaChat(baseUrl, model, messages, format = null, temperature = 0.45, customTimeoutMs = null) {
  const timeoutMs = customTimeoutMs || aiConfig.ollama.timeoutMs;
  const payload = {
    model,
    messages,
    stream: false,
    options: { temperature },
  };
  if (format) {
    payload.format = format;
  }

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Ollama returned status ${response.status}`);
  }

  const data = await response.json();
  return data?.message?.content?.trim() || null;
}

async function askOllama(message, context = {}) {
  if (!aiConfig.ollama.enabled) return null;

  const baseUrl = getOllamaUrl();
  const primaryModel = getOllamaModel();
  const fallbackModel = primaryModel === "qwen2.5:3b" ? "llama3.2:3b" : "qwen2.5:3b";

  let videoCatalog = "";
  try {
    videoCatalog = await getPromptCatalog();
  } catch {
    // Ignore if not loaded
  }

  const history = Array.isArray(context.history) ? context.history.slice(-10) : [];
  const messages = [
    { role: "system", content: createSystemPrompt(context, videoCatalog) },
    ...history.map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: String(item.content || "").slice(0, 2000),
    })),
    { role: "user", content: String(message).slice(0, 3000) },
  ];

  const primaryTimeout = aiConfig.ollama.timeoutMs;

  try {
    return await callOllamaChat(baseUrl, primaryModel, messages, null, 0.45, primaryTimeout);
  } catch (error) {
    console.warn(`Ollama (${primaryModel}) failed at ${baseUrl}: ${error.message}`);

    const isTimeout =
      error.name === "AbortError" ||
      error.name === "TimeoutError" ||
      /timeout|aborted/i.test(error.message);

    if (isTimeout) {
      console.warn(`Ollama call timed out (${primaryTimeout}ms). Immediately falling back to local fitness engine.`);
      return null;
    }

    // Only try fallback model if error was immediate (e.g. 404 model not found)
    try {
      return await callOllamaChat(baseUrl, fallbackModel, messages, null, 0.45, 6000);
    } catch (fallbackError) {
      console.warn(`Ollama fallback (${fallbackModel}) also failed: ${fallbackError.message}`);
      return null;
    }
  }
}

async function askOllamaStructured(instruction) {
  if (!aiConfig.ollama.enabled) return null;

  const baseUrl = getOllamaUrl();
  const primaryModel = getOllamaModel();
  const fallbackModel = primaryModel === "qwen2.5:3b" ? "llama3.2:3b" : "qwen2.5:3b";
  const messages = [
    { role: "system", content: "Return valid JSON only. Follow the requested schema exactly." },
    { role: "user", content: instruction },
  ];

  const structuredTimeout = 6000;

  try {
    return await callOllamaChat(baseUrl, primaryModel, messages, "json", 0.2, structuredTimeout);
  } catch (error) {
    console.warn(`Ollama structured (${primaryModel}) failed: ${error.message}`);
    const isTimeout =
      error.name === "AbortError" ||
      error.name === "TimeoutError" ||
      /timeout|aborted/i.test(error.message);

    if (isTimeout) {
      return null;
    }

    try {
      return await callOllamaChat(baseUrl, fallbackModel, messages, "json", 0.2, 4000);
    } catch {
      return null;
    }
  }
}

module.exports = { askOllama, askOllamaStructured };
