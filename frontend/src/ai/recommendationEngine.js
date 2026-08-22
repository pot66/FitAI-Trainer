const DAY_TEMPLATE = [
  ["monday", "lower", "ช่วงล่าง"],
  ["tuesday", "upper", "ช่วงบน"],
  ["wednesday", "core", "แกนกลางลำตัว"],
  ["thursday", "cardio", "คาร์ดิโอและความทนทาน"],
  ["friday", "full", "ทั้งร่างกาย"],
  ["saturday", "mobility", "ฟื้นฟูและยืดเหยียด"],
  ["sunday", "rest", "พักผ่อน"],
];

const HIGH_IMPACT = /(jump|burpee|box jump|running)/i;
const KEYWORDS = {
  lower: /(squat|lunge|glute|calf|leg)/i,
  upper: /(push|pull|row|shoulder|biceps|triceps)/i,
  core: /(plank|core|crunch|dead bug)/i,
  cardio: /(walk|march|jack|cardio|cycle|step)/i,
  mobility: /(stretch|mobility|yoga|balance)/i,
};

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateBmi(profile) {
  const height = number(profile?.height);
  const weight = number(profile?.weight);
  if (!height || !weight) return 0;
  return weight / ((height / 100) ** 2);
}

export function getTrainingProfile(profile = {}) {
  const age = number(profile.age);
  const height = number(profile.height);
  const weight = number(profile.weight);
  const bmi = number(profile.bmi) || calculateBmi(profile);
  const notes = [];
  let level = "standard";
  let sets = 3;
  let repetitions = "10–12 ครั้ง";
  let allowImpact = true;

  if (age && age < 18) {
    level = "foundation";
    sets = 2;
    repetitions = "8–10 ครั้ง";
    notes.push("เน้นเรียนรู้ท่าและควบคุมการเคลื่อนไหวก่อนเพิ่มความหนัก");
  }
  if (age >= 55) {
    level = "gentle";
    sets = 2;
    repetitions = "8–10 ครั้ง";
    allowImpact = false;
    notes.push("เพิ่มการวอร์มอัพและเน้นท่าทรงตัว หลีกเลี่ยงการกระแทกที่ไม่จำเป็น");
  }
  if (bmi && bmi < 18.5) {
    level = "strength-focus";
    sets = Math.min(sets, 3);
    repetitions = "8–10 ครั้ง";
    notes.push("เน้นสร้างความแข็งแรงและพักระหว่างเซ็ตให้เพียงพอ");
  } else if (bmi >= 25 && bmi < 30) {
    level = "low-impact";
    sets = 2;
    repetitions = "10–12 ครั้ง";
    allowImpact = false;
    notes.push("เริ่มด้วยคาร์ดิโอแรงกระแทกต่ำและน้ำหนักตัวในช่วงการเคลื่อนไหวที่สบาย");
  } else if (bmi >= 30) {
    level = "low-impact";
    sets = 2;
    repetitions = "6–8 ครั้ง";
    allowImpact = false;
    notes.push("เน้นเดิน ยืดเหยียด และท่ารับน้ำหนักตัวที่ควบคุมได้ หยุดเมื่อเจ็บหรือเวียนศีรษะ");
  }
  if (height && weight && height < 150 && weight > 70) {
    notes.push("ลดระยะการย่อตัวหรือใช้จุดยึดพยุงได้ เพื่อให้ข้อเข่ารับแรงอย่างสบาย");
  }

  // Gender is retained for inclusive profile context, but the plan does not assume
  // fitness level from gender alone. Health conditions should always override this plan.
  const genderNote = profile.gender
    ? "แผนนี้ไม่เหมารวมจากเพศ และควรปรับตามสุขภาพ ความเจ็บปวด หรือข้อจำกัดของคุณ"
    : "เพิ่มเพศใน Profile ได้หากต้องการให้ข้อมูลส่วนตัวครบขึ้น แต่ความปลอดภัยขึ้นกับสุขภาพจริงเป็นหลัก";

  return { age, height, weight, bmi, level, sets, repetitions, allowImpact, notes, genderNote };
}

function availableForFocus(exercises, focus, training) {
  const compatible = exercises.filter((exercise) => {
    const text = `${exercise.name} ${exercise.category || ""} ${exercise.targetMuscle || ""}`;
    return KEYWORDS[focus]?.test(text);
  });
  const safe = exercises.filter((exercise) => !training.allowImpact || !HIGH_IMPACT.test(exercise.name));
  return (compatible.length ? compatible : safe).filter((exercise) => training.allowImpact || !HIGH_IMPACT.test(exercise.name));
}

function chooseDailyExercises(exercises, focus, training, used) {
  const safe = exercises
    .filter((exercise) => training.allowImpact || !HIGH_IMPACT.test(exercise.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  const focused = availableForFocus(exercises, focus, training)
    .sort((left, right) => left.name.localeCompare(right.name));
  const ordered = [...focused, ...safe.filter((exercise) => !focused.some((item) => item.id === exercise.id))];
  const selected = [];

  for (const exercise of ordered) {
    if (!used.has(exercise.name)) {
      selected.push(exercise);
      used.add(exercise.name);
    }
    if (selected.length === 5) return selected;
  }

  // A smaller exercise catalogue can legitimately repeat after every safe
  // option has been used. This preserves a deterministic order, never random.
  for (const exercise of ordered) {
    if (!selected.some((item) => item.id === exercise.id)) selected.push(exercise);
    if (selected.length === 5) break;
  }
  return selected;
}

export function createPersonalizedWeeklyPlan(profile, exercises = []) {
  const training = getTrainingProfile(profile);
  const used = new Set();
  const plan = DAY_TEMPLATE.map(([key, focusKey, focus], index) => {
    if (focusKey === "rest") return { catalogVersion: 2, key, focus, exerciseName: "Rest", exercises: [], sets: "", repetitions: "พักผ่อน", reason: "ให้กล้ามเนื้อฟื้นตัว" };
    const selected = chooseDailyExercises(exercises, focusKey, training, used);
    const exercise = selected[0];
    const isCardio = focusKey === "cardio";
    const repetitions = focusKey === "mobility" ? "8–10 นาที" : isCardio ? (training.allowImpact ? "30–45 วินาที" : "10–15 นาที") : training.repetitions;
    return {
      catalogVersion: 2,
      key,
      focus,
      exerciseName: exercise?.name || "Rest",
      exercises: selected.map((item) => ({ name: item.name, sets: focusKey === "mobility" ? 1 : training.sets, repetitions })),
      sets: focusKey === "mobility" ? 1 : training.sets,
      repetitions,
      reason: training.level === "low-impact" ? "เลือกท่าควบคุมง่ายและแรงกระแทกต่ำ" : "สลับกล้ามเนื้อเพื่อให้ร่างกายฟื้นตัว",
      dayIndex: index,
    };
  });

  return {
    plan,
    training,
    summary: training.bmi
      ? `BMI ${training.bmi.toFixed(1)} · ระดับแผน ${training.level.replace("-", " ")}`
      : "ใช้แผนเริ่มต้น — เติมข้อมูล Profile เพื่อให้ AI ปรับให้แม่นยำขึ้น",
  };
}

export function applyPlanAdjustment(plan, profile, exercises, request) {
  const text = String(request || "").toLowerCase();
  const todayKey = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];
  const training = getTrainingProfile(profile);
  const targetIndex = Math.max(0, plan.findIndex((day) => day.key === todayKey));
  const next = plan.map((day) => ({ ...day }));
  const day = next[targetIndex];
  const needsRecovery = /(พัก|เหนื่อย|ล้า|เจ็บ|ปวด|rest|tired|sore)/.test(text);
  const needsLowImpact = /(เข่า|knee|แรงกระแทก|เบา|low impact|ลดน้ำหนัก|cardio)/.test(text);
  const needsUpper = /(แขน|อก|ไหล่|upper|push)/.test(text);
  const needsLower = /(ขา|สะโพก|lower|leg)/.test(text);
  const needsCore = /(ท้อง|แกนกลาง|core|plank)/.test(text);
  const wantsPlanChange = /(เปลี่ยน|ปรับ|ตาราง|วันนี้|พัก|เหนื่อย|ล้า|เจ็บ|ปวด|แรงกระแทก|เบา|low impact|rest|tired|sore|cardio)/.test(text);

  if (!wantsPlanChange) {
    return { plan, changed: false, message: "" };
  }

  const focusKey = needsUpper ? "upper" : needsLower ? "lower" : needsCore ? "core" : needsLowImpact ? "cardio" : day.focus.includes("ช่วงบน") ? "upper" : day.focus.includes("ช่วงล่าง") ? "lower" : day.focus.includes("แกน") ? "core" : "full";

  if (needsRecovery) {
    next[targetIndex] = { ...day, focus: "พักและฟื้นฟู", exerciseName: "Rest", exercises: [], sets: "", repetitions: "พักผ่อน / ยืดเหยียดเบา ๆ", reason: "AI ลดภาระการฝึกจากข้อความที่แจ้งถึงความล้าหรืออาการเจ็บ" };
    return { plan: next, changed: true, message: "ผมปรับแผนวันนี้เป็นวันพักและฟื้นฟูแล้ว เพื่อไม่ฝืนร่างกายครับ" };
  }

  const safetyProfile = needsLowImpact ? { ...training, allowImpact: false } : training;
  const choices = availableForFocus(exercises, focusKey, safetyProfile).sort((left, right) => left.name.localeCompare(right.name));
  const replacement = choices.find((exercise) => exercise.name !== day.exerciseName) || choices[0];
  if (!replacement) return { plan, changed: false, message: "ยังไม่มีท่าที่เหมาะสมในคลัง Exercise กรุณาเพิ่มท่าในระบบก่อนครับ" };

  const remaining = (day.exercises || []).filter((exercise) => exercise.name !== replacement.name);
  const replacementRepetitions = focusKey === "cardio" ? "10–15 นาที" : safetyProfile.repetitions;
  next[targetIndex] = { ...day, focus: focusKey === "cardio" ? "คาร์ดิโอแรงกระแทกต่ำ" : day.focus, exerciseName: replacement.name, exercises: [{ name: replacement.name, sets: safetyProfile.sets, repetitions: replacementRepetitions }, ...remaining].slice(0, 5), sets: safetyProfile.sets, repetitions: replacementRepetitions, reason: "AI เลือกท่าทดแทนจากข้อมูล Profile และเงื่อนไขที่แจ้ง โดยไม่สุ่มท่า" };
  return { plan: next, changed: true, message: `ผมปรับแผนวันนี้เป็น ${replacement.name} แล้ว โดยเลือกจากความเหมาะสมกับข้อมูลร่างกายและคำขอของคุณครับ` };
}
