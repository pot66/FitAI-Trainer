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

function compactFoodNutrition(foodLogs = [], profile = null) {
  if (!Array.isArray(foodLogs) || !foodLogs.length) {
    return "วันนี้ยังไม่มีการบันทึกอาหาร (0 kcal)";
  }
  const total = foodLogs.reduce(
    (acc, log) => ({
      calories: Math.round(acc.calories + (Number(log.totalCalories) || 0)),
      protein: Math.round(acc.protein + (Number(log.totalProtein) || 0)),
      carbs: Math.round(acc.carbs + (Number(log.totalCarbs) || 0)),
      fat: Math.round(acc.fat + (Number(log.totalFat) || 0)),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  let targetCal = 2100;
  if (profile?.weight && profile?.height && profile?.age) {
    const w = Number(profile.weight);
    const h = Number(profile.height);
    const a = Number(profile.age);
    const isMale = String(profile.gender || "").toLowerCase().includes("male") || String(profile.gender || "").includes("ชาย");
    const bmr = isMale ? (10 * w + 6.25 * h - 5 * a + 5) : (10 * w + 6.25 * h - 5 * a - 161);
    targetCal = Math.round(bmr * 1.35);
  }
  const remaining = Math.max(0, targetCal - total.calories);

  const meals = foodLogs.map((l) => {
    const itemNames = (l.items || []).map((i) => i.name).join(", ");
    return `${l.mealType}: ${itemNames} (${Math.round(l.totalCalories)} kcal)`;
  }).join("; ");

  return `วันนี้กินไปแล้ว ${total.calories} kcal จากเป้าหมาย ${targetCal} kcal (คงเหลือ ${remaining} kcal) [โปรตีน ${total.protein}g, คาร์บ ${total.carbs}g, ไขมัน ${total.fat}g]. รายการมื้อที่กิน: ${meals}`;
}

function createSystemPrompt(context, videoCatalog = "") {
  const lines = [
    "คุณคือ 'FitAI Trainer' โค้ชฟิตเนสส่วนตัวและผู้เชี่ยวชาญด้านการออกกำลังกายและโภชนาการกีฬาประจำตัวผู้ใช้",
    "สรรพนาม: แทนตัวเองว่า 'ผม' หรือ 'FitAI' และลงท้ายด้วย 'ครับ' เสมอ บุคลิกภาพ: อบอุ่น กระตือรือร้น สุภาพ ให้กำลังใจ เอาใจใส่ และพูดคุยเป็นธรรมชาติเหมือนเทรนเนอร์มืออาชีพ",
    "",
    "【กฎเหล็กสำคัญที่สุด】:",
    "1. [ขอบเขตต้องอยู่ในการออกกำลังกายและสุขภาพเท่านั้น (STRICT FITNESS & HEALTH SCOPE)]:",
    "   - ขอบเขตที่ตอบได้อย่างเต็มที่: การออกกำลังกายทุกรูปแบบ (เวทเทรนนิ่ง, บอดี้เวท, คาร์ดิโอ, HIIT, ยืดเหยียดกล้ามเนื้อ, วอร์มอัพ, คูลดาวน์), การจัดตารางฝึก, การแก้ปัญหาฟอร์มท่า, การป้องกันอาการบาดเจ็บ, การฟื้นฟูกล้ามเนื้อ, วันพัก (Rest day)",
    "   - โภชนาการสำหรับคนออกกำลังกายและสุขภาพ: อาหารคลีน, เมนูโปรตีนสูง, แคลอรี่, คาร์โบไฮเดรตเชิงซ้อน, ไขมันดี, มื้ออาหารก่อนและหลังซ้อม, การคุมน้ำหนัก, การสร้างกล้ามเนื้อและลดไขมัน",
    "   - หากผู้ใช้ถามเรื่องอาหาร เช่น 'มีเมนูอื่นไหม', 'กินอะไรดี', 'เบื่ออกไก่', 'แนะนำอาหารคลีน': ให้อิสระในการแนะนำเมนูอาหารสุขภาพทางเลือกที่หลากหลาย แปลกใหม่ อร่อย ได้สารอาหารครบ และทำตามได้จริงในชีวิตประจำวัน",
    "   - หากผู้ใช้ถามเรื่องที่อยู่นอกเหนือการออกกำลังกาย สุขภาพ และโภชนาการ (เช่น เขียนโค้ดคอมพิวเตอร์, การเงิน, การเมือง, ข่าวบันเทิงดารา, ดูดวง, ซ่อมรถ ฯลฯ) >> คุณต้องปฏิเสธอย่างสุภาพเป็นมิตร และแจ้งว่าคุณเป็นโค้ชฟิตเนส พร้อมชวนกลับมาคุยเรื่องการออกกำลังกายหรือการทานอาหารแทน ห้ามตอบเนื้อหานอกเรื่องนั้นเด็ดขาด!",
    "",
    "2. [อิสระในการตอบและภาษาเป็นธรรมชาติ (CREATIVE & NATURAL CONVERSATION)]:",
    "   - คุณมีอิสระเต็มที่ในการคิดคำตอบ อธิบาย ให้เหตุผล และยกตัวอย่างที่หลากหลาย มีชีวิตชีวา ไม่พูดจาซ้ำซาก",
    "   - ห้ามตอบเป็นแพทเทิร์นตายตัวซ้ำๆ และห้ามขึ้นต้นด้วยประโยคหุ่นยนต์ เช่น 'ผมเข้าใจคำถามของคุณว่า...' หรือก๊อปปี้เทมเพลตเดิมซ้ำๆ เด็ดขาด",
    "   - ตอบด้วยภาษาไทยที่ลื่นไหล กระชับ เข้าใจง่าย และใช้ bullet หรือหัวข้อย่อยเฉพาะเมื่อช่วยให้อ่านง่ายขึ้น",
    "",
    "3. [คำนึงถึงความปลอดภัยและสรีระผู้ใช้]:",
    "   - นำข้อมูลสรีระ (BMI, น้ำหนัก, ส่วนสูง) และเป้าหมายของผู้ใช้มาปรับคำแนะนำให้เหมาะสมและปลอดภัย",
    "   - หากผู้ใช้มีอาการเจ็บหรือมีข้อจำกัด (เช่น เจ็บเข่า, ปวดหลัง) ให้แนะนำท่าทางเลือกที่เซฟและไม่สร้างแรงกดดันต่อข้อต่อ",
    "   - หากมีอาการผิดปกติรุนแรง (เช่น เจ็บหน้าอกรุนแรง, หายใจไม่ออก, หน้ามืดหมดสติ) ให้แนะนำหยุดพักและพบแพทย์ทันที ไม่วินิจฉัยโรค",
  ];

  if (videoCatalog) {
    lines.push(
      "",
      "รายการท่าออกกำลังกายและลิงก์ YouTube ที่ถูกต้องในระบบ (เมื่อแนะนำท่าฝึกให้ระบุชื่อท่า วิธีทำสั้นๆ และแนบลิงก์จากรายการนี้ในรูปแบบ [ชื่อวิดีโอ](URL)):",
      videoCatalog
    );
  }

  lines.push(
    "",
    `ข้อมูล Profile ผู้ใช้: ${compactProfile(context.profile)}`,
    `ประวัติการฝึกล่าสุด: ${compactWorkouts(context.workout)}`,
    `แผนวันนี้: ${compactActivePlan(context.activePlan)}`,
    `ข้อมูลอาหารและแคลอรีวันนี้: ${compactFoodNutrition(context.foodLogs, context.profile)}`
  );

  return lines.join("\n");
}

function getOllamaUrl() {
  return aiConfig.ollama.url;
}

function getOllamaModel() {
  return aiConfig.ollama.model;
}

async function callOllamaChat(baseUrl, model, messages, format = null, temperature = 0.7, customTimeoutMs = null) {
  const timeoutMs = customTimeoutMs || aiConfig.ollama.timeoutMs;
  const payload = {
    model,
    messages,
    stream: false,
    options: { temperature, top_p: 0.9 },
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
  // Only inject video catalog if user is asking about exercise poses or workout routine
  const hasExerciseQuery = /(ท่า|ออกกำลัง|workout|exercise|ซ้อม|ฝึก|สควอท|วิดพื้น|แพลงก์|squat|push.?up|lunge)/i.test(String(message || ""));
  if (hasExerciseQuery) {
    try {
      videoCatalog = await getPromptCatalog();
    } catch {
      // Ignore if not loaded
    }
  }

  // Keep lean history of 4 recent turns to ensure ultra-fast GPU inference (<5s) without timeout
  const history = Array.isArray(context.history) ? context.history.slice(-4) : [];
  const messages = [
    { role: "system", content: createSystemPrompt(context, videoCatalog) },
    ...history.map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: String(item.content || "").slice(0, 500),
    })),
    { role: "user", content: String(message).slice(0, 1500) },
  ];

  const primaryTimeout = aiConfig.ollama.timeoutMs;

  try {
    return await callOllamaChat(baseUrl, primaryModel, messages, null, 0.7, primaryTimeout);
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

    try {
      return await callOllamaChat(baseUrl, fallbackModel, messages, null, 0.7, 12000);
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