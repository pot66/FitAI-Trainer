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
  return Number((weight / ((height / 100) ** 2)).toFixed(2));
}

export function getTrainingProfile(profile = {}) {
  const age = number(profile.age);
  const height = number(profile.height);
  const weight = number(profile.weight);
  const bmi = number(profile.bmi) || calculateBmi(profile);
  const gender = String(profile.gender || "").toLowerCase();
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
  } else if (age >= 50) {
    level = "gentle";
    sets = 2;
    repetitions = "8–10 ครั้ง";
    allowImpact = false;
    notes.push("เน้นท่าที่ปลอดภัยต่อข้อต่อและการทรงตัว หลีกเลี่ยงแรงกระแทก");
  }

  if (bmi && bmi < 18.5) {
    level = "strength-focus";
    sets = 3;
    repetitions = "8–10 ครั้ง";
    notes.push("เน้นสร้างกล้ามเนื้อและความแข็งแรง พักให้เพียงพอ");
  } else if (bmi >= 25 && bmi < 30) {
    level = "low-impact";
    sets = 2;
    repetitions = "10–12 ครั้ง";
    allowImpact = false;
    notes.push("เน้นท่าแรงกระแทกต่ำเพื่อถนอมข้อต่อเข่าและข้อเท้า");
  } else if (bmi >= 30) {
    level = "low-impact";
    sets = 2;
    repetitions = "8–10 ครั้ง";
    allowImpact = false;
    notes.push("เลือกท่าที่ควบคุมง่าย เช่น เก้าอี้สควอต หรือวิดพื้นผนัง ไม่กระโดด");
  }

  let genderNote = "";
  if (gender === "female") {
    genderNote = "ปรับสมดุลเน้นความกระชับของกล้ามเนื้อแกนกลางและช่วงล่าง ควบคู่กับความแข็งแรงของช่วงบน";
  } else if (gender === "male") {
    genderNote = "ปรับสมดุลสร้างความแข็งแกร่งของกล้ามเนื้อทั่วร่างกายทั้งช่วงบนและล่าง";
  } else {
    genderNote = "ปรับแผนตามระดับความพร้อมทางกายภาพและสุขภาพโดยรวมเป็นหลัก";
  }

  return { age, height, weight, bmi, gender, level, sets, repetitions, allowImpact, notes, genderNote };
}

export const FOCUS_CATEGORIES = {
  arm: {
    focusName: "ช่วงแขน",
    primary: ["Tricep Dips", "Overhead Tricep Extension", "Close Grip Push-Ups", "Biceps Curl", "Triceps Dip", "Diamond Push-up", "Wall Push Up", "Arm Circles"],
    lowImpact: ["Wall Push Up", "Arm Circles", "Tricep Dips"],
    femalePriority: ["Tricep Dips", "Wall Push Up", "Arm Circles", "Biceps Curl"],
  },
  lower: {
    focusName: "ช่วงล่าง",
    primary: ["Squat", "Lunges", "Glute Bridge", "Bulgarian Split Squat", "Calf Raise", "Leg Press", "Chair Squat", "Sumo Squat", "Hip Thrust", "Donkey Kick", "Romanian Deadlift", "Forward Lunge", "Reverse Lunge", "Step Up"],
    lowImpact: ["Chair Squat", "Glute Bridge", "Calf Raise", "Sumo Squat", "Step Up", "Donkey Kick", "Leg Press"],
    femalePriority: ["Squat", "Glute Bridge", "Hip Thrust", "Lunges", "Calf Raise", "Sumo Squat"],
  },
  upper: {
    focusName: "ช่วงบน",
    primary: ["Push Up", "Push-up", "Decline Push-up", "Incline Push-up", "Wall Push Up", "Diamond Push-up", "Chest Dip", "Bodyweight Row", "Pull-up", "Inverted Row", "Superman", "Lateral Raise", "Shoulder Press", "Biceps Curl", "Triceps Dip"],
    lowImpact: ["Wall Push Up", "Incline Push-up", "Bodyweight Row", "Superman", "Decline Push-up"],
    femalePriority: ["Incline Push-up", "Wall Push Up", "Bodyweight Row", "Superman", "Decline Push-up"],
  },
  core: {
    focusName: "แกนกลางลำตัว",
    primary: ["Plank", "Crunch", "Bicycle Crunch", "Russian Twist", "Dead Bug", "Bird Dog", "Side Plank", "Leg Raise", "Mountain Climber", "Reverse Crunch", "Sit-up"],
    lowImpact: ["Bird Dog", "Dead Bug", "Plank", "Glute Bridge", "Side Plank"],
    femalePriority: ["Plank", "Dead Bug", "Bird Dog", "Bicycle Crunch", "Russian Twist"],
  },
  cardio: {
    focusName: "คาร์ดิโอและความทนทาน",
    primary: ["Jumping Jack", "High Knees", "Burpee", "Squat Jump", "Skater", "March In Place", "Jump Rope"],
    lowImpact: ["March In Place", "Step Up", "Walking", "Stationary Bike"],
    femalePriority: ["March In Place", "Jumping Jack", "High Knees", "Skater", "Step Up"],
  },
  full: {
    focusName: "ทั้งร่างกาย",
    primary: ["Burpee", "Squat", "Push Up", "Plank", "Lunges", "Jumping Jack", "Glute Bridge"],
    lowImpact: ["Chair Squat", "Wall Push Up", "Glute Bridge", "Bird Dog", "March In Place"],
    femalePriority: ["Squat", "Incline Push-up", "Glute Bridge", "Plank", "Lunges"],
  },
  mobility: {
    focusName: "ฟื้นฟูและยืดเหยียด",
    primary: ["Cat Cow", "Arm Circles", "Bird Dog", "Dead Bug", "Glute Bridge"],
    lowImpact: ["Cat Cow", "Arm Circles", "Bird Dog", "Dead Bug", "Glute Bridge"],
    femalePriority: ["Cat Cow", "Arm Circles", "Bird Dog", "Dead Bug", "Glute Bridge"],
  },
};

export function createPersonalizedWeeklyPlan(profile = {}, exercises = []) {
  const training = getTrainingProfile(profile);
  const isLow = !training.allowImpact || training.level === "low-impact";
  const isFemale = training.gender === "female";

  const DAY_SCHEDULE = [
    ["monday", "lower", "ช่วงล่าง"],
    ["tuesday", "upper", "ช่วงบน"],
    ["wednesday", "core", "แกนกลางลำตัว"],
    ["thursday", "cardio", "คาร์ดิโอและความทนทาน"],
    ["friday", "full", "ทั้งร่างกาย"],
    ["saturday", "mobility", "ฟื้นฟูและยืดเหยียด"],
    ["sunday", "rest", "พักผ่อนและฟื้นฟู"],
  ];

  const plan = DAY_SCHEDULE.map(([key, focusKey, focus], index) => {
    if (focusKey === "rest") {
      return {
        catalogVersion: 2,
        key,
        focus,
        exerciseName: "Rest",
        exercises: [],
        sets: "",
        repetitions: "พักผ่อน / ยืดเหยียดเบา ๆ",
        reason: "วันพักผ่อนเพื่อให้กล้ามเนื้อได้ซ่อมแซมและฟื้นฟูอย่างเต็มที่",
        dayIndex: index,
      };
    }

    const cat = FOCUS_CATEGORIES[focusKey] || FOCUS_CATEGORIES.lower;
    let pool = isLow
      ? cat.lowImpact || cat.primary
      : isFemale && cat.femalePriority
        ? cat.femalePriority
        : cat.primary;

    const availableNames = pool.filter((name) =>
      exercises.length === 0 || exercises.some((e) => e.name.toLowerCase().replace(/[^a-z0-9]/g, "") === name.toLowerCase().replace(/[^a-z0-9]/g, ""))
    );
    const selectedNames = (availableNames.length >= 5 ? availableNames : pool).slice(0, 5);

    const isCardio = focusKey === "cardio";
    const isMobility = focusKey === "mobility";
    const defaultReps = isMobility
      ? "8–10 นาที"
      : isCardio
        ? (isLow ? "30–45 วินาที" : "40–60 วินาที")
        : training.repetitions;

    const dailyExercises = selectedNames.map((name) => ({
      name,
      sets: isMobility ? 1 : training.sets,
      repetitions: defaultReps,
    }));

    return {
      catalogVersion: 2,
      key,
      focus,
      exerciseName: dailyExercises[0]?.name || "Squat",
      exercises: dailyExercises,
      sets: isMobility ? 1 : training.sets,
      repetitions: defaultReps,
      reason: isLow
        ? `คำนวณจาก BMI ${training.bmi || "-"} และอายุ ${training.age || "-"} ปี เน้นท่าแรงกระแทกต่ำเพื่อถนอมข้อต่อ`
        : `คำนวณตามข้อมูลส่วนบุคคลเพื่อเสริมสร้างกล้ามเนื้อกลุ่ม ${focus} อย่างสมดุล`,
      dayIndex: index,
    };
  });

  const profileSignature = `${profile.id || profile.userId || ""}_${training.height}_${training.weight}_${training.age}_${training.gender}`;

  return {
    plan,
    training,
    profileSignature,
    summary: training.bmi
      ? `BMI ${training.bmi} (${training.level === "low-impact" ? "เน้นแรงกระแทกต่ำ ปลอดภัยต่อข้อต่อ" : "ระดับมาตรฐาน สร้างความแข็งแรง"})`
      : "แผนคำนวณเฉพาะบุคคลอ้างอิงจากข้อมูล Profile",
  };
}

export const THAI_EXERCISE_MAP = {
  "เก้าอี้สควอต": "Chair Squat",
  "สควอตเก้าอี้": "Chair Squat",
  "วิดพื้นผนัง": "Wall Push Up",
  "วิดพื้นกำแพง": "Wall Push Up",
  "บูลกาเรียน": "Bulgarian Split Squat",
  "รัสเชียนทวิสต์": "Russian Twist",
  "เบิร์ดด็อก": "Bird Dog",
  "เดดบัก": "Dead Bug",
  "ไฟร์ไฮแดรนต์": "Fire Hydrant",
  "ฮิปทรัสต์": "Hip Thrust",
  "ดองกีคิก": "Donkey Kick",
  "คาล์ฟเรส": "Calf Raise",
  "เดินเร็ว": "March In Place",
  "เดินอยู่กับที่": "March In Place",
  "สควอต": "Squat",
  "สควัต": "Squat",
  "วิดพื้น": "Push Up",
  "แพลงก์": "Plank",
  "แพลงค์": "Plank",
  "ลันจ์": "Lunges",
  "ครันช์": "Crunch",
  "ซิทอัพ": "Sit-up",
  "กระโดดตบ": "Jumping Jack",
  "เบอร์ปี": "Burpee",
  "ดึงข้อ": "Pull-up",
  "บริดจ์": "Glute Bridge",
  "ซูเปอร์แมน": "Superman",
  "เลกเพรส": "Leg Press",
  "เลกเอ็กซ์เทนชั่น": "Leg Extension",
  "กระโดดเชือก": "Jump Rope",
  "ปั่นจักรยาน": "Stationary Bike",
  "ว่ายน้ำ": "Swimming",
  "วิ่ง": "Jogging",
};

export function extractTargetExercise(text, exercises = []) {
  const lower = String(text || "").toLowerCase();

  // 1. Check if user specified "เป็น [ท่า]" or "แทน [ท่า]"
  const afterPattern = /(?:เป็น|แทน|มาเป็น|ไปเป็น|เปลี่ยนเป็น|ขอท่า|ฝึกท่า)\s+([A-Za-zก-๙\s\-]+)/i;
  const match = lower.match(afterPattern);
  if (match && match[1]) {
    const sub = match[1].trim();
    for (const [thaiTerm, engName] of Object.entries(THAI_EXERCISE_MAP).sort((a, b) => b[0].length - a[0].length)) {
      if (sub.includes(thaiTerm)) {
        const found = exercises.find((ex) =>
          ex.name.toLowerCase().replace(/[^a-z0-9]/g, "") === engName.toLowerCase().replace(/[^a-z0-9]/g, "")
        );
        if (found) return found;
      }
    }
    const sorted = [...exercises].sort((a, b) => b.name.length - a.name.length);
    for (const ex of sorted) {
      if (sub.includes(ex.name.toLowerCase())) return ex;
    }
  }

  // 2. Search general Thai exercise terms (longer phrases first)
  for (const [thaiTerm, engName] of Object.entries(THAI_EXERCISE_MAP).sort((a, b) => b[0].length - a[0].length)) {
    if (lower.includes(thaiTerm)) {
      const found = exercises.find((ex) =>
        ex.name.toLowerCase().replace(/[^a-z0-9]/g, "") === engName.toLowerCase().replace(/[^a-z0-9]/g, "")
      );
      if (found) return found;
    }
  }

  // 3. Search English exercise names (longer phrases first)
  const sortedByLen = [...exercises].sort((a, b) => b.name.length - a.name.length);
  for (const ex of sortedByLen) {
    if (lower.includes(ex.name.toLowerCase())) {
      return ex;
    }
  }

  return null;
}


export const TUTORIAL_VERBS_REGEX = /(ยืนตรง|โดยวาง|ขับขา|เมื่อ|ปรับตำแหน่ง|กลับ.*คืน|เริ่มต้น|ให้หายใจ|หายใจเข้า|หายใจออก|ยืดขา|งอข้อศอก|งอเข่า|เกร็งหน้าท้อง|เกร็งลำตัว|เกร็งกล้ามเนื้อ|ก้าวเท้า|วางเท้า|ส่งน้ำหนัก|ระดับศีรษะ|ระดับสายตา|ลำตัวตรง|หลังตรง|ค่อยๆ|ดันตัว|ดึงตัว|ทำซ้ำ|ค้างไว้|ระวัง|อย่าให้|วางมือ|วางฝ่ามือ|ยุบข้อศอก|ย่อสะโพก|ลุกขึ้นยืน|โน้มตัว|สูดลมหายใจ)/i;

function isInstructionSentence(str) {
    if (!str) return false;
    const clean = str.trim();
    if (clean.length > 35) return true;
    if (TUTORIAL_VERBS_REGEX.test(clean)) return true;
    return false;
}

export function extractExercisesFromAssistantText(text, availableExercises = []) {
    if (!text) return null;
    const lines = String(text).split(/\r?\n/);
    const exercises = [];
    let focus = '';

    if (/(ช่วงแขน|แขน|ไทรเซป|ไบเซป|bicep|tricep|arm)/i.test(text)) focus = 'ช่วงแขน';
    else if (/(ช่วงบน|อก|หลัง|ไหล่|chest|back|shoulder)/i.test(text)) focus = 'ช่วงบน';
    else if (/(ช่วงล่าง|ขา|ก้น|สะโพก|ต้นขา|leg|quad|glute)/i.test(text)) focus = 'ช่วงล่าง';
    else if (/(แกนกลาง|หน้าท้อง|พุง|abs|core)/i.test(text)) focus = 'แกนกลางลำตัว';
    else if (/(คาร์ดิโอ|cardio)/i.test(text)) focus = 'คาร์ดิโอและความทนทาน';

    for (const line of lines) {
        const trimmed = line.trim();
        const exMatch = trimmed.match(/^(?:\d+[\.\)]|\-|\*|•)\s*([A-Za-zก-๙\s\-]+?)(?:\s*\((\d+)\s*เซ็ต\s*[\·,\.]\s*([^\)]+)\))?(?:\s*▶️.*)?$/);
        if (exMatch && exMatch[1]) {
            const rawName = exMatch[1].replace(/^[0-9\.\s]+/, '').trim();
            const hasExplicitSetsReps = Boolean(exMatch[2] && exMatch[3]);

            if (isInstructionSentence(rawName)) {
                continue;
            }

            if (!hasExplicitSetsReps) {
                if (rawName.length > 25 || /^(วิดีโอ|youtube|คลิป|ท่า|คำแนะนำ|ช่วง|ตาราง|ข้อแนะนำ|วิธี|ขั้นตอน|ข้อควรระวัง)/i.test(rawName)) {
                    continue;
                }
            }

            if (rawName.length >= 2 && !/^(วิดีโอ|youtube|คลิป|ท่า|คำแนะนำ|ช่วง|ตาราง|ข้อแนะนำ|วิธี|ขั้นตอน|ข้อควรระวัง)/i.test(rawName)) {
                exercises.push({
                    name: rawName,
                    sets: exMatch[2] ? Number(exMatch[2]) : 3,
                    repetitions: exMatch[3] ? exMatch[3].trim() : '10–12 ครั้ง'
                });
            }
        }
    }

    if (exercises.length > 0) {
        return { focus: focus || 'ช่วงแขน', exercises };
    }

    // Fallback for single exercise tutorial: check Kettlebell / คัทลียาบัล
    if (/(คัทลียาบัล|เคตเทิลเบล|เคตเทิลเบลล์|kettlebell)/i.test(text)) {
        return {
            focus: focus || 'ช่วงบน',
            exercises: [
                {
                    name: 'Kettlebell Swing',
                    sets: 3,
                    repetitions: '10–12 ครั้ง'
                }
            ]
        };
    }

    // Check availableExercises from DB/catalog
    if (Array.isArray(availableExercises) && availableExercises.length > 0) {
        for (const ex of availableExercises) {
            if (ex.name && ex.name.length > 3) {
                const escaped = ex.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regex = new RegExp(`\\b${escaped}\\b`, 'i');
                if (regex.test(text)) {
                    return {
                        focus: focus || ex.category || 'การออกกำลังกาย',
                        exercises: [
                            {
                                name: ex.name,
                                sets: 3,
                                repetitions: '10–12 ครั้ง'
                            }
                        ]
                    };
                }
            }
        }
    }

    const COMMON_EXERCISES = [
        { pattern: /(วิดพื้น|push[- ]?up)/i, name: 'Push Up', focus: 'ช่วงบน' },
        { pattern: /(สควอท|สควอต|squat)/i, name: 'Squat', focus: 'ช่วงล่าง' },
        { pattern: /(แพลงก์|แพลงค์|plank)/i, name: 'Plank', focus: 'แกนกลางลำตัว' },
        { pattern: /(ลันจ์|lunges?)/i, name: 'Lunges', focus: 'ช่วงล่าง' },
        { pattern: /(ดิปส์|tricep dips?|dips?)/i, name: 'Tricep Dips', focus: 'ช่วงแขน' },
        { pattern: /(ไบเซป|biceps? curl)/i, name: 'Biceps Curl', focus: 'ช่วงแขน' },
        { pattern: /(ซิทอัพ|sit[- ]?up)/i, name: 'Sit-up', focus: 'แกนกลางลำตัว' },
        { pattern: /(ครันช์|crunch)/i, name: 'Crunch', focus: 'แกนกลางลำตัว' },
        { pattern: /(เบอร์ปี|burpee)/i, name: 'Burpee', focus: 'ทั้งร่างกาย' },
        { pattern: /(กระโดดตบ|jumping jack)/i, name: 'Jumping Jack', focus: 'คาร์ดิโอและความทนทาน' }
    ];

    for (const item of COMMON_EXERCISES) {
        if (item.pattern.test(text)) {
            return {
                focus: focus || item.focus,
                exercises: [
                    {
                        name: item.name,
                        sets: 3,
                        repetitions: '10–12 ครั้ง'
                    }
                ]
            };
        }
    }

    return null;
}

export function cleanExerciseName(name) {
  if (!name) return "";
  let clean = String(name).trim();
  const isInstruction = clean.length > 35 || TUTORIAL_VERBS_REGEX.test(clean);
  if (isInstruction) {
    if (/(คัทลียาบัล|เคตเทิลเบล|เคตเทิลเบลล์|kettlebell)/i.test(clean)) return "Kettlebell Swing";
    if (/(วิดพื้น|push)/i.test(clean)) return "Push Up";
    if (/(สควอท|squat)/i.test(clean)) return "Squat";
    if (/(แพลงก์|plank)/i.test(clean)) return "Plank";
    if (/(ลันจ์|lunge)/i.test(clean)) return "Lunges";
    if (/(ดิปส์|dips)/i.test(clean)) return "Tricep Dips";
    return "Bodyweight Exercise";
  }
  return clean;
}

export function sanitizePlan(plan) {
  if (!Array.isArray(plan)) return plan;
  return plan.map((day) => {
    if (!day) return day;
    const rawExercises = Array.isArray(day.exercises) && day.exercises.length > 0
      ? day.exercises
      : (day.exerciseName ? [{ name: day.exerciseName, sets: day.sets || 3, repetitions: day.repetitions || "10–12 ครั้ง" }] : []);
    const seen = new Set();
    const sanitizedExercises = [];
    for (const ex of rawExercises) {
      const cleanName = cleanExerciseName(ex.name);
      if (cleanName && !seen.has(cleanName)) {
        seen.add(cleanName);
        sanitizedExercises.push({
          ...ex,
          name: cleanName,
          sets: ex.sets || 3,
          repetitions: ex.repetitions || "10–12 ครั้ง"
        });
      }
    }
    const primaryName = sanitizedExercises[0]?.name || cleanExerciseName(day.exerciseName) || "Exercise";
    return {
      ...day,
      exerciseName: primaryName,
      exercises: sanitizedExercises.length > 0 ? sanitizedExercises : rawExercises
    };
  });
}

export function applyPlanAdjustment(plan, profile, exercises = [], request, lastAssistantMessage = "") {
  const text = String(request || "").toLowerCase();

  // Food & Nutrition query guard: Do not hijack food inquiries as workout plan modifications
  const isFoodQuery = /(อาหาร|เมนู|กิน|ทาน|แดก|แคล|แคลอรี่|กี่แคล|calorie|calories|nutrition|โภชนาการ|โปรตีน|คาร์บ|ไขมัน|ข้าว|อกไก่|สลัด|กะเพรา|ก๋วยเตี๋ยว|ส้มตำ|มื้อ|diet|food|bmr|tdee)/i.test(text);
  const isExplicitPlanRequest = /(เปลี่ยนท่า|เปลี่ยนตาราง|ปรับตาราง|แก้ตาราง|ขอเปลี่ยนตาราง|ตารางออกกำลังกาย|ท่าออกกำลังกาย)/i.test(text);
  if (isFoodQuery && !isExplicitPlanRequest) {
    return { plan, changed: false, message: "" };
  }
  const todayKey = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];
  const targetIndex = Math.max(0, plan.findIndex((day) => day.key === todayKey));
  const current = plan[targetIndex] || { key: todayKey, focus: "ช่วงล่าง", exercises: [] };
  const next = plan.map((day) => ({ ...day, exercises: Array.isArray(day.exercises) ? [...day.exercises] : [] }));

  // Anaphoric reference: User says "นำท่านี้ไปใช้ในตาราง", "เอาท่านี้ใส่ตาราง", "ตามที่แนะนำ"
  const isAnaphoric = /(ท่านี้|ท่าเหล่านี้|ท่าพวกนี้|ตามนี้|ที่แนะนำ|ที่บอก|ท่านั้น|ท่าข้างบน|เอาท่านี้|นำท่านี้|ใช้ท่านี้|จัดตามนี้|อัปเดตตามนี้|ใส่ตารางของวันนี้|ใช้ในตาราง|นำมาใช้ในตาราง|นำไปใช้ในตาราง|ใส่ตาราง|เพิ่มในตาราง|ลงตาราง)/i.test(text);
  if (isAnaphoric && lastAssistantMessage) {
    const extracted = extractExercisesFromAssistantText(lastAssistantMessage, exercises);
    if (extracted && extracted.exercises.length > 0) {
      next[targetIndex] = {
        ...current,
        focus: extracted.focus || "ช่วงแขน",
        exerciseName: extracted.exercises[0].name,
        exercises: extracted.exercises,
        reason: "AI อัปเดตตารางตามท่าที่แนะนำให้ผู้ใช้ล่าสุด",
        updatedAt: new Date().toISOString(),
      };
      const exerciseListStr = extracted.exercises
        .map((ex, i) => `${i + 1}. **${ex.name}** (${ex.sets ? `${ex.sets} เซ็ต · ` : ""}${ex.repetitions})`)
        .join("\n");
      return {
        plan: sanitizePlan(next),
        changed: true,
        message: `ตารางการออกกำลังกายสำหรับวันนี้ (${extracted.focus || 'การออกกำลังกาย'}):\n\n` +
          `ท่าในตารางที่ต้องออกสำหรับวันนี้:\n` +
          `${exerciseListStr}\n\n` +
          `ตารางออกกำลังกายทางด้านขวาได้รับการอัปเดตตรงตามรายการนี้เรียบร้อยแล้วครับ 🎯`,
      };
    }
  }

  const wantsChange = /(เปลี่ยน|ปรับ|แก้ไข|กิจกรรม|แนะนำ|เลือก|จัด|ขอ|สลับ|แทน|อยาก|ช่วย|ท่า|ตาราง|แผน|วันนี้|เหนื่อย|ล้า|เจ็บ|ปวด|เบา|พัก|rest|tired|change|adjust|edit|นำท่านี้|เอาท่านี้)/i.test(text);
  if (!wantsChange) {
    return { plan, changed: false, message: "" };
  }

  // 1. Check if user needs rest / recovery
  const needsRecovery = /(พัก|เหนื่อย|ล้า|เจ็บ|ปวด|เมื่อย|ไม่ไหว|rest|tired|sore|pain)/i.test(text);
  if (needsRecovery && !/(ไม่พัก|อยากออก|ขอท่า|เปลี่ยนเป็น)/i.test(text)) {
    next[targetIndex] = {
      ...current,
      focus: "พักผ่อนและฟื้นฟู",
      exerciseName: "Rest",
      exercises: [],
      sets: "",
      repetitions: "พักผ่อน / ยืดเหยียดเบา ๆ",
      reason: "AI ปรับเป็นวันพักตามที่ผู้ใช้แจ้งถึงความเหนื่อยล้าหรืออาการเจ็บ",
      updatedAt: new Date().toISOString(),
    };
    return {
      plan: next,
      changed: true,
      message: "ผมปรับแผนของวันนี้เป็น “วันพักและฟื้นฟูร่างกาย” ให้เรียบร้อยแล้วครับ พักผ่อนและดื่มน้ำให้เพียงพอนะครับ",
    };
  }

  // 2. Custom sets or repetitions request (e.g. "ขอ 2 เซ็ต", "ขอ 15 ครั้ง")
  const setsMatch = text.match(/(\d+)\s*เซ็ต/);
  const customSets = setsMatch ? Number(setsMatch[1]) : null;
  const repsMatch = text.match(/(\d+[-–]\d+|\d+)\s*(?:ครั้ง|วินาที|นาที)/);
  const customReps = repsMatch ? repsMatch[0] : null;

  // 3. Extract target exercise if user specified a pose
  const specificExercise = extractTargetExercise(text, exercises);

  // Check if user specifically requested to replace an existing pose: "เปลี่ยนท่า [A] เป็น [B]"
  let replacedOldExercise = null;
  const replacePattern = /เปลี่ยน(?:ท่า)?\s+([A-Za-zก-๙\s\-]+?)\s+(?:เป็น|แทน|มาเป็น)\s+([A-Za-zก-๙\s\-]+)/i;
  const replaceMatch = text.match(replacePattern);
  if (replaceMatch && replaceMatch[1]) {
    const oldTerm = replaceMatch[1].trim().toLowerCase();
    replacedOldExercise = (current.exercises || []).find((e) => {
      const eLow = e.name.toLowerCase();
      return eLow.includes(oldTerm) || oldTerm.includes(eLow);
    });
  }

  // 4. Determine category focus / activity
  const isArm = /(แขน|ต้นแขน|ไทรเซป|ไบเซป|bicep|tricep|arm)/i.test(text);
  const isLower = /(ช่วงล่าง|ขา|ก้น|สะโพก|ต้นขา|lower|leg|squat|lunge)/i.test(text);
  const isUpper = /(ช่วงบน|อก|หลัง|แขน|ไหล่|upper|push|pull|chest)/i.test(text);
  const isCore = /(แกนกลาง|หน้าท้อง|พุง|เอว|core|abs|plank|crunch)/i.test(text);
  const isCardio = /(คาร์ดิโอ|ลดน้ำหนัก|ลดไขมัน|เบิร์น|cardio|fat|burn|เดินเร็ว|วิ่ง|ปั่นจักรยาน)/i.test(text);
  const isMobility = /(ยืดเหยียด|ฟื้นฟู|โยคะ|mobility|stretch)/i.test(text);
  const isFull = /(ทั้งตัว|ทั้งร่างกาย|full\s*body)/i.test(text);
  const isLowImpact = /(แรงกระแทกต่ำ|เจ็บเข่า|ปวดเข่า|ข้อเข่า|low\s*impact|เข่าไม่ดี|น้ำหนักเยอะ)/i.test(text);

  let categoryKey = isArm ? "arm" : isLower ? "lower"
    : isUpper ? "upper"
    : isCore ? "core"
    : isCardio ? "cardio"
    : isMobility ? "mobility"
    : isFull ? "full"
    : null;

  if (!categoryKey) {
    if (specificExercise) {
      const cat = (specificExercise.category || "").toLowerCase();
      if (cat.includes("leg") || cat.includes("quad") || cat.includes("glute") || cat.includes("lower")) categoryKey = "lower";
      else if (cat.includes("chest") || cat.includes("back") || cat.includes("shoulder") || cat.includes("arm") || cat.includes("upper")) categoryKey = "upper";
      else if (cat.includes("core") || cat.includes("abs")) categoryKey = "core";
      else if (cat.includes("cardio")) categoryKey = "cardio";
      else categoryKey = "lower";
    } else {
      categoryKey = (current.focus || "").includes("แขน") ? "arm" : (current.focus || "").includes("บน") ? "upper"
        : (current.focus || "").includes("แกน") ? "core"
        : (current.focus || "").includes("คาร์ดิโอ") ? "cardio"
        : (current.focus || "").includes("ยืด") || (current.focus || "").includes("ฟื้นฟู") ? "mobility"
        : (current.focus || "").includes("ทั้ง") ? "full"
        : "lower";
    }
  }

  const categoryInfo = FOCUS_CATEGORIES[categoryKey] || FOCUS_CATEGORIES.lower;
  const training = getTrainingProfile(profile);
  const useLowImpact = isLowImpact || !training.allowImpact;

  const targetPool = useLowImpact && categoryInfo.lowImpact
    ? categoryInfo.lowImpact
    : categoryInfo.primary;

  // Case A: User replaced a single exercise in today's table
  if (specificExercise && replacedOldExercise && Array.isArray(current.exercises) && current.exercises.length > 0) {
    const updatedExercises = current.exercises.map((ex) => {
      if (ex.name === replacedOldExercise.name) {
        return {
          name: specificExercise.name,
          sets: customSets || ex.sets || training.sets,
          repetitions: customReps || ex.repetitions || training.repetitions,
        };
      }
      return {
        ...ex,
        sets: customSets || ex.sets,
        repetitions: customReps || ex.repetitions,
      };
    });

    next[targetIndex] = {
      ...current,
      exerciseName: updatedExercises[0].name,
      exercises: updatedExercises,
      reason: `เปลี่ยนท่า ${replacedOldExercise.name} เป็น ${specificExercise.name} ตามคำขอของผู้ใช้`,
      updatedAt: new Date().toISOString(),
    };

    const exerciseListStr = updatedExercises.map((ex, i) => `${i + 1}. **${ex.name}** (${ex.sets ? `${ex.sets} เซ็ต · ` : ""}${ex.repetitions})`).join("\n");
    return {
      plan: next,
      changed: true,
      message: `FitAI ปรับตารางแผนออกกำลังกายให้แล้วครับ โดยเปลี่ยนท่า ${replacedOldExercise.name} เป็น **${specificExercise.name}** เรียบร้อยแล้วครับ:\n\n${exerciseListStr}`,
    };
  }

  // Case B: General adjustment or category switch
  let primaryName = specificExercise?.name;
  if (!primaryName) {
    const candidates = targetPool.filter((name) =>
      exercises.some((e) => e.name.toLowerCase().replace(/[^a-z0-9]/g, "") === name.toLowerCase().replace(/[^a-z0-9]/g, ""))
    );
    primaryName = candidates[0] || targetPool[0];
  }

  const compPool = targetPool.filter((name) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, "") !== primaryName.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  const selectedExerciseNames = [primaryName, ...compPool].slice(0, 5);

  const newExercises = selectedExerciseNames.map((name) => {
    const existing = (current.exercises || []).find((e) => e.name === name);
    return {
      name,
      sets: customSets || existing?.sets || training.sets || 3,
      repetitions: customReps || existing?.repetitions || (categoryKey === "cardio" ? "30–45 วินาที" : training.repetitions || "10–12 ครั้ง"),
    };
  });

  const dayLabels = {
    monday: "จันทร์",
    tuesday: "อังคาร",
    wednesday: "พุธ",
    thursday: "พฤหัสบดี",
    friday: "ศุกร์",
    saturday: "เสาร์",
    sunday: "อาทิตย์",
  };
  const dayLabel = dayLabels[todayKey] || "วันนี้";

  next[targetIndex] = {
    ...current,
    focus: categoryInfo.focusName,
    exerciseName: newExercises[0].name,
    exercises: newExercises,
    sets: newExercises[0].sets,
    repetitions: newExercises[0].repetitions,
    reason: specificExercise
      ? `เปลี่ยนท่าหลักเป็น ${specificExercise.name} ตามคำขอของผู้ใช้`
      : `FitAI ปรับท่าสำหรับกลุ่ม ${categoryInfo.focusName}${useLowImpact ? " (แรงกระแทกต่ำ)" : ""}`,
    updatedAt: new Date().toISOString(),
  };

  const exerciseListStr = newExercises.map((ex, i) => `${i + 1}. **${ex.name}** (${ex.sets ? `${ex.sets} เซ็ต · ` : ""}${ex.repetitions})`).join("\n");

  const messageText = specificExercise
    ? `FitAI ปรับตารางแผนออกกำลังกายวัน${dayLabel} ให้แล้วครับ โดยเปลี่ยนท่าหลักเป็น **${specificExercise.name}** พร้อมจัดท่าเสริมในกลุ่ม ${categoryInfo.focusName} ให้เข้าชุดกันเรียบร้อยแล้วครับ:\n\n${exerciseListStr}`
    : `FitAI ปรับตารางแผนออกกำลังกายวัน${dayLabel} ให้เน้นกลุ่ม ${categoryInfo.focusName}${useLowImpact ? " (แรงกระแทกต่ำ)" : ""} เรียบร้อยแล้วครับ:\n\n${exerciseListStr}`;

  return {
    plan: next,
    changed: true,
    message: messageText,
  };
}
