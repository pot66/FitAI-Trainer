const path = require('path');
const fs = require('fs');

// 1. Load exercise QA dataset (852 items)
let dataset = [];
try {
  const dataPath = path.join(__dirname, '../data/exercise_qa_dataset.json');
  dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (err) {
  console.warn('Could not load exercise_qa_dataset.json:', err.message);
}

// 2. Load lifestyle & constraint coaching dataset (Personas, Constraints, Thai Food Hacks)
let lifestyleData = { personas: {}, constraints: {}, thai_food_hacks: {} };
try {
  const lifestylePath = path.join(__dirname, '../data/lifestyle_coaching_dataset.json');
  if (fs.existsSync(lifestylePath)) {
    lifestyleData = JSON.parse(fs.readFileSync(lifestylePath, 'utf8'));
  }
} catch (err) {
  console.warn('Could not load lifestyle_coaching_dataset.json:', err.message);
}


// 4. Load 200,000 Trained Exercise Knowledge Dataset (20 Categories)
let exerciseTrainingKnowledge = { categories: {} };
try {
  const trainingPath = path.join(__dirname, '../data/exercise_training_knowledge.json');
  if (fs.existsSync(trainingPath)) {
    exerciseTrainingKnowledge = JSON.parse(fs.readFileSync(trainingPath, 'utf8'));
  }
} catch (err) {
  console.warn('Could not load exercise_training_knowledge.json:', err.message);
}

// 3. Load Finetuned Knowledge & Safety Dataset (Dialects, Red Flags, Clarification, Needs Care)
let finetunedData = {
  dialectLexicon: {},
  emergencyRedFlags: [],
  clarificationTemplates: {},
  needsCareRules: {}
};
try {
  const finetunedPath = path.join(__dirname, '../data/coaching_finetuned_knowledge.json');
  if (fs.existsSync(finetunedPath)) {
    finetunedData = JSON.parse(fs.readFileSync(finetunedPath, 'utf8'));
  }
} catch (err) {
  console.warn('Could not load coaching_finetuned_knowledge.json:', err.message);
}

// Helper: Normalize Dialect (North, Isan, South, Slang)
function detectAndNormalizeDialect(text) {
  if (!text) return { hasDialect: false, normalizedText: text, dialect: null };
  let normalized = text;
  const matchCounts = { 'อีสาน': 0, 'เหนือ': 0, 'ใต้': 0, 'สแลง/แชท': 0 };

  const dialects = [
    { name: 'อีสาน', dict: finetunedData.dialectLexicon?.isan || {} },
    { name: 'เหนือ', dict: finetunedData.dialectLexicon?.north || {} },
    { name: 'ใต้', dict: finetunedData.dialectLexicon?.south || {} },
    { name: 'สแลง/แชท', dict: finetunedData.dialectLexicon?.slang || {} }
  ];

  for (const { name, dict } of dialects) {
    // Sort keys by descending length so compound phrases match first
    const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
    for (const slang of sortedKeys) {
      if (normalized.includes(slang)) {
        matchCounts[name] += slang.length;
        normalized = normalized.split(slang).join(dict[slang]);
      }
    }
  }

  let bestDialect = null;
  let maxScore = 0;
  for (const [name, score] of Object.entries(matchCounts)) {
    if (score > maxScore) {
      maxScore = score;
      bestDialect = name;
    }
  }

  return {
    hasDialect: maxScore > 0,
    dialect: bestDialect,
    normalizedText: normalized
  };
}

// Helper: Detect Emergency Red Flags (1669 Triage)
function detectEmergencyRedFlags(text) {
  if (!text || !finetunedData.emergencyRedFlags) return null;
  for (const flag of finetunedData.emergencyRedFlags) {
    if (flag.patterns && flag.patterns.some(p => text.includes(p))) {
      return flag;
    }
  }
  return null;
}

// Helper: Detect Clarification Needed (Broad Questions)
function detectClarificationNeeded(text) {
  if (!text || !finetunedData.clarificationTemplates) return null;
  const isShortOrBroad = text.length < 50;
  if (!isShortOrBroad) return null;

  for (const [key, item] of Object.entries(finetunedData.clarificationTemplates)) {
    if (item.triggers && item.triggers.some(t => text.toLowerCase().includes(t.toLowerCase()))) {
      return { key, ...item };
    }
  }
  return null;
}

// Helper detection functions
function detectPersona(text) {
  if (!text || !lifestyleData.personas) return null;
  for (const [key, p] of Object.entries(lifestyleData.personas)) {
    if (p.keywords && new RegExp(p.keywords, 'i').test(text)) {
      return { key, ...p };
    }
  }
  return null;
}

function detectConstraint(text) {
  if (!text || !lifestyleData.constraints) return null;
  for (const [key, c] of Object.entries(lifestyleData.constraints)) {
    if (c.keywords && new RegExp(c.keywords, 'i').test(text)) {
      return { key, ...c };
    }
  }
  return null;
}

function detectFoodHack(text) {
  if (!text || !lifestyleData.thai_food_hacks) return null;
  for (const [key, h] of Object.entries(lifestyleData.thai_food_hacks)) {
    if (h.keywords && new RegExp(h.keywords, 'i').test(text)) {
      return { key, ...h };
    }
  }
  return null;
}

// Map dataset items for fast lookup by intent
const intentMap = new Map();
for (const item of dataset) {
  if (!intentMap.has(item.intent)) {
    intentMap.set(item.intent, item);
  }
}

// Intent matching rules with regexes
const INTENT_RULES = [
  // 0. App Capabilities & Self-Introduction
  { intent: 'app_introduction_capabilities', regex: /(แนะนำตัว|คุณคือใคร|คุณเป็นใคร|ช่วยอะไรได้บ้าง|ทำอะไรได้บ้าง|ฟังก์ชันเด่น|ฟังก์ชันของ|ความสามารถ|ระบบทำอะไร|แนะนำ.*fitai|fitai.*คืออะไร|มีฟังก์ชันอะไร|แนะนำระบบ|ฟังก์ชัน.*มีอะไร)/i },

  // 1. Safety Priority (Handled by detectEmergencyRedFlags first, but kept for general injuries)
  { intent: 'safety_chest_pain', regex: /(เจ็บหน้าอก|แน่นหน้าอก|หายใจไม่ออก|หน้ามืด|วิงเวียนรุนแรง)/i },
  { intent: 'safety_back_pain', regex: /(ปวดหลังล่าง|เจ็บหลัง|หลังโก่ง|แปล๊บที่หลัง)/i },
  { intent: 'safety_knee_pain', regex: /(เจ็บเข่า|ปวดเข่า|เข่าดังก๊อบ|เสียวเข่า)/i },
  { intent: 'safety_dizziness', regex: /(หน้ามืด|ตาลาย|วิงเวียน|จะเป็นลม|มึนหัว)/i },
  { intent: 'safety_joint_pain', regex: /(เจ็บข้อมือ|เจ็บข้อเท้า|เจ็บหัวไหล่|เอ็นอักเสบ)/i },

  // 2. Training Plans & Routines
  { intent: 'plan_push_pull_legs', regex: /(push pull legs|ppl|ดัน ดึง ขา|พุช พูล เลก)/i },
  { intent: 'plan_upper_lower', regex: /(upper lower|บนล่าง|ตารางบนล่าง)/i },
  { intent: 'plan_full_body', regex: /(full body|ฟูลบอดี้|เล่นทั้งตัว)/i },
  { intent: 'plan_home_no_equipment', regex: /(ออกกำลังกายที่บ้าน.*ไม่ใช้อุปกรณ์|บอดี้เวทที่บ้าน|อยู่คอนโด.*ไม่มีอุปกรณ์)/i },
  { intent: 'plan_dumbbell', regex: /(ตารางดัมเบล|เล่นด้วยดัมเบล|มีดัมเบล 1 คู่)/i },
  { intent: 'plan_time_15', regex: /(15 นาที|มีเวลา 15 นาที|ตาราง 15 นาที)/i },
  { intent: 'plan_time_30', regex: /(30 นาที|มีเวลา 30 นาที|ตาราง 30 นาที)/i },
  { intent: 'plan_beginner', regex: /(มือใหม่เริ่มยังไง|เพิ่งเริ่มออกกำลัง|beginner workout|ตารางคนเพิ่งเริ่ม)/i },
  { intent: 'home_workout', regex: /(ออกกำลังที่บ้าน|โฮมเวิร์กเอาต์|home workout)/i },
  { intent: 'gym_workout', regex: /(ตารางเล่นในยิม|เข้ายิมเล่นอะไรดี|เครื่องเล่นในยิม)/i },

  // 3. Exercise Form & Poses
  { intent: 'exercise_explain', regex: /(ท่านี้ทำยังไง|สอนท่า|วิธีเล่นท่า|อธิบายท่า)/i },
  { intent: 'exercise_target_muscle', regex: /(ท่านี้โดนส่วนไหน|squat โดนอะไร|push up โดนอะไร|deadlift โดนตรงไหน)/i },
  { intent: 'exercise_sets_reps', regex: /(ควรเล่นกี่เซ็ต|เล่นกี่ครั้งดี|จำนวนครั้งและเซต)/i },
  { intent: 'exercise_rest', regex: /(พักระหว่างเซ็ตกี่วิ|ควรพักกี่นาทีระหว่างเซต|rest time)/i },
  { intent: 'exercise_substitute', regex: /(ท่าไหนแทนได้|ไม่มีอุปกรณ์.*แทนท่าไหน|ท่าสำรอง)/i },
  { intent: 'form_squat', regex: /(สควอทให้ถูก|ฟอร์ม squat|squat ยังไง|เข่าเลยปลายเท้า)/i },
  { intent: 'form_pushup', regex: /(วิดพื้นให้ถูก|ฟอร์ม push-up|push up ยังไง|ศอกกาง)/i },
  { intent: 'form_deadlift', regex: /(เดดลิฟต์ให้ถูก|ฟอร์ม deadlift|deadlift ยังไง|หลังตรง)/i },
  { intent: 'exercise_form', regex: /(เช็คฟอร์ม|ฟอร์มถูกต้อง|ท่าถูกต้องไหม|จัดท่า)/i },

  // 4. Cardio & Running
  { intent: 'cardio_hiit', regex: /(hiit คือ|ทำ hiit ยังไง|hiit กับ cardio|ฮิต)/i },
  { intent: 'cardio_zone2', regex: /(zone 2 คือ|วิ่งโซน 2|ประโยชน์โซน 2|หัวใจโซน 2)/i },
  { intent: 'cardio_before_after_weights', regex: /(เวทก่อนหรือคาร์ดิโอก่อน|คาร์ดิโอก่อนเวท|ลำดับเวทกับคาร์ดิโอ)/i },
  { intent: 'running_5k_training', regex: /(ซ้อม 5k|แผนซ้อม 5k|ตารางซ้อม 5)/i },
  { intent: 'cardio', regex: /(คาร์ดิโอ|แอโรบิก|วิ่งลู่|ปั่นจักรยาน)/i },

  // 5. Strength & Hypertrophy
  { intent: 'progressive_overload', regex: /(progressive overload คือ|เพิ่มน้ำหนักยังไง|พัฒนาแรง)/i },
  { intent: 'failure_training', regex: /(เล่นจนหมดแรง|train to failure|failure ดีไหม)/i },
  { intent: 'rir_rpe', regex: /(rir คือ|rpe คือ|เหลือแรงกี่ครั้ง)/i },
  { intent: 'deload', regex: /(deload คือ|สัปดาห์ดีโหลด|พักลดโหลด)/i },

  // 6. Warmup & Mobility
  { intent: 'warmup_general', regex: /(วอร์มก่อน|warm-up|อบอุ่นร่างกาย|ต้องวอร์ม)/i },
  { intent: 'cooldown_general', regex: /(หลังออกกำลัง.*คูลดาวน์|cool-down|เสร็จแล้วต้องยืด|ผ่อนคลายกล้ามเนื้อ)/i },
  { intent: 'mobility_general', regex: /(mobility คือ|ฝึก mobility|ความคล่องตัวข้อ|ยืดเหยียด)/i },

  // 7. Recovery & Sleep
  { intent: 'doms', regex: /(doms คือ|วันรุ่งขึ้นปวดกล้าม|ระบมกล้าม|ปวดเมื่อยวันต่อมา)/i },
  { intent: 'recovery_rest_days', regex: /(ควรพักกี่วัน|วันพัก|rest day|พักอาทิตย์ละ)/i },
  { intent: 'sleep_before_workout', regex: /(นอนน้อยควรออกกำลัง|นอนไม่พอ|อดนอน)/i },
  { intent: 'recovery', regex: /(การฟื้นฟูกล้ามเนื้อ|ซ่อมแซมกล้ามเนื้อ|ฟื้นฟูร่างกาย)/i },

  // 8. Nutrition & Supplements
  { intent: 'nutrition_pre_workout', regex: /(ก่อนออกกำลัง.*กิน|ก่อนเล่นเวทควรกิน|ก่อน workout|พรีเวิร์ก)/i },
  { intent: 'nutrition_post_workout', regex: /(หลังออกกำลัง.*กิน|เล่นเวทเสร็จควรกิน|หลังวิ่งควรกิน|โพสต์เวิร์ก)/i },
  { intent: 'protein', regex: /(โปรตีนวันละเท่าไหร่|กินโปรตีนเท่าไร|คำนวณโปรตีน|ต้องการโปรตีน)/i },
  { intent: 'carbohydrate', regex: /(คาร์บเยอะไหม|คาร์โบไฮเดรต.*ออกกำลัง|กินคาร์บ|แป้ง.*กล้าม)/i },
  { intent: 'hydration', regex: /(ดื่มน้ำเท่าไหร่|ดื่มน้ำยังไงตอนวิ่ง|วางแผนการดื่มน้ำ|จิบน้ำ)/i },
  { intent: 'calories', regex: /(คำนวณแคลอรี|กินกี่แคล|calorie.*เพิ่มกล้าม|calorie.*ลดไขมัน|แคลอรี่ต่อวัน)/i },
  { intent: 'supplement_protein', regex: /(whey protein จำเป็น|ไม่กินเวย์|กินเวย์ตอนไหน|เวย์จำเป็นไหม)/i },
  { intent: 'creatine', regex: /(creatine คือ|ควรกิน creatine|ครีเอทีน|ประโยชน์ครีเอทีน)/i },

  // 9. Motivation & Troubleshooting
  { intent: 'motivation_today', regex: /(ไม่อยากออกกำลังกายเลย|ขี้เกียจออกกำลัง|ไม่มีแรงจูงใจ|หมดไฟ)/i },
  { intent: 'troubleshooting', regex: /(น้ำหนักนิ่ง|กล้ามไม่ขึ้น|ไม่เห็นผล|พัฒนาการหยุดชะงัก)/i },
  { intent: 'beginner_guidance', regex: /(เริ่มต้นออกกำลังกาย|คำแนะนำสำหรับมือใหม่|ไม่เคยออกกำลังมาก่อน)/i }
];


// ========================================================
// 200K DATASET TRAINED KNOWLEDGE RULES (20 CORE CATEGORIES)
// ========================================================

const TRAINING_200K_RULES = [
  {
    category: 'คำศัพท์เฉพาะยิมและตัวชี้วัด (PR, 1RM, RPE)',
    intent: 'gym_slang_metrics',
    regex: /(ทำ\s*pr|สถิติ\s*pr|1rm|one\s*rep\s*max|pr\s*คืออะไร|ความหมายของ\s*pr|rpe\s*คือ|ค่า\s*rpe|rpe\s*ในตาราง|rir\s*คือ|reps\s*in\s*reserve)/i,
    response: '📊 **ถอดรหัสคำศัพท์ยิมยอดฮิต (PR, 1RM, RPE & RIR):**\n\n' +
      '1. **PR (Personal Record):** สถิติส่วนตัวที่ดีที่สุด เช่น ยกน้ำหนักได้หนักที่สุดในชีวิต หรือทำจำนวนครั้งได้มากที่สุดในน้ำหนักเดิม\n' +
      '2. **1RM (One-Rep Max):** น้ำหนักสูงสุดที่คุณสามารถยกได้เพียง **1 ครั้งถ้วน** ด้วยฟอร์มที่ถูกต้อง ใช้เป็นเกณฑ์คำนวณ % ความหนักในตารางเวท\n' +
      '3. **RPE (Rate of Perceived Exertion):** ระดับความเหนื่อย/ความเข้มข้น ประเมินจาก 1-10 (เช่น RPE 8 = หนักมาก ยังเหลือแรงยกต่อได้อีก 2 ครั้ง)\n' +
      '4. **RIR (Reps in Reserve):** จำนวนครั้งสำรองที่เหลืออยู่ก่อนหมดแรง (เช่น RIR 2 แปลว่าถ้าฝืนจะยกได้อีกแค่ 2 ครั้งก็หมดแรงสนิท)\n\n' +
      '💡 **เทคนิค:** การซ้อมเวทเพื่อสร้างกล้ามเนื้อที่ดีที่สุด ควรให้อยู่ที่ **RPE 7-9 (RIR 1-3)** ครับ ไม่จำเป็นต้องยกจน Failure ทุกเซ็ต!'
  },
  {
    category: 'คำศัพท์เป้าหมายรูปร่าง (Bulk vs Cut)',
    intent: 'bulk_vs_cut',
    regex: /(บัล์ก.*คัต|bulk.*cut|ลีนกับบัล์ก|ช่วงบัล์ก|ช่วงคัต|bulk\s*คือ|cut\s*คือ|การบัล์ก|การคัต)/i,
    response: '⚖️ **ความแตกต่างระหว่าง Bulk (บัล์ก) กับ Cut (คัต):**\n\n' +
      '1. **Bulk (การเพิ่มขนาดกล้ามเนื้อ):**\n' +
      '   • **การกิน:** ทานพลังงานเกินกว่าที่ร่างกายใช้ (Calorie Surplus +200 ถึง +400 kcal/วัน) พร้อมโปรตีน 1.6-2.2 กรัม/กก.\n' +
      '   • **การฝึก:** เน้น Progressive Overload ยกหนักขึ้นเรื่อยๆ เพื่อกระตุ้นการสร้างกล้ามเนื้อเต็มที่ (อาจมีไขมันเพิ่มขึ้นเล็กน้อย)\n\n' +
      '2. **Cut (การลดไขมันเพื่อความคมชัด):**\n' +
      '   • **การกิน:** ทานพลังงานให้น้อยกว่าที่ร่างกายเผาผลาญ (Calorie Deficit -300 ถึง -500 kcal/วัน) แต่คงโปรตีนให้สูง (2.0-2.4 กรัม/กก.) เพื่อรักษามวลกล้ามเนื้อ\n' +
      '   • **การฝึก:** รักษาน้ำหนักเวทให้หนักเท่าเดิม ควบคู่กับการคาร์ดิโอเสริมเพื่อช่วยเบิร์นไขมันออกครับ'
  },
  {
    category: 'ท่าบริหารช่วงล่างแบบไม่ต้องยืน / เมื่อยขา (Seated & Lying Leg/Glute)',
    intent: 'non_standing_leg_exercises',
    regex: /(เตะขาไปข้างหลัง|donkey\s*kick|cable\s*kickback|เมื่อยขา.*บ่ต้องลุก|เมื่อยขา.*ไม่ต้องยืน|ท่าบริหาร.*ไม่ต้องลุก|นอนเล่นขา|นั่งเล่นขา)/i,
    response: '🛋️ **ท่าบริหารขาและก้นแบบไม่ต้องลุกยืน (เหมาะสำหรับวันเมื่อยล้าหรือผ่อนคลาย):**\n\n' +
      '1. **Glute Bridge (นอนหงายยกสะโพก):** นอนหงาย ชันเข่าขึ้น สองแขนวางข้างลำตัว แล้วเกร็งสะโพกดันก้นลอยขึ้นค้างไว้ 2 วินาที (3 เซ็ต x 15 ครั้ง) — บริหารก้นและหลังขาโดยไม่รับแรงกระแทก\n' +
      '2. **Donkey Kick (ท่าคลานเตะขาไปข้างหลัง):** ท่าคลานสี่ขา ยกขาข้างหนึ่งถีบฝ่าเท้าขึ้นสู่เพดาน เกร็งก้นช้าๆ (3 เซ็ต x 12-15 ครั้ง/ข้าง) — ปั้นก้นกลมเด้งเน้นๆ\n' +
      '3. **Seated Leg Extension (นั่งเก้าอี้เตะขาตรง):** นั่งหลังตรง ยกปลายขาเตะตรงไปข้างหน้า เกร็งหน้าขา 1-2 วินาทีแล้วผ่อนลง (3 เซ็ต x 15 ครั้ง) — กระชับต้นขาด้านหน้า\n' +
      '4. **Lying Hamstring Stretch:** นอนหงาย ใช้มือหรือผ้าดึงขาเหยียดตรงเข้าหาตัว ค้างไว้ 30 วินาที ช่วยคลายอาการเมื่อยล้าได้ทันทีครับ! 🦵✨'
  },
  {
    category: 'สรีรวิทยาการออกกำลังกาย (อาการคันยิบๆ)',
    intent: 'exercise_itchiness_physiology',
    regex: /(คันยิบ|คันตามตัว|คันผิวหนัง|คันเวลาออกกำลัง|คันตอนวิ่ง|คันตอนคาร์ดิโอ)/i,
    response: '🩺 **ทำไมออกกำลังกายแล้วรู้สึกคันยิบๆ ตามผิวหนัง?**\n\n' +
      'อาการนี้เรียกว่า **Exercise-Induced Urticaria หรือ Capillary Dilation** ซึ่งพบได้บ่อยและมัก**ไม่อันตราย**ครับ โดยมีสาเหตุหลักดังนี้:\n\n' +
      '1. **การขยายตัวของหลอดเลือดฝอย:** เมื่อหัวใจสูบฉีดเลือดเร็วขึ้น หลอดเลือดฝอยใต้ผิวหนังที่เคยหดตัวจะขยายตัวอย่างรวดเร็ว ส่งผลให้เส้นประสาทรอบๆ ถูกกระตุ้นจนรู้สึกคันยิบๆ (มักเกิดกับคนที่ไม่ได้ออกกำลังกายมานาน หรือเพิ่งเริ่มคาร์ดิโอหนัก)\n' +
      '2. **การหลั่งสารฮิสตามีน (Histamine):** ร่างกายหลั่งสารนี้เพื่อช่วยขยายหลอดเลือด ทำให้อาจมีอาการคันร่วมด้วย\n' +
      '3. **ผิวแห้งหรือเหงื่อระคายเคือง:** เสื้อผ้าที่เสียดสีกับเหงื่อ\n\n' +
      '💡 **วิธีรับมือ:** วอร์มอัพช้าๆ ให้ร่างกายปรับอุณหภูมิ, ดื่มน้ำให้เพียงพอ, และออกกำลังกายสม่ำเสมอ ร่างกายจะปรับตัวและอาการคันจะค่อยๆ หายไปเองใน 1-2 สัปดาห์ครับ (ยกเว้นมีอาการหายใจติดขัดหรือผื่นลมพิษบวมหนา ควรหยุดและปรึกษาแพทย์ทันทีครับ)'
  },
  {
    category: 'การเพิ่มความหนักและ Progressive Overload',
    intent: 'progressive_overload',
    regex: /(progressive overload|เพิ่มน้ำหนักเมื่อไหร่|เพิ่มความหนัก|กี่สัปดาห์เพิ่มน้ำหนัก|ยกครบ 12 ครั้ง|เพิ่มโหลด|พัฒนาแรง|โอเวอร์โหลด|ก้าวหน้าในการยก|เพิ่มเวท)/i,
    response: '🔥 **หลักการ Progressive Overload (หัวใจสำคัญที่สุดของการพัฒนาตามหลักวิทยาศาสตร์การกีฬา):**\n\n' +
      '1. **ใช้กฎ “2-for-2 Rule” ในการตัดสินใจเพิ่มน้ำหนัก:**\n' +
      '   - หากคุณสามารถยกในเซ็ตสุดท้ายได้เกินเป้าหมาย **2 ครั้ง ติดต่อกัน 2 สัปดาห์** ให้เพิ่มน้ำหนักทันทีครับ\n' +
      '   - **ช่วงบน (Upper Body):** เพิ่มขึ้นครั้งละ 1–2.5 กก. (หรือ 2–5%)\n' +
      '   - **ช่วงล่าง (Lower Body):** เพิ่มขึ้นครั้งละ 2.5–5 กก. (หรือ 5–10%)\n\n' +
      '2. **5 มิติของการทำ Progressive Overload (ไม่ต้องเพิ่มแต่น้ำหนักเสมอไป):**\n' +
      '   - **เพิ่มจำนวนครั้ง (Reps):** จากเดิมทำได้ 8 ครั้ง พัฒนาจนแตะ 12 ครั้งในน้ำหนักเดิม\n' +
      '   - **เพิ่มจำนวนเซ็ต (Sets):** จากเดิม 3 เซ็ต เพิ่มเป็น 4 เซ็ต\n' +
      '   - **เพิ่มเวลาตึงตัวของกล้ามเนื้อ (TUT):** ผ่อนจังหวะลงช้าๆ 3–4 วินาที (Eccentric control)\n' +
      '   - **ลดเวลาพักระหว่างเซ็ต:** จากเดิมพัก 90 วินาที ลดเหลือ 60 วินาทีในน้ำหนักเดิม\n' +
      '   - **พัฒนาฟอร์ม (Full ROM):** ลงให้ลึกขึ้น คุมกล้ามเนื้อได้นิ่งขึ้น\n\n' +
      '💡 **เกณฑ์ RIR (Reps in Reserve):** ในเซ็ตปกติควรเหลือแรงสำรองไว้ 1–2 ครั้งก่อนหมดแรง (RIR 1–2 หรือ RPE 8–9) ไม่จำเป็นต้องยกจนหมดแรงทุกเซ็ตเพื่อป้องกันระบบประสาทล้าครับ'
  },
  {
    category: 'โปรแกรม Push Pull Legs',
    intent: 'push_pull_legs_split',
    regex: /(push pull legs|ppl|พุช พูล เลก|พุชพูลเลก|ดัน ดึง ขา|สปลิต ppl)/i,
    response: '🏋️‍♂️ **โครงสร้างโปรแกรม Push Pull Legs (PPL Split - สปลิตยอดนิยมระดับโลก):**\n\n' +
      'หลักการของ PPL คือการจัดกลุ่มกล้ามเนื้อที่ทำงานสอดประสานกันไว้ในวันเดียวกัน เพื่อให้กล้ามเนื้อแต่ละส่วนได้พักฟื้นอย่างน้อย 48–72 ชั่วโมง:\n\n' +
      '• **วัน Push (กล้ามเนื้อกลุ่มผลัก/ดัน):** อก, ไหล่ด้านหน้า/ด้านข้าง, หลังแขน (Triceps)\n' +
      '  - ท่าหลัก: Bench Press / Dumbbell Press, Overhead Shoulder Press, Incline Dumbbell Press, Lateral Raise, Tricep Pushdown (3–4 เซ็ต, 8–12 ครั้ง)\n\n' +
      '• **วัน Pull (กล้ามเนื้อกลุ่มดึง):** ปีกและหลังทั้งหมด, ไหล่ด้านหลัง, หน้าแขน (Biceps)\n' +
      '  - ท่าหลัก: Lat Pulldown / Pull-up, Barbell/Dumbbell Row, Face Pull, Seated Cable Row, Bicep Curl (3–4 เซ็ต, 8–12 ครั้ง)\n\n' +
      '• **วัน Legs (ช่วงล่างและแกนกลาง):** ต้นขาด้านหน้า (Quads), ต้นขาด้านหลัง (Hamstrings), ก้น (Glutes), น่อง (Calves), ท้อง (Abs)\n' +
      '  - ท่าหลัก: Squat, Romanian Deadlift, Bulgarian Split Squat, Leg Press, Calf Raise, Plank (3–4 เซ็ต, 8–15 ครั้ง)\n\n' +
      '🎯 **การจัดตาราง:**\n' +
      '- **3 วัน/สัปดาห์ (ยอดเยี่ยมสำหรับคนทำงาน):** จันทร์ (Push) - พุธ (Pull) - ศุกร์ (Legs) สลับวันพัก\n' +
      '- **6 วัน/สัปดาห์ (ระดับแอดวานซ์):** Push - Pull - Legs - พัก 1 วัน - Push - Pull - Legs'
  },
  {
    category: 'โปรแกรม Upper Lower',
    intent: 'upper_lower_split',
    regex: /(upper lower|อัปเปอร์ โลเวอร์|บน ล่าง|ตารางบนล่าง|บน-ล่าง|สปลิตบนล่าง)/i,
    response: '⚡ **โปรแกรม Upper / Lower Split (สมดุลที่สุดสำหรับตาราง 4 วันต่อสัปดาห์):**\n\n' +
      'การแบ่งสปลิตบน-ล่างช่วยให้กล้ามเนื้อแต่ละมัดได้รับการกระตุ้น 2 ครั้งต่อสัปดาห์ (Optimal Frequency) สอดคล้องกับอัตราการสังเคราะห์โปรตีน:\n\n' +
      '📅 **ตารางแนะนำ 4 วัน:**\n' +
      '• **จันทร์ (Upper A - เน้นแรง):** Bench Press, Barbell Row, Shoulder Press, Lat Pulldown, Arm Supersets (3–4 เซ็ต, 6–8 ครั้ง)\n' +
      '• **อังคาร (Lower A - เน้นแรง):** Squat, Romanian Deadlift, Leg Press, Calf Raise, Plank (3–4 เซ็ต, 6–8 ครั้ง)\n' +
      '• **พุธ:** วันพักผ่อนและฟื้นฟู (Active Recovery)\n' +
      '• **พฤหัสบดี (Upper B - เน้นความกระชับ):** Incline Dumbbell Press, Seated Row, Lateral Raise, Face Pull, Bicep & Tricep (3 เซ็ต, 10–12 ครั้ง)\n' +
      '• **ศุกร์ (Lower B - เน้นความกระชับ):** Bulgarian Split Squat, Glute Bridge, Leg Extension, Hamstring Curl, Core (3 เซ็ต, 10–12 ครั้ง)\n' +
      '• **เสาร์-อาทิตย์:** พักผ่อนเต็มที่หรือเดินเบาๆ ครับ'
  },
  {
    category: 'โปรแกรม Full Body',
    intent: 'full_body_split',
    regex: /(full body|ฟูลบอดี้|เล่นทั่วตัว|ฝึกทั้งตัว|ทั้งร่างกาย|ฟูลบอดี)/i,
    response: '🌟 **โปรแกรม Full Body (คุ้มค่าเวลาที่สุดสำหรับคนมีเวลา 2–3 วัน):**\n\n' +
      'Full Body ช่วยให้กล้ามเนื้อทั่วร่างกายได้รับการกระตุ้นบ่อยครั้ง (High Frequency) เผาผลาญแคลอรี่สูงมากในแต่ละเซสชัน:\n\n' +
      '🎯 **โครงสร้างท่าฝึก 5 ทิศทางหลักใน 1 วัน:**\n' +
      '1. **Knee Dominant (หน้าขา):** Squat หรือ Goblet Squat (3 เซ็ต, 8–10 ครั้ง)\n' +
      '2. **Hip Dominant (หลังขาและก้น):** Romanian Deadlift หรือ Glute Bridge (3 เซ็ต, 8–10 ครั้ง)\n' +
      '3. **Push (อกและไหล่):** Push-up, Dumbbell Bench Press หรือ Overhead Press (3 เซ็ต, 8–12 ครั้ง)\n' +
      '4. **Pull (หลัง):** Dumbbell Row หรือ Lat Pulldown (3 เซ็ต, 8–12 ครั้ง)\n' +
      '5. **Core Stability (แกนกลาง):** Plank หรือ Bird Dog (3 เซ็ต, 30–45 วินาที)\n\n' +
      '⏱️ สัปดาห์ละ 3 วัน (เช่น จันทร์ - พุธ - ศุกร์) ใช้เวลาเพียง 40–50 นาทีต่อครั้งครับ'
  },
  {
    category: 'วอร์มอัพและคูลดาวน์',
    intent: 'warmup_cooldown',
    regex: /(วอร์มอัพ|คูลดาวน์|warm.?up|cool.?down|อบอุ่นร่างกาย|ยืดเหยียดก่อน|ยืดหลังออก|ยืดกล้ามเนื้อกี่นาที|ยืดก่อนหรือหลัง)/i,
    response: '🧘‍♂️ **หลักการ Warm-up และ Cool-down ที่ถูกต้องตามหลักวิทยาศาสตร์การกีฬา:**\n\n' +
      '1. **ก่อนออกกำลังกาย (Warm-up 5–10 นาที) -> ต้องเป็น “Dynamic Stretching” (ยืดแบบเคลื่อนไหว):**\n' +
      '   - เพื่อเพิ่มอุณหภูมิแกนกลางร่างกาย หล่อลื่นข้อต่อ และเตรียมระบบประสาท\n' +
      '   - ท่าที่แนะนำ: Arm Circles, Torso Twist, Cat-Cow, Leg Swings, Hip Openers, เดินเร็วหรือ March in place\n' +
      '   - ⚠️ **ข้อควรระวัง:** ห้ามทำ Static Stretching (ยืดค้างนานๆ) ก่อนยกเวท เพราะจะลดพละกำลังของกล้ามเนื้อชั่วคราว\n\n' +
      '2. **หลังออกกำลังกาย (Cool-down 5–10 นาที) -> ต้องเป็น “Static Stretching” (ยืดค้างไว้):**\n' +
      '   - เพื่อปรับลดอัตราการเต้นของหัวใจ คลายความตึงตัว และคืนความยาวดั้งเดิมให้เส้นใยกล้ามเนื้อ\n' +
      '   - ท่าที่แนะนำ: Chest Doorway Stretch, Hamstring Stretch, Quad Stretch, Child’s Pose\n' +
      '   - ค้างไว้ท่าละ 20–30 วินาที หายใจเข้าออกลึกๆ ช้าๆ อย่างผ่อนคลายครับ'
  },
  {
    category: 'วันพักและการฟื้นตัว',
    intent: 'rest_recovery',
    regex: /(วันพัก|พักกี่วัน|rest day|ฟื้นฟูกล้ามเนื้อ|พักฟื้น|overtraining|ซ่อมแซมกล้ามเนื้อ|ไม่พักได้ไหม|ออกกำลังกายทุกวันดีไหม)/i,
    response: '💤 **วิทยาศาสตร์ของวันพักและการฟื้นตัว (Recovery Science):**\n\n' +
      '“กล้ามเนื้อไม่ได้เติบโตหรือแข็งแรงขึ้นในยิม แต่เติบโตตอนที่คุณนอนหลับและพักผ่อน!”\n\n' +
      '1. **ทำไมถึงต้องมีวันพัก:**\n' +
      '   - การฝึกสร้างรอยฉีกขาดระดับไมโคร (Micro-tears) กล้ามเนื้อต้องการเวลา 24–48 ชั่วโมงในการซ่อมแซมและสร้างเส้นใยใหม่\n' +
      '   - ป้องกัน Central Nervous System (CNS) Fatigue ซึ่งหากระบบประสาทล้า จะทำให้แรงตก เสี่ยงบาดเจ็บ และฮอร์โมนความเครียดสูงขึ้น\n\n' +
      '2. **ควรมีวันพักกี่วัน:**\n' +
      '   - มือใหม่ถึงระดับกลาง: พัก 2–4 วันต่อสัปดาห์\n' +
      '   - ระดับกลางถึงสูง: พักอย่างน้อย 1–2 วันต่อสัปดาห์\n\n' +
      '3. **Active Recovery:** ในวันพักให้เดินเล่นในสวน 20–30 นาที ปั่นจักรยานเบาๆ หรือยืดเหยียดโยคะ เพื่อช่วยให้เลือดไหลเวียนนำสารอาหารไปซ่อมแซมกล้ามเนื้อได้เร็วขึ้นครับ'
  },
  {
    category: 'การจัดเวลาการออกกำลังกาย',
    intent: 'time_management',
    regex: /(มีเวลา 15 นาที|มีเวลา 20 นาที|มีเวลา 30 นาที|ออกกำลังกายตอนเช้า|ออกกำลังกายตอนเย็น|ช่วงเวลาไหนดี|จัดเวลาออกกำลังกาย|ควรออกกำลังกายเวลาไหน|ไม่มีเวลาออกกำลัง)/i,
    response: '⏰ **กลยุทธ์การจัดเวลาออกกำลังกาย (Consistency Beats Timing):**\n\n' +
      '1. **ออกกำลังกายตอนเช้า vs ตอนเย็น แบบไหนดีกว่ากัน?**\n' +
      '   - **ตอนเช้า:** เหมาะกับคนที่งานยุ่งตอนเย็น ช่วยกระตุ้นระบบเผาผลาญและสดชื่นตลอดวัน โอกาสโดนแทรกคิวน้อย\n' +
      '   - **ตอนเย็น (16:00–19:00 น.):** อุณหภูมิร่างกายและพละกำลังของระบบประสาท-กล้ามเนื้ออยู่ในจุดสูงสุด ยกเวทได้หนักที่สุด\n' +
      '   - 👉 เวลาที่ดีที่สุดคือเวลาที่คุณทำได้ **สม่ำเสมอที่สุด** ครับ\n\n' +
      '2. **เทคนิคออกกำลังกายเมื่อมีเวลาน้อย (15–30 นาที):**\n' +
      '   - **Supersets:** สลับเล่น 2 ท่าที่ไม่ใช้กล้ามเนื้อมัดเดียวกันโดยไม่พัก เช่น อกสลับหลัง หรือ ขาสลับหน้าท้อง ประหยัดเวลาได้ 50%\n' +
      '   - **Circuit:** ทำ 4–5 ท่าต่อเนื่อง พักหลังจบรอบ ได้ทั้งกล้ามเนื้อและคาร์ดิโอเบิร์นในเวลาสั้นครับ'
  },
  {
    category: 'ลดน้ำหนักและลดไขมัน',
    intent: 'fat_loss',
    regex: /(ลดน้ำหนัก|ลดไขมัน|เบิร์นไขมัน|สลายไขมัน|เวทกับคาร์ดิโอ.*ลดไขมัน|คุมอาหารลดไขมัน|ลดพุง|ลดเหนียง)/i,
    response: '🔥 **แผนลดไขมันที่ยั่งยืนและรักษามวลกล้ามเนื้อ (Fat Loss Blueprint):**\n\n' +
      '1. **Caloric Deficit อย่างพอเหมาะ (70% ของผลลัพธ์):**\n' +
      '   - ควบคุมพลังงานให้ติดลบ 300–500 kcal ต่อวันจากค่า TDEE ห้ามอดอาหารต่ำกว่า BMR เพราะจะทำให้ระบบเผาผลาญพังและกล้ามเนื้อสลาย\n' +
      '   - อัตราการลดที่ปลอดภัยคือ 0.5–1 กิโลกรัมต่อสัปดาห์\n\n' +
      '2. **เวทเทรนนิ่งเพื่อรักษากล้ามเนื้อ (รักษา BMR):**\n' +
      '   - เล่นเวท 3–4 วันต่อสัปดาห์ เพื่อส่งสัญญาณบอกร่างกายให้รักษากล้ามเนื้อไว้ ใช้ Reps 10–15 ครั้ง พัก 45–60 วินาที\n\n' +
      '3. **คาร์ดิโอ Zone 2 เผาผลาญไขมันสะสม:**\n' +
      '   - ทำคาร์ดิโอระดับเบาถึงปานกลาง (Zone 2 - พูดคุยเป็นประโยคได้) สัปดาห์ละ 120–150 นาที ร่างกายจะดึงไขมันสะสมมาใช้เป็นพลังงานหลักโดยตรงครับ'
  },
  {
    category: 'เพิ่มกล้ามเนื้อ',
    intent: 'muscle_hypertrophy',
    regex: /(เพิ่มกล้าม|สร้างกล้าม|กล้ามโต|เพิ่มขนาดกล้าม|hypertrophy|ยกเวทสร้างกล้าม|อยากตัวใหญ่)/i,
    response: '💪 **กลยุทธ์การสร้างกล้ามเนื้อ (Hypertrophy Masterplan):**\n\n' +
      '1. **Mechanical Tension (แรงตึงเชิงกลในกล้ามเนื้อ):**\n' +
      '   - เลือกน้ำหนักที่ทำได้ 8–12 ครั้งต่อเซ็ต และเหลือแรงสำรองเพียง 1–2 ครั้งในเซ็ตสุดท้าย\n' +
      '   - โฟกัสช่วงต้านน้ำหนักลง (Eccentric Phase) ช้าๆ 2–3 วินาที เพื่อสร้างการกระตุ้นเส้นใยกล้ามเนื้อสูงสุด\n\n' +
      '2. **Volume การฝึกที่เหมาะสม:**\n' +
      '   - สะสม 10–20 เซ็ตคุณภาพต่อกลุ่มกล้ามเนื้อต่อสัปดาห์ แบ่งเป็น 2 ครั้งต่อสัปดาห์ต่อกลุ่มกล้ามเนื้อ\n\n' +
      '3. **โภชนาการสำหรับสร้างเนื้อเยื่อ:**\n' +
      '   - ทานโปรตีน 1.6–2.2 กรัมต่อน้ำหนักตัว 1 กิโลกรัม กระจายมื้อละ 25–40 กรัม ทุก 3–4 ชั่วโมง\n' +
      '   - Caloric Surplus เล็กน้อย 200–300 kcal เพื่อเป็นพลังงานในการสังเคราะห์กล้ามเนื้อใหม่ครับ'
  },
  {
    category: 'ออกกำลังกายที่บ้าน',
    intent: 'home_workout',
    regex: /(ออกกำลังกายที่บ้าน|เล่นที่บ้าน|ในห้องนอน|ในห้องนั่งเล่น|พื้นที่จำกัด|อยู่คอนโด|อุปกรณ์ที่มีในบ้าน|ทำที่บ้าน)/i,
    response: '🏡 **โปรแกรมออกกำลังกายที่บ้าน (Home Workout - ปลอดภัย เสียงเบา เหมาะกับคอนโด):**\n\n' +
      'ไม่ต้องใช้อุปกรณ์ชิ้นใหญ่ ก็สามารถบริหารกล้ามเนื้อได้ครบทุกส่วนในพื้นที่ 2x2 เมตรครับ:\n\n' +
      '• **ท่าที่ 1: Chair Squat / Squat (ต้นขาและก้น):** 3 เซ็ต, 12–15 ครั้ง\n' +
      '• **ท่าที่ 2: Wall Push-up / Knee Push-up (อก ไหล่ หลังแขน):** 3 เซ็ต, 10–12 ครั้ง\n' +
      '• **ท่าที่ 3: Glute Bridge (สะโพกและหลังส่วนล่าง):** 3 เซ็ต, 15 ครั้ง\n' +
      '• **ท่าที่ 4: Bird Dog (แกนกลางลำตัวและการทรงตัว):** 3 เซ็ต, ข้างละ 10 ครั้ง\n' +
      '• **ท่าที่ 5: March In Place (คาร์ดิโอถนอมเข่า ไร้เสียงกระทบพื้น):** 3 เซ็ต, เซ็ตละ 45–60 วินาที\n\n' +
      '💡 ทำเป็นวงรอบ พักระหว่างท่า 30 วินาที จบรอบพัก 90 วินาที ทำซ้ำ 3 รอบ ใช้เวลาเพียง 20–25 นาทีครับ'
  },
  {
    category: 'ไม่ใช้อุปกรณ์',
    intent: 'bodyweight_no_equipment',
    regex: /(ไม่ใช้อุปกรณ์|ไม่มีอุปกรณ์|บอดี้เวท|bodyweight|ใช้น้ำหนักตัว|คาลิสเทนิกส์|calisthenics)/i,
    response: '🤸 **การออกกำลังกายแบบไม่ใช้อุปกรณ์ (Bodyweight Mastery):**\n\n' +
      'การฝึกด้วยน้ำหนักตัวสามารถปรับความหนักได้หลากหลายวิธีโดยไม่ต้องใช้อุปกรณ์:\n\n' +
      '1. **ปรับองศาและจุดหมุน (Leverage):**\n' +
      '   - วิดพื้น: ผนัง (เบาสุด) -> เก้าอี้ -> วิดพื้นกับพื้น -> ยกเท้าวางบนเก้าอี้ (หนักสุด)\n' +
      '   - สควอต: เก้าอี้สควอต -> สควอตปกติ -> บูลกาเรียนสปลิตสควอต (ขาทีละข้าง)\n\n' +
      '2. **ปรับจังหวะ Tempo และ Pause:**\n' +
      '   - ลดตัวลงช้าๆ 3–4 วินาที และหยุดค้างที่จุดต่ำสุด 2 วินาที จะเพิ่มความท้าทายให้กล้ามเนื้อทำงานหนักขึ้น 2 เท่าทันทีครับ'
  },
  {
    category: 'โปรแกรมสำหรับมือใหม่',
    intent: 'beginner_program',
    regex: /(มือใหม่เริ่ม|เพิ่งเริ่มออกกำลัง|ไม่เคยเล่นเวท|เริ่มต้นยังไง|หัดเล่นเวท|beginner workout|คำแนะนำคนเพิ่งเริ่ม)/i,
    response: '🌱 **คู่มือเริ่มต้นสำหรับมือใหม่ (Beginner Roadmap สู่ความฟิตที่ยั่งยืน):**\n\n' +
      '1. **เป้าหมายเดือนแรก:** โฟกัสที่ “การสร้างวินัยและความสม่ำเสมอ” ไม่ใช่ความหนักหน่วง\n' +
      '2. **ความถี่ที่เหมาะสม:** เริ่มต้นที่ 3 วันต่อสัปดาห์ (วันเว้นวัน เช่น จันทร์-พุธ-ศุกร์) ครั้งละ 25–35 นาที\n' +
      '3. **เลือกท่าพื้นฐาน Compound:** Squat, Wall Push-up, Glute Bridge, Plank, March in Place\n' +
      '4. **จำนวนเซ็ตและครั้ง:** 2–3 เซ็ตต่อท่า, 10–12 ครั้ง ไม่ต้องยกจนหมดแรง ให้เหลือแรงสำรองไว้เสมอ\n' +
      '5. **อาการปวดเมื่อย (DOMS):** ปวดตึงกล้ามเนื้อ 24–48 ชม. แรกเป็นเรื่องปกติ ดื่มน้ำมากๆ นอนหลับให้พอ แล้วค่อยกลับมาซ้อมต่อครับ'
  },
  {
    category: 'เพิ่มความแข็งแรง',
    intent: 'strength_gain',
    regex: /(เพิ่มความแข็งแรง|strength training|ยกหนักขึ้น|อยากแข็งแรง|เพิ่มแรงยก)/i,
    response: '🏋️ **โปรแกรมเพิ่มความแข็งแรง (Strength Mastery):**\n\n' +
      '1. **เน้นท่า Compound Lifts หลัก:** Squat, Bench Press, Deadlift, Overhead Press\n' +
      '2. **เซ็ตและครั้ง:** 3–5 เซ็ต, 3–6 ครั้ง (ใช้น้ำหนัก 80–85% ของ 1RM)\n' +
      '3. **เวลาพักระหว่างเซ็ต:** พัก 2–3 นาที เพื่อให้ระบบ ATP-CP และระบบประสาทฟื้นตัวเต็มที่'
  },
  {
    category: 'คาร์ดิโอ',
    intent: 'cardio_training',
    regex: /(คาร์ดิโอ|cardio|วิ่งโซน 2|zone 2|วิ่งได้นานขึ้น|เพิ่มความอึด)/i,
    response: '🏃 **การฝึกคาร์ดิโอและระบบหัวใจ (Cardiovascular Health):**\n\n' +
      '• **Zone 2 Cardio (60–70% Max HR):** วิ่งหรือปั่นจักรยานในระดับที่พูดคุยเป็นประโยคได้โดยไม่หอบ 120–150 นาที/สัปดาห์ ช่วยเพิ่ม Mitochondria เผาผลาญไขมันดีที่สุด\n' +
      '• **สลับกับเวทเทรนนิ่ง:** แนะนำเล่นเวทก่อนแล้วค่อยคาร์ดิโอ เพื่อให้มีพลังงานไกลโคเจนเต็มที่ในการยกเวทครับ'
  },
  {
    category: 'HIIT',
    intent: 'hiit_training',
    regex: /(hiit|ฮิต|interval training|afterburn|epoc|คาร์ดิโอสั้นๆ)/i,
    response: '⚡ **การฝึกแบบ HIIT (High-Intensity Interval Training):**\n\n' +
      '• **สูตร Work:Rest:** ทำเต็มที่ 20–30 วินาที (HR 85–90%) สลับพัก 30–40 วินาที จำนวน 6–8 รอบ รวม 15–20 นาที\n' +
      '• **Afterburn Effect (EPOC):** ร่างกายจะเผาผลาญพลังงานต่อเนื่องหลังซ้อมเสร็จนานถึง 12–24 ชั่วโมง ทำเพียง 1–2 ครั้ง/สัปดาห์ก็เพียงพอครับ'
  },
  {
    category: 'ออกกำลังกายในยิม',
    intent: 'gym_workout',
    regex: /(เข้ายิม|เล่นที่ฟิตเนส|เครื่องเล่นในยิม|machine ในยิม|เข้าฟิตเนสครั้งแรก)/i,
    response: '🏢 **แนวทางการเข้ายิมอย่างมั่นใจ (Gym Confidence Guide):**\n\n' +
      '1. เริ่มจาก Resistance Machines (เครื่องแมชชีน) เพื่อเรียนรู้วิถีการเคลื่อนไหวที่ปลอดภัย\n' +
      '2. ค่อยๆ ขยับมาใช้ Free Weights (Dumbbells/Barbells) เพื่อพัฒนาการทรงตัวและกล้ามเนื้อมัดเล็ก\n' +
      '3. ปรับระดับเบาะนั่งให้ตรงกับแนวจุดหมุนของข้อต่อ และเช็ดทำความสะอาดอุปกรณ์ทุกครั้งหลังใช้งานครับ'
  },
  {
    category: 'เทคนิคการฝึกขั้นสูง (Drop set & Intensity Techniques)',
    intent: 'intensity_drop_set',
    regex: /(ดร็อปเซ็ต|ดรอปเซ็ต|drop\s*set|super\s*set|ซูเปอร์เซ็ต|rest\s*pause|พีระมิดเซ็ต|ไจแอนท์เซ็ต)/i,
    response: '🔥 **เทคนิคการฝึกแบบ Drop Set (ดร็อปเซ็ต):**\n\n' +
      '• **Drop Set คืออะไร:** คือเทคนิคการเพิ่มความเข้มข้น โดยยกน้ำหนักจนหมดแรง (Failure) ในเซ็ตปกติ จากนั้น **ลดน้ำหนักลงทันทีประมาณ 20-30% แล้วยกต่อโดยไม่พัก** จนหมดแรงอีกรอบ (สามารถดร็อปได้ 1-3 จังหวะ)\n\n' +
      '• **จุดประสงค์:** สร้างความล้าของเส้นใยกล้ามเนื้อในระดับสูงสุด (Metabolic Stress) กระตุ้นการขยายขนาดกล้ามเนื้อ (Hypertrophy) โดยประหยัดเวลา\n\n' +
      '• **คำแนะนำ:**\n' +
      '  - **มือใหม่เพิ่งเริ่มฝึก:** ยัง**ไม่แนะนำ**ให้ทำครับ เพราะร่างกายต้องการการปรับตัวด้านฟอร์มและระบบประสาท ควรโฟกัสที่การยกแบบมาตรฐาน (Straight Sets) และคุมฟอร์มให้เป๊ะก่อน\n' +
      '  - **ผู้ฝึกระดับกลางขึ้นไป:** แนะนำให้ทำเฉพาะ **เซ็ตสุดท้ายของท่าสุดท้าย** สัปดาห์ละ 1-2 ท่า เพื่อไม่ให้ระบบประสาทส่วนกลางล้าสะสม (Overtraining) ครับ'
  },
  {
    category: 'การเปรียบเทียบท่าฝึกเฉพาะทาง (RDL vs Conventional Deadlift)',
    intent: 'deadlift_rdl_comparison',
    regex: /(rdl|romanian\s*deadlift|โรมเนียน|เดดลิฟต์.*ต่าง|เดดลิฟต์.*สติฟ|sldl|stiff.*leg)/i,
    response: '🏋️‍♂️ **ความแตกต่างระหว่าง Romanian Deadlift (RDL) กับ Conventional Deadlift:**\n\n' +
      '1. **Romanian Deadlift (RDL):**\n' +
      '   • **การเคลื่อนไหว:** เริ่มต้นจากท่ายืนตรง งอเข่าเล็กน้อยคงที่ (~15-20 องศา) แล้วพับสะโพกไปด้านหลัง (Hip Hinge) ให้บาร์เบลล์หรือดัมเบลเลื่อนลงระดับใต้เข่า/หน้าแข้ง โดย**ไม่วางลงพื้น**\n' +
      '   • **กล้ามเนื้อเป้าหมาย:** โฟกัส **ต้นขาด้านหลัง (Hamstrings)** และ **ก้น (Glutes)** เป็นหลัก\n\n' +
      '2. **Conventional Deadlift (เดดลิฟต์มาตรฐาน):**\n' +
      '   • **การเคลื่อนไหว:** เริ่มยกจากพื้นทุกครั้ง โดยมีการย่อเข่าลงคล้ายการทำ Squat ผสม Hinge\n' +
      '   • **กล้ามเนื้อเป้าหมาย:** ใช้พลังทั้งตัว (Full-body Power) รวมถึงต้นขาด้านหน้า (Quads) และแผ่นหลังส่วนล่าง\n\n' +
      '💡 **ทริค:** ถ้าต้องการปั้นก้นและยืดหลังขาให้กระชับ ให้เลือกฝึก RDL ครับ!'
  },
  {
    category: 'ท่าสควอทเฉพาะทางและการฝึกแบบพิงกำแพง (Pistol Squat & Wall Sit)',
    intent: 'advanced_squat_variations',
    regex: /(pistol\s*squat|พิสทอล|สควอทขาเดียว|สควอตขาเดียว|sissy\s*squat|ซิสซี่|wall\s*sit|วอลซิท|พิงกำแพง.*(ขา|เกร็ง|นั่ง)|นั่งพิงกำแพง|นั่งพิงผนัง)/i,
    response: '🦵 **ท่าฝึกช่วงล่างเฉพาะทาง (Pistol Squat & Wall Sit):**\n\n' +
      '1. **Pistol Squat (สควอทขาเดียว):**\n' +
      '   • เป็นท่าบอดี้เวทขั้นสูงที่ฝึกพลังกล้ามเนื้อต้นขา ก้น และการทรงตัวของข้อเท้าอย่างมาก\n' +
      '   • **วิธีฝึกเตรียมตัวสำหรับมือใหม่:**\n' +
      '     1) เริ่มจาก **Chair Squat ขาเดียว:** นั่งลงบนเก้าอี้ด้วยขาข้างเดียว แล้วดันตัวยืนขึ้น\n' +
      '     2) ใช้มือจับเสาหรือขอบโต๊ะช่วยพยุงน้ำหนักขณะย่อตัวลง\n' +
      '     3) ฝึกความยืดหยุ่นของข้อเท้าและสะโพกเป็นประจำ\n\n' +
      '2. **Wall Sit (นั่งพิงกำแพง):**\n' +
      '   • คือท่านั่งพิงผนังทำมุมเข่า 90 องศา เกร็งค้างไว้ (Isometric Exercise)\n' +
      '   • **ประโยชน์:** เสริมความทนทานของต้นขาด้านหน้า (Quads) โดย**ไม่มีแรงกระแทกหรือแรงหมุนที่ข้อเข่า** ปลอดภัยสูงมากสำหรับคนที่มีปัญหาเรื่องเข่าครับ'
  },
  
  {
    category: 'การฝึกขณะทำ IF หรือท้องว่าง (Fasted Training)',
    intent: 'fasted_training_if',
    regex: /(if.*(เวท|ยกเวท|ออกกำลัง)|ทำ\s*if.*(เวท|กล้าม)|ท้องว่าง.*(ยกเวท|เล่นเวท|สลายกล้าม)|fasted\s*training|fasted\s*cardio|กล้ามจะสลายไหม)/i,
    response: '⚡ **ออกกำลังกายหรือยกเวทตอนทำ IF (ท้องว่าง) กล้ามจะสลายไหม?**\n\n' +
      '**คำตอบสั้นๆ:** กล้ามเนื้อ**ไม่สลายง่ายขนาดนั้น**ครับ หากจัดการสารอาหารรวมต่อวันได้อย่างถูกต้อง!\n\n' +
      '• **ข้อเท็จจริงทางวิทยาศาสตร์:**\n' +
      '  1. **ฮอร์โมนช่วยปกป้องกล้ามเนื้อ:** ขณะอดอาหาร ระดับโกรทฮอร์โมน (HGH) จะสูงขึ้น ซึ่งมีส่วนช่วยลดการสลายตัวของโปรตีนในกล้ามเนื้อ\n' +
      '  2. **กล้ามเนื้อจะสลายเมื่อ:** คุณทานโปรตีนรวมทั้งวันไม่ถึง หรือขาดดุลพลังงาน (Calorie Deficit) มากเกินไปเป็นเวลานาน\n\n' +
      '• **คำแนะนำการฝึกระหว่างทำ IF:**\n' +
      '  - **คาร์ดิโอเบา-ปานกลาง (LISS):** ทำตอนท้องว่างได้ดีมาก ช่วยดึงไขมันมาใช้\n' +
      '  - **ยกเวทหนัก:** หากรู้สึกล้า ไม่มีแรง แนะนำให้ยกเวทในช่วงท้ายของเวลาอดอาหาร แล้วทานมื้อแรกหลังฝึกเสร็จทันที โดยเน้น **โปรตีน 25-35 กรัม + คาร์โบไฮเดรตเชิงซ้อน** เพื่อฟื้นฟูและสร้างกล้ามเนื้อเต็มที่ครับ'
  },
  {
    category: 'การประยุกต์ใช้อุปกรณ์ในบ้าน (ขวดน้ำแทนดัมเบล)',
    intent: 'household_equipment_substitute',
    regex: /(ขวดน้ำ.*แทน|ไม่มีดัมเบล.*ใช้.*แทน|ใช้อะไรแทนดัมเบล|อุปกรณ์ในบ้าน.*ออกกำลัง)/i,
    response: '🧴 **ใช้ขวดน้ำ 1.5 ลิตรแทนดัมเบลได้ไหม และได้กล้ามเนื้อเท่ากันไหม?**\n\n' +
      '**คำตอบ:** **ใช้แทนได้ดีเยี่ยมสำหรับมือใหม่และกล้ามเนื้อมัดเล็กครับ!** 💧💪\n\n' +
      '• **น้ำหนักจริง:** น้ำเปล่า 1.5 ลิตร จะมีน้ำหนักประมาณ **1.5 กิโลกรัม**\n' +
      '• **ท่าที่เหมาะมาก:**\n' +
      '  - Lateral Raise (ยกกางแขนบริหารไหล่ด้านข้าง)\n' +
      '  - Bicep Curl (ยกบริหารหน้าแขน)\n' +
      '  - Overhead Tricep Extension (บริหารหลังแขน)\n\n' +
      '• **ข้อจำกัด:** สำหรับกล้ามเนื้อมัดใหญ่ เช่น อก หลัง ขา น้ำหนัก 1.5 กก. อาจเบาเกินไป (ไม่พอสร้าง Progressive Overload ในระยะยาว)\n' +
      '• **ทริคเพิ่มความหนัก:**\n' +
      '  1. เพิ่มจำนวนครั้งเป็น 15-20 ครั้ง/เซ็ต และโฟกัสจังหวะผ่อนลงช้าๆ (3 วินาที)\n' +
      '  2. ใส่ทรายหรือกรวดลงในขวดแทนน้ำ เพื่อเพิ่มน้ำหนักขึ้นเป็น 2.5-3 กิโลกรัม\n' +
      '  3. ฝึกท่าบอดี้เวทควบคู่ เช่น Push-up หรือ Squat ครับ'
  }
];

function matchExerciseTrainingKnowledge(message) {
  const text = String(message || '').trim();
  if (!text) return null;

  for (const rule of TRAINING_200K_RULES) {
    if (rule.regex.test(text)) {
      return {
        category: rule.category,
        intent: rule.intent,
        isFrom200kDataset: true,
        expected_response: rule.response,
      };
    }
  }

  // Fallback match using 200k dataset sample triggers
  for (const [catName, catData] of Object.entries(exerciseTrainingKnowledge.categories || {})) {
    if (Array.isArray(catData.sampleTriggers)) {
      for (const trigger of catData.sampleTriggers) {
        if (text.includes(trigger) || (trigger.length > 10 && text.includes(trigger.slice(0, 15)))) {
          return {
            category: catName,
            intent: catData.intentKey || 'exercise_planning',
            isFrom200kDataset: true,
            expected_response: `🏋️‍♂️ **คำแนะนำจาก FitAI สำหรับ${catName}:**\n\n${catData.principles}\n\n• **แนวทางปฏิบัติ:** ${catData.recommendedPrescription || catData.recommendedStructure || 'จัดตารางและปริมาณการฝึกให้เหมาะสมกับเป้าหมาย'}\n\nคุณสามารถสอบถามรายละเอียดเพิ่มเติมเกี่ยวกับเซ็ต จำนวนครั้ง หรือท่าฝึกเฉพาะเจาะจงได้เลยครับ!`,
          };
        }
      }
    }
  }

  return null;
}

function matchCoachingIntent(message = '') {
  const text = String(message || '').trim();
  if (!text) return null;

  // 1. Emergency Red Flags (Highest Priority - 1669 Medical Emergency)
  const emergency = detectEmergencyRedFlags(text);
  if (emergency) {
    return {
      intent: 'emergency_red_flag',
      category: 'ความปลอดภัยฉุกเฉิน (1669)',
      expected_response: emergency.responseMessage,
      emergency: true,
      emergencyDetails: emergency
    };
  }

  // 2. Normalize Dialect for accurate understanding
  const dialectInfo = detectAndNormalizeDialect(text);
  const cleanMsg = dialectInfo.normalizedText;

  // 3. Needs Care (Extreme Diets / Starvation / Diet Pills)
  const isExtremeDiet = /(ลด.*(10|15|20).*โล.*(สัปดาห์|อาทิตย์)|อดข้าวทุกมื้อ|กิน.*(500|600|700).*แคล|ยาลดความอ้วน|ล้วงคอ|ยาขับปัสสาวะ)/i.test(cleanMsg);
  if (isExtremeDiet) {
    return {
      intent: 'needs_care_extreme_diet',
      category: 'ความเสี่ยง/ต้องตอบอย่างระวัง',
      expected_response: 'อธิบายด้วยความอบอุ่น ไม่ตัดสิน ไม่ตอกย้ำความผิด ชี้แจงว่าการลดเร็วเกินไปส่งผลเสียต่อกล้ามเนื้อและระบบเผาผลาญ แนะนำอัตราลดที่ปลอดภัย 0.5-1 กก./สัปดาห์ และไม่ให้อดอาหารต่ำกว่า 800-1000 kcal',
      needs_care: 1,
      dialectInfo
    };
  }

  // 4. Clarification on broad queries
  const clarification = detectClarificationNeeded(cleanMsg);
  if (clarification) {
    return {
      intent: 'clarification_needed_' + clarification.key,
      category: clarification.category,
      expected_response: clarification.clarificationPrompt,
      needsClarification: true,
      clarificationPrompt: clarification.clarificationPrompt,
      dialectInfo
    };
  }

  // 5. Match Persona, Constraint, Food Hack on cleaned message
  const persona = detectPersona(cleanMsg);
  const constraint = detectConstraint(cleanMsg);
  const foodHack = detectFoodHack(cleanMsg);

  let matchedIntent = null;
  for (const rule of INTENT_RULES) {
    if (rule.regex.test(cleanMsg)) {
      const info = intentMap.get(rule.intent);
      if (info) {
        matchedIntent = {
          intent: rule.intent,
          category: info.category,
          expected_response: info.expected_response,
          examples: info.examples
        };
        break;
      }
    }
  }

  // If no INTENT_RULES matched, synthesize from persona / constraint / foodHack
  if (!matchedIntent) {
    const training200k = matchExerciseTrainingKnowledge(cleanMsg);
    if (training200k) {
      matchedIntent = training200k;
    }
  }

  if (!matchedIntent) {
    if (foodHack) {
      matchedIntent = {
        intent: 'thai_food_hack_' + foodHack.key,
        category: 'thai_food_hack',
        expected_response: foodHack.savings ? `${foodHack.title}: ${foodHack.savings}. ${foodHack.explanation}` : (foodHack.rules || foodHack.items || []).join('; '),
        examples: []
      };
    } else if (persona) {
      matchedIntent = {
        intent: 'persona_' + persona.key,
        category: 'lifestyle_persona',
        expected_response: `แนวทางสำหรับ${persona.name}: ${persona.core_principle}. คำแนะนำ: ${persona.guidelines.join('; ')}`,
        examples: []
      };
    } else if (constraint) {
      matchedIntent = {
        intent: 'constraint_' + constraint.key,
        category: 'training_constraint',
        expected_response: `แนวทางสำหรับข้อจำกัด ${constraint.name}: ${constraint.tactics.join('; ')}`,
        examples: []
      };
    }
  }

  if (matchedIntent) {
    return {
      ...matchedIntent,
      persona,
      constraint,
      foodHack,
      dialectInfo
    };
  }

  if (dialectInfo.hasDialect) {
    return {
      intent: 'general_coaching_dialect',
      category: 'ทั่วไป',
      expected_response: 'สวัสดีครับ FitAI ยินดีดูแลคุณครับ! 🏋️‍♂️✨ เข้าใจความต้องการของคุณอย่างชัดเจนครับ ไม่ว่าจะพิมพ์ภาษาถิ่นหรือสไตล์ไหนบอกผมได้สบายๆ เลยครับ! วันนี้มีเป้าหมายอยากฟิตส่วนไหน หรืออยากให้ผมช่วยจัดตารางท่าฝึกเฉพาะเรื่องใด บอกรายละเอียดเพิ่มเติมได้เลยนะครับ!',
      dialectInfo
    };
  }

  return null;
}

function getCoachingPrinciplePrompt(intentObj) {
  if (!intentObj) return '';
  const lines = [
    `\n【แนวทางเฉพาะสำหรับคำถามเรื่องนี้ (${intentObj.category} / ${intentObj.intent})】:`,
    `• หลักการทางฟิตเนส: ${intentObj.expected_response}`
  ];
  if (intentObj.persona) {
    lines.push(`• บริบทผู้ใช้ (${intentObj.persona.name}): ยึดหลัก ${intentObj.persona.core_principle} - คำแนะนำ: ${intentObj.persona.guidelines.join('; ')}`);
  }
  if (intentObj.constraint) {
    lines.push(`• ข้อจำกัดสถานที่/เวลา (${intentObj.constraint.name}): แท็กติก: ${intentObj.constraint.tactics.join('; ')}`);
  }
  if (intentObj.foodHack) {
    lines.push(`• เกร็ดอาหารไทย (${intentObj.foodHack.title}): ${intentObj.foodHack.savings || ''} ${(intentObj.foodHack.rules || intentObj.foodHack.items || []).join('; ')}`);
  }
  return lines.join('\n');
}

function generateIntentFallback(intentObj, message, context = {}) {
  if (!intentObj) return 'สวัสดีครับ FitAI ยินดีดูแลคุณครับ! 🏋️‍♂️✨ มีอะไรให้ผมช่วยแนะนำเรื่องการออกกำลังกายหรืออาหารไหมครับ?';

  // 0. Critical Emergency Red Flags (1669 Triage)
  if (intentObj.emergency) {
    return intentObj.expected_response;
  }

  // 0.1 High Risk / Needs Care (Extreme Diets, Starvation, Diet Pills)
  if (intentObj.needs_care) {
    return 'ด้วยความห่วงใยจาก FitAI ครับ ❤️\n\n' + intentObj.expected_response;
  }

  // 0.15 200K Trained Knowledge Match
  if (intentObj.isFrom200kDataset && intentObj.expected_response) {
    return intentObj.expected_response;
  }

  // 0.2 Clarification for Broad Queries
  if (intentObj.needsClarification) {
    return intentObj.clarificationPrompt || intentObj.expected_response;
  }

  // 0.3 FitAI Self-Introduction & 5 Highlight Capabilities
  if (intentObj.intent === 'app_introduction_capabilities') {
    return [
      'สวัสดีครับ! ผมคือ **FitAI Trainer** โค้ชฟิตเนส AI ส่วนตัวของคุณครับ 🏋️‍♂️✨',
      'ผมได้รับการออกแบบมาเพื่อเป็นผู้ช่วยดูแลสุขภาพ การออกกำลังกาย และโภชนาการแบบครบวงจรในที่เดียว โดยมี **5 ฟังก์ชันเด่น** หลักที่จะช่วยให้คุณฟิตหุ่นและบรรลุเป้าหมายได้อย่างมีประสิทธิภาพ ดังนี้ครับ:',
      '',
      '---',
      '',
      '### 🌟 5 ฟังก์ชันเด่นของ FitAI Trainer:',
      '',
      '1. 🎯 **AI Real-Time Pose Tracking & Form Analysis (ตรวจจับและวิเคราะห์ท่าทางผ่านกล้อง)**',
      '   • ตรวจจับข้อต่อและมุมร่างกายแบบเรียลไทม์ขณะออกกำลังกายผ่านกล้องเว็บแคม',
      '   • ระบบนับจำนวนครั้ง (Rep Counter) อัตโนมัติอย่างแม่นยำ พร้อมจับเวลา',
      '   • ตรวจจับและแจ้งเตือนข้อผิดพลาดของฟอร์มทันที (เช่น ย่อไม่ลึกพอ, หลังงอ, จังหวะเร็วเกินไป) พร้อมคำแนะนำปรับท่าให้ถูกต้องและปลอดภัย ป้องกันการบาดเจ็บ',
      '   • รองรับโหมด **Unity 3D Interactive Workout** จำลองท่าทางด้วยโมเดล 3D เสมือนจริง',
      '',
      '2. 📅 **Personalized Smart Workout Plan (จัดและปรับตารางออกกำลังกายเฉพาะบุคคล)**',
      '   • ออกแบบโปรแกรมฝึกประจำสัปดาห์ (Full-Body, Upper/Lower, Cardio, Low-Impact ฯลฯ) ที่คำนวณตามสรีระ (BMI, น้ำหนัก, ส่วนสูง), เป้าหมาย และเวลาของคุณ',
      '   • ปรับเปลี่ยนแผนได้อย่างยืดหยุ่นผ่านการแชท เช่น *"ขอเปลี่ยนท่านี้", "วันนี้ขอเน้นหน้าท้อง", "เจ็บเข่าขอท่า Low-Impact"* หรือปรับเป็นวันพัก (Rest Day) ทันที',
      '   • มีคลิปวิดีโอสาธิตแต่ละท่าจาก YouTube ในตารางฝึกเพื่อความเข้าใจที่ถูกต้อง',
      '',
      '3. 🥗 **AI Food & Nutrition Tracker (บันทึกและวิเคราะห์โภชนาการอัจฉริยะ)**',
      '   • บันทึกมื้ออาหารในแต่ละวัน คำนวณพลังงาน (Calories) และสารอาหารหลัก (โปรตีน, คาร์โบไฮเดรต, ไขมัน)',
      '   • คำนวณและเปรียบเทียบกับค่า BMR / TDEE ประจำวันของคุณแบบอัตโนมัติ เพื่อคุมน้ำหนักหรือสร้างกล้ามเนื้อ',
      '   • มีระบบ Food Camera และ AI วิเคราะห์มื้ออาหาร หรือพิมพ์บอกเพื่อคำนวณแคลอรี่และสารอาหารได้ทันที',
      '   • ให้คำแนะนำเมนูสุขภาพทางเลือกและเทคนิคการกินคลีนในชีวิตประจำวัน',
      '',
      '4. 🎙️ **Voice Coach & Interactive Audio (โค้ชเสียงตอบโต้เสมือนจริง)**',
      '   • ระบบเสียงพูด AI โค้ช (Voice Coach) โทนเสียง Anime Mentor ชายเสียงทุ้ม สุขุม อบอุ่น และเป็นมืออาชีพ',
      '   • คอยให้กำลังใจ นับจังหวะ และแนะนำท่าด้วยเสียงแบบเรียลไทม์ขณะกำลังออกกำลังกาย',
      '   • สามารถเลือกเปิด-ปิดเสียงพูดได้ตามต้องการในหน้า Settings',
      '',
      '5. 📈 **Workout Progress & Analytics (ติดตามพัฒนาการและประวัติการฝึก)**',
      '   • สรุปสถิติการออกกำลังกาย จำนวนแคลอรี่ที่เผาผลาญ และความสม่ำเสมอ (Streak)',
      '   • บันทึกประวัติและแสดงแนวโน้มพัฒนาการ ให้คุณเห็นความก้าวหน้าของตัวเองได้อย่างชัดเจน',
      '',
      '---',
      '',
      '💡 **เริ่มต้นใช้งานได้ง่ายๆ:**',
      '• อยากเริ่มฝึก? พิมพ์ **"เริ่มออกกำลังกายวันนี้"** หรือกดที่เมนู **Workout**',
      '• อยากเช็กอาหาร? พิมพ์ **"วันนี้กินอกไก่ไป 200 กรัม กี่แคล"** หรือไปที่ **Food Tracker**',
      '• มีคำถามเรื่องท่าออกกำลังกายหรือการฟิตหุ่น? พิมพ์สอบถามผมได้ตลอดเวลาเลยครับ พร้อมลุยไปด้วยกันครับ! 🔥'
    ].join('\n');
  }

  const category = intentObj?.category;
  const intent = intentObj?.intent;
  const persona = intentObj?.persona;
  const constraint = intentObj?.constraint;
  const foodHack = intentObj?.foodHack;

  // 1. Safety Priority
  if (category === 'safety') {
    if (intent === 'safety_chest_pain') {
      return '⚠️ **ข้อควรระวังสำคัญมากครับ:** หากคุณมีอาการเจ็บหรือแน่นหน้าอก โดยเฉพาะถ้ามีอาการหายใจไม่ออก หน้ามืด หรือปวดร้าวไปที่แขน/กราม กรุณา**หยุดกิจกรรมทันที นั่งพักในที่ปลอดภัย และโทรขอความช่วยเหลือทางการแพทย์ฉุกเฉิน (1669)** ครับ สุขภาพและความปลอดภัยของหัวใจต้องมาก่อนเสมอครับ';
    }
    if (intent === 'safety_dizziness') {
      return '⚠️ **คำแนะนำจาก FitAI:** หากรู้สึกมึนหัวหรือหน้ามืดระหว่างออกกำลังกาย ให้**หยุดพักทันทีและนั่งลงในที่อากาศถ่ายเทสะดวก** อย่าเพิ่งลุกขึ้นกะทันหันครับ ค่อยๆ จิบน้ำเปล่า เช็กว่าได้รับพลังงานหรือน้ำเพียงพอหรือไม่ หากอาการยังไม่ดีขึ้นหลังจากพัก 10-15 นาที ควรหยุดการฝึกของวันนี้เพื่อความปลอดภัยครับ';
    }
    if (intent === 'safety_back_pain') {
      return '🛑 **การดูแลอาการเจ็บหลัง:** หากรู้สึกเจ็บหรือแปล๊บที่หลังระหว่างยกน้ำหนักหรือทำ Deadlift ให้**หยุดเซตนั้นทันทีครับ** อย่าฝืนยกต่อ! สาเหตุส่วนใหญ่มักเกิดจากหลังโก่ง (Back Rounding) หรือใช้น้ำหนักเกินที่แกนกลางลำตัวจะล็อกได้ แนะนำให้พัก ประคบเย็นหากมีอาการอักเสบเฉียบพลัน และเมื่อกลับมาฝึกให้ลดน้ำหนักลงเน้นล็อกสะบักและเกร็งหน้าท้องให้แน่นครับ';
    }
    if (intent === 'safety_joint_pain') {
      return '🛑 **การดูแลอาการเจ็บข้อต่อ/เข่า:** หากทำท่า Squat หรือกระโดดแล้วรู้สึกเจ็บข้อเข่า ให้**หยุดท่าดังกล่าวทันที** ตรวจสอบว่าเข่าบิดเข้าด้านในหรือไม่ หรือเปิดปลายเท้าตามแนวเข่าหรือเปล่า แนะนำให้เปลี่ยนมาทำท่า Low-impact เช่น Glute Bridge, Wall Sit หรือฝึกในระยะการเคลื่อนไหวที่ไม่เจ็บครับ';
    }
  }

  // 2. Thai Food Hacks & Street Food Ordering
  if (foodHack || category === 'thai_food_hack' || intent === 'food_substitution' || intent === 'food_calorie_question') {
    if (foodHack?.key === 'egg_hack' || /ไข่ต้ม.*ไข่ดาว/i.test(message)) {
      return '🍳 **ทริคเด็ดลดแคลอรี่: ไข่ต้ม แทน ไข่ดาว (Save 80-110 kcal!)**\n\n' +
        '• **ไข่ดาวทอดน้ำมัน:** ให้พลังงานสูงถึง **~150 - 180 kcal** (มีไขมันแฝงจากน้ำมันพืชทอด 10-12 กรัม)\n' +
        '• **ไข่ต้ม:** ให้พลังงานเพียง **~70 - 75 kcal** ได้โปรตีนคุณภาพสูงเน้นๆ **6 - 7 กรัม** เท่ากัน!\n\n' +
        '💡 **ข้อดี:** เพียงแค่เปลี่ยนจากไข่ดาวเป็นไข่ต้มวันละ 1-2 ฟอง คุณสามารถประหยัดพลังงานได้ถึง **100-200 kcal ต่อวัน** โดยที่ยังอิ่มท้องและได้โปรตีนเต็มที่ครับ!';
    }
    if (foodHack?.key === 'a_la_carte' || /ตามสั่ง/i.test(message)) {
      return '🍽️ **เทคนิคสั่งอาหารตามสั่งให้คลีนขึ้น 50%:**\n\n' +
        '1. **สั่งผัดน้ำ หรือ ใช้น้ำมันน้อยที่สุด:** ประหยัดไขมันแฝงได้ทันที 100-200 kcal\n' +
        '2. **ขอไม่ใส่ผงชูรสและหวานน้อย:** ลดปริมาณโซเดียมที่ทำให้บวมน้ำและน้ำตาลแฝง\n' +
        '3. **ลดข้าวลงเหลือ 1/2 จาน:** แล้วสั่งเพิ่มไข่ต้ม 1-2 ฟอง หรือเพิ่มเนื้ออกไก่เพื่อเพิ่มโปรตีน\n' +
        '4. **เมนูแนะนำ:** ต้มยำกุ้งน้ำใส, ต้มจืดเต้าหู้หมูสับ, ลาบอกไก่คั่วแห้ง, ผัดกะเพราอกไก่ไม่ใช้น้ำมันครับ';
    }
    if (foodHack?.key === 'noodle_ordering' || /ก๋วยเตี๋ยว/i.test(message)) {
      return '🍜 **เทคนิคสั่งก๋วยเตี๋ยวให้แคลต่ำ โปรตีนสูง:**\n\n' +
        '1. **เลือกเส้นหมี่ขาวหรือวุ้นเส้น:** หลีกเลี่ยงเส้นใหญ่ (อมน้ำมัน) และบะหมี่เหลือง (คาร์บและไขมันสูง)\n' +
        '2. **สั่งไม่เจียวกระเทียมและไม่ใส่กากหมู:** ประหยัดพลังงานได้ทันที 80-120 kcal ต่อชาม\n' +
        '3. **เลือกน้ำใส:** เลี่ยงน้ำต้มยำน้ำข้นหรือน้ำตกที่ใส่กะทิและเลือดข้น\n' +
        '4. **สั่งเพิ่มเนื้อสด/อกไก่/ลูกชิ้นปลาแท้:** และไม่ซดน้ำซุปจนหมดชามเพื่อลดการรับโซเดียมครับ';
    }
    if (foodHack?.key === 'seven_eleven' || /เซเว่น|7-11/i.test(message)) {
      return '🏪 **รวมเมนูโปรตีนสูง คุมแคลอรี่ใน 7-Eleven:**\n\n' +
        '1. **อกไก่นุ่ม CP (รสพริกไทยดำ/กระเทียม):** ~80-90 kcal | 🍗 โปรตีน 17-20g\n' +
        '2. **ไข่ต้มสมุนไพร / ยางมะตูม (แพ็ค 2 ฟอง):** ~140-150 kcal | 🥚 โปรตีน 12-14g\n' +
        '3. **นมโปรตีนสูง (Meiji / Dutch Mill High Protein):** ~150-170 kcal | 🥛 โปรตีน 25-28g\n' +
        '4. **สลัดผักอกไก่ (ราดน้ำสลัดงาญี่ปุ่นครึ่งซอง):** ~120 kcal | 🥗 โปรตีน 12g\n' +
        '5. **กล้วยหอมทอง:** ~100-120 kcal (คาร์โบไฮเดรตเชิงซ้อน เหมาะเป็นพรีเวิร์กเอาต์ก่อนซ้อม 30 นาที)';
    }
  }

  // 3. Lifestyle Personas
  if (persona || category === 'lifestyle_persona') {
    if (persona?.key === 'skinny_fat' || /ผอมมีพุง|skinny fat/i.test(message)) {
      return '🎯 **แนวทางสำหรับคนผอมมีพุง (Skinny Fat) โดย FitAI:**\n\n' +
        'ภาวะนี้เกิดจาก **มวลกล้ามเนื้อน้อย แต่มีไขมันสะสมที่ช่องท้อง** การอดอาหารหรือวิ่งหนักๆ จะยิ่งทำให้กล้ามหายและพุงป่องขึ้นครับ!\n\n' +
        '💪 **กลยุทธ์ Body Recomposition (สร้างกล้ามเนื้อควบคู่การลดไขมัน):**\n' +
        '1. **เวทเทรนนิ่งเป็นหลัก 3-4 วัน/สัปดาห์:** เน้นท่าคอมพาวด์ (Squat, Push-up, Row) เพื่อกระตุ้นกล้ามเนื้อชิ้นใหญ่\n' +
        '2. **ทานโปรตีนสูง:** 1.6 - 2.0 กรัมต่อน้ำหนักตัว (กก.) เพื่อนำไปซ่อมแซมและสร้างกล้ามเนื้อใหม่\n' +
        '3. **คุมแคลอรี่ระดับพอดี (Maintenance หรือ Deficit บางๆ -200 kcal):** ห้ามอดอาหารเด็ดขาด\n' +
        '4. **คาร์ดิโอเบาๆ Zone 2 สัปดาห์ละ 2-3 ครั้ง (ครั้งละ 20-30 นาที):** เพื่อดึงไขมันมาใช้โดยไม่สลายกล้ามเนื้อครับ';
    }
    if (persona?.key === 'busy_lifestyle' || /ไม่มีเวลา|เวลาน้อย/i.test(message)) {
      return '⏱️ **กลยุทธ์ฟิตหุ่นสำหรับคนเวลาน้อย (High-Density Training):**\n\n' +
        'แม้มีเวลาเพียง 20-30 นาที ก็สามารถสร้างผลลัพธ์ที่ดีได้ด้วยเทคนิคเหล่านี้ครับ:\n' +
        '1. **Antagonist Superset:** สลับเล่นกล้ามเนื้อตรงข้าม เช่น วิดพื้น (อก) จบแล้วต่อด้วย Dumbbell Row (หลัง) ทันที พักสั้น 45 วินาที ช่วยประหยัดเวลาได้ 50%\n' +
        '2. **Compound Movements:** เลือกท่าที่ใช้กล้ามเนื้อหลายส่วนพร้อมกัน (Squat, Push-up, Lunge)\n' +
        '3. **คุมความเข้มข้น (Intensity):** 20 นาทีที่โฟกัสเต็มที่ ให้ผลลัพธ์เทียบเท่า 60 นาทีที่พักนานครับ!';
    }
    if (persona?.key === 'low_budget' || /งบน้อย|150 บาท/i.test(message)) {
      return '💰 **คู่มือฟิตเนสงบประหยัด (โปรตีนครบในงบไม่เกิน 150 บาท/วัน):**\n\n' +
        '• **ไข่ไก่:** แหล่งโปรตีนคุ้มค่าที่สุด (ฟองละ ~4.5-5 บาท ได้โปรตีน 6g) ทานวันละ 3-4 ฟอง\n' +
        '• **อกไก่สด:** ซื้อจากตลาดหรือห้างค้าส่ง (กก. ละ ~75-85 บาท ได้โปรตีนถึง 230g คุ้มค่ามาก)\n' +
        '• **เต้าหู้ขาว/เหลือง:** ก้อนละ 12-15 บาท ได้โปรตีน 14-16g\n' +
        '• **คาร์บคุณภาพประหยัด:** ข้าวกล้อง, กล้วยน้ำว้า, ข้าวโอ๊ตแบบต้ม\n' +
        '💡 สามารถทานโปรตีนแตะ 90-110g ได้อย่างสบายในงบเพียง 100-130 บาทต่อวันครับ!';
    }
  }

  // 4. Default intelligent fallback based on intent expected response
  return `สวัสดีครับ FitAI ยินดีดูแลคุณครับ! 🏋️‍♂️✨\n\n💡 **คำแนะนำสำหรับเรื่องนี้:**\n${intentObj.expected_response}\n\nหากคุณต้องการให้ FitAI จัดตารางอย่างละเอียด หรือปรับเข้ากับเป้าหมายเฉพาะส่วน บอกรายละเอียดเพิ่มเติมได้เลยนะครับ!`;
}

module.exports = {
  detectAndNormalizeDialect,
  detectEmergencyRedFlags,
  detectClarificationNeeded,
  finetunedData,
  matchCoachingIntent,
  getCoachingPrinciplePrompt,
  generateIntentFallback,
  detectPersona,
  detectConstraint,
  detectFoodHack,
  dataset,
  intentMap
};
