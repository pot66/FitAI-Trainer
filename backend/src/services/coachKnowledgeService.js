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

// Build intent map
const intentMap = new Map();
for (const item of dataset) {
  if (!intentMap.has(item.intent)) {
    intentMap.set(item.intent, {
      intent: item.intent,
      category: item.category,
      expected_response: item.expected_response,
      examples: []
    });
  }
  intentMap.get(item.intent).examples.push(item.example_question);
}

// Intent rule matchers (flexible regex keywords)
const INTENT_RULES = [
  // 14. Safety First (Priority)
  { intent: 'safety_chest_pain', regex: /(เจ็บหน้าอก|แน่นหน้าอก|ปวดหน้าอก|หายใจไม่ออกตอนวิ่ง|หัวใจเต้นผิดจังหวะ)/i },
  { intent: 'safety_dizziness', regex: /(เวียนหัว|มึนหัว|หน้ามืด|จะเป็นลม|ตาลาย)/i },
  { intent: 'safety_back_pain', regex: /(เจ็บหลัง|ปวดหลัง|หลังเดี้ยง|หลังยอก|หลังเจ็บ|deadlift.*ปวดหลัง|ปวดเอว.*ยก)/i },
  { intent: 'safety_joint_pain', regex: /(เจ็บเข่า|ปวดเข่า|เข่าลั่น|ปวดข้อ|ข้อเท้าเจ็บ|squat.*เจ็บเข่า)/i },
  { intent: 'safety_shoulder_pain', regex: /(เจ็บไหล่|ปวดไหล่|ไหล่ติด|ยกแขนแล้วเจ็บ|bench press.*เจ็บไหล่)/i },
  { intent: 'safety_stop_signs', regex: /(เมื่อไหร่ควรหยุด|อาการ.*หยุดทันที|อันตรายไหม|ไม่ควรฝืน|สัญญาณอันตราย)/i },
  { intent: 'safety_medical_clearance', regex: /(โรคประจำตัว|ปรึกษาหมอ|ความดัน|เบาหวาน|หัวใจ.*ออกกำลัง|ปัญหาสุขภาพ)/i },
  { intent: 'safety_injury_return', regex: /(กลับมาออกกำลัง.*บาดเจ็บ|หายเจ็บแล้ว|หลังบาดเจ็บ|เคยเจ็บ)/i },
  { intent: 'safety_overexertion', regex: /(หมดแรงผิดปกติ|เหนื่อยมากเกิน|ฝึกหนักเกิน|overtrain|หอบมาก)/i },
  { intent: 'safety_muscle_soreness', regex: /(ปวดกล้าม.*หยุดไหม|เมื่อยมาก.*ฝึกเบา|doms.*ออกกำลังได้ไหม)/i },

  // Thai Food & Street Food Hacks (Synthesized from 10k Dataset)
  { intent: 'food_substitution', regex: /(ไข่ต้มแทนไข่ดาว|เปลี่ยนเป็นไข่ต้ม|แทนไข่ดาว|ส้มตำไทยไข่ต้ม|ข้าวมันไก่ไม่เอาหนัง|ต้มยำกุ้งน้ำใส|เปลี่ยนเมนู|แทนของทอด)/i },
  { intent: 'food_calorie_question', regex: /(ข้าวมันไก่กี่แคล|กะเพรากี่แคล|ไข่ดาวกี่แคล|ส้มตำกี่แคล|ก๋วยเตี๋ยวกี่แคล|จานนี้กี่แคล|แคลอรี่เท่าไร)/i },
  { intent: 'calculate_macro', regex: /(คำนวณสารอาหาร|คำนวณมาโคร|กี่กรัมโปรตีน|สัดส่วนโปรตีน.*คาร์บ|macro)/i },
  { intent: 'calculate_calories', regex: /(คำนวณ bmr|คำนวณ tdee|ต้องการพลังงานกี่แคล|เผาผลาญวันละเท่าไร)/i },
  { intent: 'create_meal_plan', regex: /(จัดตารางอาหาร|แพลนอาหารคลีน|เมนูอาหาร 7 วัน|ตารางกินอาหาร)/i },
  { intent: 'recommend_food', regex: /(อาหารเซเว่น|ของกิน 7-11|ของกินเซเว่น|อาหารตามสั่งคลีน|สั่งก๋วยเตี๋ยว.*คลีน)/i },

  // 1. Goals & Specific Body Targets
  { intent: 'goal_fat_loss', regex: /(ลดไขมัน|เบิร์นไขมัน|fat loss|ลดพุง|อยากผอม|ลดสัดส่วน)/i },
  { intent: 'goal_weight_loss', regex: /(ลดน้ำหนัก|คุมน้ำหนัก|ชั่งน้ำหนัก|น้ำหนักตัวเยอะ)/i },
  { intent: 'goal_muscle_gain', regex: /(สร้างกล้าม|เพิ่มกล้าม|bulk|อยากตัวใหญ่|กล้ามโต|hypertrophy)/i },
  { intent: 'goal_strength', regex: /(เพิ่มแรง|ยกได้หนักขึ้น|strength|พลังกำลัง)/i },
  { intent: 'goal_endurance', regex: /(เพิ่มความอึด|ไม่เหนื่อยง่าย|endurance|ความทนทาน)/i },
  { intent: 'goal_body_part', regex: /(อยากเน้นแขน|อยากเน้นอก|อยากเน้นก้น|อยากเน้นขา|อยากเน้นหลัง|อยากมีซิกแพค|ลดต้นขา|เล่นแขน|เล่นอก|เล่นหลัง|เล่นขา|เล่นไหล่|เล่นท้อง)/i },
  { intent: 'fat_loss', regex: /(วิธีลดไขมัน|หลักการลดไขมัน|แฟตเบิร์น)/i },
  { intent: 'muscle_gain', regex: /(หลักการสร้างกล้าม|อาหารสร้างกล้าม|โปรแกรมสร้างกล้าม)/i },

  // 2. Workout Planning & Splits
  { intent: 'create_workout_plan', regex: /(จัดตารางออกกำลังกาย|สร้างตารางฝึก|วางตารางเวท|จัดโปรแกรมออกกำลัง)/i },
  { intent: 'modify_workout_plan', regex: /(ปรับตาราง|แก้ตาราง|เปลี่ยนวันเล่น|สลับวันออกกำลัง)/i },
  { intent: 'plan_create_week', regex: /(จัดตาราง 1 สัปดาห์|ตาราง 7 วัน|วางแผนทั้งอาทิตย์|ตารางประจำสัปดาห์)/i },
  { intent: 'plan_push_pull_legs', regex: /(push pull legs|ppl|ตาราง ppl)/i },
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

function matchCoachingIntent(message = '') {
  const text = String(message || '').trim();
  if (!text) return null;

  const persona = detectPersona(text);
  const constraint = detectConstraint(text);
  const foodHack = detectFoodHack(text);

  let matchedIntent = null;
  for (const rule of INTENT_RULES) {
    if (rule.regex.test(text)) {
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
      foodHack
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
  lines.push('(คำแนะนำจาก FitAI: ให้อิสระในการตอบ อธิบาย ยกตัวอย่าง ให้เหตุผลที่เป็นธรรมชาติ อบอุ่น และกระชับ ตรงจุด)');
  return lines.join('\n');
}

// Rich, dynamic fallback generator for coaching queries
function generateIntentFallback(intentObj, message = '', context = {}) {
  const profile = context.profile || {};
  const intent = intentObj?.intent || '';
  const category = intentObj?.category || '';
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
        '3. **ไข่ตุ๋นคัพ:** ~70-80 kcal | 🍲 โปรตีน 6g (ทานง่าย ย่อยสบาย)\n' +
        '4. **นมโปรตีนสูง High Protein Milk (ไม่เติมน้ำตาล):** ~170-200 kcal | 🥛 โปรตีน 28-30g\n' +
        '5. **ถั่วแระญี่ปุ่น (Edamame):** ~120 kcal | 🫛 โปรตีน 9g พร้อมใยอาหารสูง อิ่มนานครับ!';
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
    if (persona?.key === 'office_worker' || /มนุษย์เงินเดือน|ออฟฟิศ/i.test(message)) {
      return '💼 **โปรแกรมฟิตเนสสำหรับมนุษย์เงินเดือน & ออฟฟิศซินโดรม:**\n\n' +
        '1. **เน้นท่าดึง (Pulling Exercises):** เช่น Dumbbell/Band Row และ Face Pull เพื่อดึงสะบักหลังกลับ แก้อาการไหล่ห่อหลังค่อม\n' +
        '2. **ยืดกล้ามเนื้อ Hip Flexors & หน้าอก:** คลายสะโพกและหน้าอกที่หดเกร็งจากการนั่งโต๊ะนานหลายชั่วโมง\n' +
        '3. **ทริคมื้อเที่ยง:** สั่งอาหารตามสั่งแบบผัดน้ำ หรือเลือกเกาเหลาน้ำใส เลี่ยงเครื่องดื่มชาเย็น/กาแฟหวานมันครับ';
    }
    if (persona?.key === 'night_owl' || /นอนดึก|กะดึก/i.test(message)) {
      return '🌙 **คำแนะนำสำหรับคนนอนดึก / เข้ากะดึก:**\n\n' +
        '1. **เวลาออกกำลังกาย:** ควรฝึกให้เสร็จก่อนเข้านอนอย่างน้อย 3 ชั่วโมง เพื่อให้อุณหภูมิร่างกายและอัตราการเต้นหัวใจกลับสู่ปกติ\n' +
        '2. **งดคาเฟอีนก่อนนอน 6 ชม.:** หลีกเลี่ยงพรีเวิร์กเอาต์และกาแฟก่อนนอน เพื่อไม่ให้รบกวนคลื่นสมองช่วงหลับลึก\n' +
        '3. **ห้องนอนต้องมืดสนิท:** ใช้ผ้าม่านกันแสงเพื่อช่วยให้ร่างกายหลั่งเมลาโทนินและ Growth Hormone ซ่อมแซมกล้ามเนื้อได้เต็มที่ครับ';
    }
    if (persona?.key === 'student' || /นักศึกษา|เด็กหอ/i.test(message)) {
      return '🎓 **คำแนะนำฟิตหุ่นฉบับเด็กหอ / นักศึกษา:**\n\n' +
        '1. **บอดี้เวทในห้องพัก:** Push-up, Squat, Plank และ Glute Bridge ไม่ต้องใช้พื้นที่เยอะและไม่ต้องเดินทาง\n' +
        '2. **โปรตีนงบประหยัด:** ไข่ต้มเซเว่น, นมถั่วเหลืองไม่ใส่น้ำตาล, ข้าวราดแกงเน้นเนื้อไม่หนัง\n' +
        '3. **บริหารช่วงสอบ:** ขยับร่างกายวันละ 15-20 นาที ช่วยให้สมองปลอดโปร่งและลดความเครียดจากการอ่านหนังสือครับ';
    }
    if (persona?.key === 'runner' || /นักวิ่ง|สายวิ่ง/i.test(message)) {
      return '🏃 **คำแนะนำสำหรับสายวิ่ง / นักวิ่ง:**\n\n' +
        '1. **เสริมเวทเทรนนิ่งสัปดาห์ละ 2 ครั้ง:** เน้นท่าขาข้างเดียว (Lunges, Bulgarian Split Squats) เพื่อสร้างสมดุลขาทั้งสองข้างและปกป้องข้อเข่า\n' +
        '2. **ฝึกแกนกลางลำตัว (Core Strength):** ท่า Plank และ Deadbug ช่วยรักษาฟอร์มการวิ่งให้นิ่งแม้เหนื่อยล้าช่วงท้าย\n' +
        '3. **โภชนาการ:** ทานคาร์โบไฮเดรตเชิงซ้อนสะสมพลังงาน และอย่าลืมจิบเกลือแร่เมื่อวิ่งระยะไกลครับ';
    }
  }

  // 4. Training Constraints (Condo quiet, home dumbbell, 30 min, etc.)
  if (constraint || category === 'training_constraint') {
    if (constraint?.key === 'condo_quiet' || /คอนโด|เสียงดัง/i.test(message)) {
      return '🏢 **โปรแกรมออกกำลังกายในคอนโด (Low-Impact ไร้เสียงกระโดด 100%):**\n\n' +
        '1. **Tempo Bodyweight Squat (3 เซ็ต · 12 ครั้ง):** ลงช้าๆ 3 วินาที เกร็งก้นและต้นขาแน่น ไร้แรงกระแทก\n' +
        '2. **Standard หรือ Knee Push-up (3 เซ็ต · 10-12 ครั้ง):** บริหารหน้าอกและแขนแบบเงียบสนิท\n' +
        '3. **Reverse Lunge (3 เซ็ต · ข้างละ 10 ครั้ง):** ก้าวถอยหลัง ปลอดภัยต่อข้อเข่าและไม่มีเสียงตึงตัง\n' +
        '4. **Glute Bridge & Plank (3 เซ็ต · 30 วินาที):** เสริมสร้างแกนกลางลำตัวและสะโพก\n' +
        '💡 *เคล็ดลับ:* ใช้เสื่อโยคะหรือแผ่นยางรอง และคุมจังหวะเกร็งกล้ามเนื้อช้าๆ จะช่วยกระตุ้นกล้ามเนื้อได้ยอดเยี่ยมโดยไม่ต้องกระโดดเลยครับ!';
    }
    if (constraint?.key === 'home_dumbbell' || /ดัมเบลคู่เดียว/i.test(message)) {
      return '🏋️ **โปรแกรม Full Body ด้วยดัมเบลคู่เดียวที่บ้าน:**\n\n' +
        '1. **Goblet Squat (3 เซ็ต · 10-12 ครั้ง):** ถือดัมเบลแนบอก สร้างความแข็งแรงต้นขาและสะโพก\n' +
        '2. **Dumbbell Floor Press (3 เซ็ต · 10-12 ครั้ง):** นอนราบบนเสื่อ ดันดัมเบลขึ้น พัฒนาหน้าอกและหลังแขน\n' +
        '3. **Dumbbell Bent-over Row (3 เซ็ต · 10-12 ครั้ง):** โค้งตัวดึงดัมเบลเข้าหาเอว พัฒนากล้ามเนื้อหลังและปีก\n' +
        '4. **Standing Dumbbell Overhead Press (3 เซ็ต · 8-10 ครั้ง):** ดันดัมเบลขึ้นเหนือศีรษะ เสริมไหล่ให้กว้าง\n' +
        '5. **Romanian Deadlift (3 เซ็ต · 10-12 ครั้ง):** พับสะโพกบริหารหลังขาและก้น';
    }
  }

  // 5. Specific Body Parts
  if (intent === 'goal_body_part' || /แขน|อก|หลัง|ขา|ไหล่|ท้อง/i.test(message)) {
    if (/แขน/i.test(message)) {
      return '💪 **โปรแกรมฝึกกล้ามแขน (หน้าแขน Biceps & หลังแขน Triceps):**\n\n' +
        '**หลังแขน (Triceps - คิดเป็น 60% ของขนาดแขนทั้งหมด):**\n' +
        '1. **Tricep Dips / Chair Dips** (3 เซ็ต · 10-12 ครั้ง)\n' +
        '2. **Close-Grip Push-up** (3 เซ็ต · 8-10 ครั้ง)\n' +
        '3. **Overhead Tricep Extension** (3 เซ็ต · 10-12 ครั้ง)\n\n' +
        '**หน้าแขน (Biceps):**\n' +
        '1. **Dumbbell Bicep Curl** (3 เซ็ต · 10-12 ครั้ง)\n' +
        '2. **Hammer Curl** (3 เซ็ต · 10-12 ครั้ง - ช่วยสร้างมิติความหนาของแขน)\n\n' +
        '💡 *คำแนะนำ:* โฟกัสการบีบเกร็งที่จุดสูงสุด 1 วินาที และผ่อนน้ำหนักลงช้าๆ 2-3 วินาที จะทำให้แขนพัฒนาได้รวดเร็วมากครับ!';
    }
    if (/อก/i.test(message)) {
      return '🏋️ **โปรแกรมสร้างกล้ามเนื้อหน้าอก (Chest Workout):**\n\n' +
        '1. **Standard Push-up / Bench Press:** (3 เซ็ต · 8-12 ครั้ง) สร้างมวลรวมของหน้าอก\n' +
        '2. **Incline Push-up (เท้าวางบนเก้าอี้) หรือ Incline Press:** (3 เซ็ต · 10-12 ครั้ง) เน้นอกบนให้เต็ม\n' +
        '3. **Chest Fly (ดัมเบลหรือสายยางยืด):** (3 เซ็ต · 12-15 ครั้ง) ยืดและบีบกล้ามเนื้ออกเข้าหากัน\n\n' +
        '💡 ล็อกสะบักหลังให้แน่นและเปิดอกขึ้นเสมอเพื่อไม่ให้หัวไหล่รับภาระแทนหน้าอกครับ!';
    }
  }

  // 6. Hypertrophy, DOMS, and Principles
  if (intent === 'progressive_overload') {
    return '📈 **Progressive Overload คือหัวใจของการพัฒนากล้ามเนื้อและความแข็งแรงครับ!**\nหมายถึงการค่อยๆ เพิ่มความท้าทายให้กล้ามเนื้อทีละระดับเมื่อร่างกายเริ่มปรับตัวได้ โดยทำได้หลายวิธี:\n1. **เพิ่มน้ำหนัก:** เมื่อยกน้ำหนักเดิมครบเซตด้วยฟอร์มสวยๆ ให้เพิ่มน้ำหนักขึ้น 2.5 - 5%\n2. **เพิ่มจำนวนครั้ง (Reps):** จากเดิมทำได้ 8 ครั้ง พัฒนาเป็น 10-12 ครั้ง\n3. **เพิ่มคุณภาพฟอร์ม & Tempo:** ควบคุมจังหวะผ่อนน้ำหนักลงช้าๆ 2-3 วินาที\n4. **ลดเวลาพักระหว่างเซต:** เพื่อเพิ่มความเข้มข้นของการฝึกครับ';
  }

  if (intent === 'doms') {
    return '💪 **DOMS (Delayed Onset Muscle Soreness):**\nคืออาการปวดเมื่อยระบมกล้ามเนื้อที่มักจะเกิดขึ้นหลังออกกำลังกายไปแล้ว 24-48 ชั่วโมง เป็นกลไกปกติที่ร่างกายกำลังซ่อมแซมเส้นใยกล้ามเนื้อขนาดเล็กให้แข็งแรงขึ้นครับ\n\n💡 **วิธีบรรเทา:**\n• ทำ Active Recovery เช่น เดินเบาๆ หรือยืดเหยียดเบาๆ เพื่อกระตุ้นการไหลเวียนโลหิต\n• ดื่มน้ำให้เพียงพอและทานโปรตีนคุณภาพสูง\n• นอนหลับพักผ่อน 7-8 ชั่วโมง อาการจะค่อยๆ ดีขึ้นเองใน 2-3 วันครับ';
  }

  // Default intelligent fallback based on intent expected response
  return `สวัสดีครับ FitAI ยินดีดูแลคุณครับ! 🏋️‍♂️✨\n\n💡 **คำแนะนำสำหรับเรื่องนี้:**\n${intentObj.expected_response}\n\nหากคุณต้องการให้ FitAI จัดตารางอย่างละเอียด หรือปรับเข้ากับเป้าหมายเฉพาะส่วน บอกรายละเอียดเพิ่มเติมได้เลยนะครับ!`;
}

module.exports = {
  matchCoachingIntent,
  getCoachingPrinciplePrompt,
  generateIntentFallback,
  detectPersona,
  detectConstraint,
  detectFoodHack,
  dataset,
  intentMap
};
