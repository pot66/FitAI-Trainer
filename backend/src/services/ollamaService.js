const DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434";

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

function createSystemPrompt(context) {
  return [
    "คุณคือ FitAI Trainer ผู้ช่วยฟิตเนสภาษาไทยที่เป็นมิตร กระชับ และใช้งานได้จริง",
    "ตอบเป็นภาษาเดียวกับผู้ใช้ โดยปกติใช้ภาษาไทย และใช้หัวข้อหรือ bullet เฉพาะเมื่อช่วยให้อ่านง่าย",
    "อ้างอิงข้อมูลผู้ใช้และประวัติการฝึกที่ให้ไว้ ห้ามแต่งข้อมูลเพิ่ม",
    "ให้คำแนะนำออกกำลังกายแบบค่อยเป็นค่อยไป เน้นฟอร์ม การพัก และทางเลือกแรงกระแทกต่ำเมื่อเหมาะสม",
    "หากมีอาการเจ็บหน้าอก หายใจลำบาก เป็นลม ชา อ่อนแรงฉับพลัน หรือปวดรุนแรง ให้แนะนำหยุดออกกำลังกายและพบแพทย์/ฉุกเฉินทันที ไม่วินิจฉัยโรค",
    "ห้ามอ้างว่าเป็นแพทย์ หลีกเลี่ยงการสั่งยา อาหารเสริม หรือการลดน้ำหนักแบบสุดโต่ง",
    `ข้อมูล Profile: ${compactProfile(context.profile)}`,
    `ประวัติการฝึกล่าสุด: ${compactWorkouts(context.workout)}`,
    `แผนวันนี้: ${compactActivePlan(context.activePlan)}`,
  ].join("\n");
}

async function askOllama(message, context = {}) {
  if (String(process.env.OLLAMA_ENABLED || "true").toLowerCase() === "false") return null;

  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL).replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "llama3.2:3b";
  const history = Array.isArray(context.history) ? context.history.slice(-10) : [];
  const messages = [
    { role: "system", content: createSystemPrompt(context) },
    ...history.map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: String(item.content || "").slice(0, 2000),
    })),
    { role: "user", content: String(message).slice(0, 3000) },
  ];

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false, options: { temperature: 0.45 } }),
      signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS || 30000)),
    });
    if (!response.ok) {
      console.warn(`Ollama request failed: ${response.status}`);
      return null;
    }
    const data = await response.json();
    const answer = data?.message?.content?.trim();
    return answer || null;
  } catch (error) {
    console.warn(`Ollama unavailable; using local fitness fallback: ${error.message}`);
    return null;
  }
}

async function askOllamaStructured(instruction) {
  if (String(process.env.OLLAMA_ENABLED || "true").toLowerCase() === "false") return null;
  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL).replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "llama3.2:3b";
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        options: { temperature: 0.2 },
        messages: [{ role: "system", content: "Return valid JSON only. Follow the requested schema exactly." }, { role: "user", content: instruction }],
      }),
      signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS || 30000)),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.message?.content?.trim() || null;
  } catch (error) {
    console.warn(`Ollama structured request unavailable: ${error.message}`);
    return null;
  }
}

module.exports = { askOllama, askOllamaStructured };
