const path = require('path');
const fs = require('fs');

// Load dataset
let dataset = [];
try {
  const dataPath = path.join(__dirname, '../data/exercise_qa_dataset.json');
  dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (err) {
  console.warn('Could not load exercise_qa_dataset.json:', err.message);
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
  { intent: "safety_chest_pain", regex: /(เจ็บหน้าอก|แน่นหน้าอก|ปวดหน้าอก|หายใจไม่ออกตอนวิ่ง|หัวใจเต้นผิดจังหวะ)/i },
  { intent: "safety_dizziness", regex: /(เวียนหัว|มึนหัว|หน้ามืด|จะเป็นลม|ตาลาย)/i },
  { intent: "safety_back_pain", regex: /(เจ็บหลัง|ปวดหลัง|หลังเดี้ยง|หลังยอก|หลังเจ็บ|deadlift.*ปวดหลัง|ปวดเอว.*ยก)/i },
  { intent: "safety_joint_pain", regex: /(เจ็บเข่า|ปวดเข่า|เข่าลั่น|ปวดข้อ|ข้อเท้าเจ็บ|squat.*เจ็บเข่า)/i },
  { intent: "safety_shoulder_pain", regex: /(เจ็บไหล่|ปวดไหล่|ไหล่ติด|ยกแขนแล้วเจ็บ|bench press.*เจ็บไหล่)/i },
  { intent: "safety_stop_signs", regex: /(เมื่อไหร่ควรหยุด|อาการ.*หยุดทันที|อันตรายไหม|ไม่ควรฝืน|สัญญาณอันตราย)/i },
  { intent: "safety_medical_clearance", regex: /(โรคประจำตัว|ปรึกษาหมอ|ความดัน|เบาหวาน|หัวใจ.*ออกกำลัง|ปัญหาสุขภาพ)/i },
  { intent: "safety_injury_return", regex: /(กลับมาออกกำลัง.*บาดเจ็บ|หายเจ็บแล้ว|หลังบาดเจ็บ|เคยเจ็บ)/i },
  { intent: "safety_overexertion", regex: /(หมดแรงผิดปกติ|เหนื่อยมากเกิน|ฝึกหนักเกิน|overtrain|หอบมาก)/i },
  { intent: "safety_muscle_soreness", regex: /(ปวดกล้าม.*หยุดไหม|เมื่อยมาก.*ฝึกเบา|doms.*ออกกำลังได้ไหม)/i },

  // 1. Goals
  { intent: "goal_fat_loss", regex: /(ลดไขมัน|เบิร์นไขมัน|สลายไขมัน|อยากลีน|fat loss)/i },
  { intent: "goal_weight_loss", regex: /(ลดน้ำหนัก|ลดความอ้วน|อยากผอม|น้ำหนักลด|weight loss)/i },
  { intent: "goal_muscle_gain", regex: /(เพิ่มกล้าม|สร้างกล้าม|ตัวแน่นขึ้น|กล้ามโต|hypertrophy|muscle gain)/i },
  { intent: "goal_strength", regex: /(เพิ่มแรง|ยกหนักขึ้น|แข็งแรงขึ้น|strength|อยากมีแรง)/i },
  { intent: "goal_endurance", regex: /(อึดขึ้น|ความอึด|ฟิตหัวใจ|เหนื่อยง่าย|endurance|ความทนทาน)/i },
  { intent: "goal_running_5k", regex: /(วิ่ง 5k|วิ่ง 5 กิโล|5 กิโลเมตร|ซ้อม 5k)/i },
  { intent: "goal_running_10k", regex: /(วิ่ง 10k|วิ่ง 10 กิโล|10 กิโลเมตร|ซ้อม 10k|มินิมาราธอน)/i },
  { intent: "goal_body_part", regex: /(เน้นอก|เน้นขา|เน้นก้น|เน้นไหล่|เน้นแขน|เน้นหลัง|ปั้นก้น|ปั้นอก)/i },
  { intent: "goal_consistency", regex: /(ออกกำลังกายให้สม่ำเสมอ|หลุดตารางบ่อย|สร้างวินัย|ความต่อเนื่อง|ทำต่อเนื่อง)/i },
  { intent: "goal_general", regex: /(ตั้งเป้าหมาย.*แบบไหน|เป้าหมายการออกกำลังกาย|เลือกเป้าหมาย|ช่วยตั้งเป้าหมาย)/i },

  // 4. Form & Posture
  { intent: "form_squat", regex: /(ตรวจ.*squat|squat.*ถูกไหม|ฟอร์ม squat|ท่า squat)/i },
  { intent: "form_pushup", regex: /(ตรวจ.*push.?up|push.?up.*ถูกไหม|วิดพื้น.*ถูกไหม|ท่า push.?up)/i },
  { intent: "form_deadlift", regex: /(ตรวจ.*deadlift|deadlift.*ถูกไหม|ฟอร์ม deadlift|ยก deadlift)/i },
  { intent: "form_knee_valgus", regex: /(เข่า.*หุบ|เข่า.*เข้าด้านใน|knee valgus|เข่าบิด)/i },
  { intent: "form_back_rounding", regex: /(หลังงอ|หลังค่อม|หลังโก่ง|หลังกลม|back round)/i },
  { intent: "form_hip_depth", regex: /(ลง squat ลึก|ความลึก.*squat|ย่อลึกแค่ไหน|squat.*ลึก)/i },
  { intent: "form_balance_left_right", regex: /(เอียงซ้ายขวา|สมดุล|ซ้ายขวาไม่เท่ากัน|ไม่บาลานซ์)/i },
  { intent: "form_range_of_motion", regex: /(rom.*เต็มไหม|ช่วงการเคลื่อนไหว|range of motion)/i },
  { intent: "form_rep_validity", regex: /(rep.*ถูกไหม|ครั้งนี้นับไหม|ผ่านเกณฑ์ไหม|นับครั้ง)/i },
  { intent: "form_real_time_feedback", regex: /(เตือนแบบเรียลไทม์|บอกทันที.*ท่าผิด|ฟีดแบ็กท่า)/i },

  // 2. Workout Plan
  { intent: "plan_create_week", regex: /(ตาราง.*7 วัน|โปรแกรม.*1 สัปดาห์|ตารางซ้อมทั้งสัปดาห์|ตารางรายสัปดาห์)/i },
  { intent: "plan_create_month", regex: /(โปรแกรม 30 วัน|แผน.*1 เดือน|ตารางซ้อมทั้งเดือน)/i },
  { intent: "plan_full_body", regex: /(full body|เล่นทั้งตัว|ทุกส่วนในวันเดียว)/i },
  { intent: "plan_push_pull_legs", regex: /(push pull legs|ppl|พุชพูลเลก)/i },
  { intent: "plan_upper_lower", regex: /(upper lower|บนล่าง|ท่อนบนท่อนล่าง)/i },
  { intent: "plan_home_no_equipment", regex: /(ที่บ้าน.*ไม่มีอุปกรณ์|ไม่ใช้อุปกรณ์เลย|เล่นในห้อง.*ไม่อุปกรณ์|บอดี้เวตล้วน)/i },
  { intent: "plan_dumbbell", regex: /(ดัมเบลคู่เดียว|ดัมเบลที่บ้าน|ตารางสำหรับดัมเบล)/i },
  { intent: "plan_time_15", regex: /(15 นาที|ไม่ถึง 20 นาที|เวลาจำกัดมาก|เซสชันสั้น)/i },
  { intent: "plan_time_30", regex: /(30 นาที|ครึ่งชั่วโมง)/i },
  { intent: "plan_beginner", regex: /(มือใหม่.*โปรแกรม|เพิ่งเริ่ม.*ตาราง|เริ่มออกกำลังกายใหม่|เพิ่งหัดเล่น)/i },

  // 6. Strength & Hypertrophy
  { intent: "progressive_overload", regex: /(progressive overload|เพิ่มน้ำหนักเมื่อไหร่|พัฒนาต่อเนื่อง|โหลดเพิ่ม)/i },
  { intent: "hypertrophy_sets_reps", regex: /(สร้างกล้าม.*กี่ครั้ง|กี่เซต.*เพิ่มกล้าม|volume.*สร้างกล้าม)/i },
  { intent: "strength_sets_reps", regex: /(เพิ่มแรง.*กี่ครั้ง|กี่ rep.*เพิ่มแรง|เซต.*ครั้ง.*เพิ่มแรง)/i },
  { intent: "failure_training", regex: /(failure|ยกจนหมดแรง|ยกไม่ไหว|จนเฟล|เล่นจนหมด)/i },
  { intent: "rir_rpe", regex: /(rir คือ|rpe คือ|สอนวิธีใช้ rir|สอนวิธีใช้ rpe)/i },
  { intent: "rest_strength", regex: /(พักกี่นาที.*เพิ่มแรง|พักนานแค่ไหน.*ท่าหนัก|เซตหนักควรพัก)/i },
  { intent: "compound_vs_isolation", regex: /(compound กับ isolation|ท่าหลัก.*ท่าแยก)/i },
  { intent: "volume_frequency", regex: /(เล่นกี่ครั้งต่อสัปดาห์ต่อกล้าม|ฝึกอกกี่วัน|ความถี่ต่อกล้ามเนื้อ)/i },
  { intent: "deload", regex: /(deload|สัปดาห์ลดความหนัก|ดีโหลด)/i },
  { intent: "plateau_strength", regex: /(ยกน้ำหนักไม่ขึ้น|ตันที่น้ำหนักเดิม|แก้ plateau|น้ำหนักไม่ขยับ)/i },

  // 5. Cardio & Running
  { intent: "cardio_before_after_weights", regex: /(คาร์ดิโอก่อนหรือหลัง|วิ่งก่อนเล่นเวท|เวท.*คาร์ดิโอ.*อะไรก่อน)/i },
  { intent: "cardio_hiit", regex: /(hiit คือ|จัด hiit|ทำ hiit|ฮิต)/i },
  { intent: "cardio_zone2", regex: /(zone 2|โซน 2|โซนสอง)/i },
  { intent: "running_pace", regex: /(pace เท่าไหร่|เพซเท่าไหร่|ตั้ง pace|ความเร็ววิ่ง)/i },
  { intent: "running_interval", regex: /(interval run|จัด interval|วิ่งเร็วสลับ|อินเทอร์วัล)/i },
  { intent: "running_long_run", regex: /(long run|วิ่งยาว|ลองรัน)/i },
  { intent: "running_walk_run", regex: /(วิ่งสลับเดิน|run-walk|เดินสลับวิ่ง)/i },
  { intent: "cardio_frequency", regex: /(คาร์ดิโอกี่วัน|ความถี่.*cardio|คาร์ดิโอกี่ครั้ง)/i },
  { intent: "cardio_duration", regex: /(คาร์ดิโอนานกี่นาที|แต่ละครั้ง.*cardio.*นาที|วิ่งนานกี่นาที)/i },
  { intent: "running_5k_training", regex: /(ซ้อม 5k|แผนซ้อม 5k|ตารางซ้อม 5)/i },

  // 7. Warmup & Mobility
  { intent: "warmup_general", regex: /(วอร์มก่อน|warm-up|อบอุ่นร่างกาย|ต้องวอร์ม)/i },
  { intent: "warmup_running", regex: /(ก่อนวิ่งควรวอร์ม|วอร์มก่อนวิ่ง)/i },
  { intent: "warmup_legs", regex: /(ก่อนเล่นขาควรวอร์ม|วอร์มก่อน squat|วอร์มขา)/i },
  { intent: "warmup_upper_body", regex: /(ก่อนเล่นอกควรวอร์ม|วอร์มก่อนเล่นไหล่|วอร์มท่อนบน)/i },
  { intent: "dynamic_static_stretch", regex: /(ยืดก่อนหรือหลัง|dynamic กับ static|static stretch|ยืดเหยียด)/i },
  { intent: "mobility_general", regex: /(mobility คือ|ฝึก mobility|ความคล่องตัวข้อ)/i },
  { intent: "ankle_mobility", regex: /(ข้อเท้าตึง|ankle mobility|ข้อเท้ายึด|ยืดข้อเท้า)/i },
  { intent: "hip_mobility", regex: /(สะโพกตึง|hip mobility|ข้อสะโพก|ยืดสะโพก)/i },
  { intent: "shoulder_mobility", regex: /(ไหล่ตึง|shoulder mobility|ยืดไหล่)/i },
  { intent: "cooldown_general", regex: /(หลังออกกำลัง.*คูลดาวน์|cool-down|เสร็จแล้วต้องยืด|ผ่อนคลายกล้ามเนื้อ)/i },

  // 8. Recovery & Sleep
  { intent: "doms", regex: /(doms คือ|วันรุ่งขึ้นปวดกล้าม|ระบมกล้าม|ปวดเมื่อยวันต่อมา)/i },
  { intent: "recovery_rest_days", regex: /(ควรพักกี่วัน|วันพัก|rest day|พักอาทิตย์ละ)/i },
  { intent: "recovery_same_muscle", regex: /(เล่นกล้ามเดิมทุกวัน|กล้ามเนื้อควรพักกี่ชั่วโมง|เล่นอกซ้ำ)/i },
  { intent: "recovery_active", regex: /(active recovery|วันพักควรเดิน|พักแบบแอคทีฟ)/i },
  { intent: "sleep_duration", regex: /(ควรนอนกี่ชั่วโมง|นอนเท่าไหร่ถึงจะพอ|การนอน.*กล้าม)/i },
  { intent: "sleep_before_workout", regex: /(นอนน้อยควรออกกำลัง|นอนไม่พอ|อดนอน)/i },
  { intent: "fatigue_management", regex: /(ล้าสะสม|เหนื่อยมากควรฝึกต่อไหม|fatigue|เพลียสะสม)/i },
  { intent: "recovery_vs_pain", regex: /(แยกความล้ากับอาการเจ็บ|ปวดแบบไหนไม่ควรฝืน|ปวดเมื่อย.*เจ็บ)/i },
  { intent: "return_after_break", regex: /(หยุดไปนานแล้วกลับมา|หายไปจากยิมนาน|คัมแบ็ค)/i },
  { intent: "recovery_between_sessions", regex: /(ระหว่างวันควรฟื้นตัว|recovery routine|ฟื้นฟูหลังซ้อม)/i },

  // 9. Nutrition & Hydration
  { intent: "nutrition_pre_workout", regex: /(ก่อนออกกำลัง.*กิน|ก่อนเล่นเวทควรกิน|ก่อน workout|พรีเวิร์ก)/i },
  { intent: "nutrition_post_workout", regex: /(หลังออกกำลัง.*กิน|เล่นเวทเสร็จควรกิน|หลังวิ่งควรกิน|โพสต์เวิร์ก)/i },
  { intent: "protein", regex: /(โปรตีนวันละเท่าไหร่|กินโปรตีนเท่าไร|คำนวณโปรตีน|ต้องการโปรตีน)/i },
  { intent: "carbohydrate", regex: /(คาร์บเยอะไหม|คาร์โบไฮเดรต.*ออกกำลัง|กินคาร์บ|แป้ง.*กล้าม)/i },
  { intent: "hydration", regex: /(ดื่มน้ำเท่าไหร่|ดื่มน้ำยังไงตอนวิ่ง|วางแผนการดื่มน้ำ|จิบน้ำ)/i },
  { intent: "calories", regex: /(คำนวณแคลอรี|กินกี่แคล|calorie.*เพิ่มกล้าม|calorie.*ลดไขมัน|แคลอรี่ต่อวัน)/i },
  { intent: "supplement_protein", regex: /(whey protein จำเป็น|ไม่กินเวย์|กินเวย์ตอนไหน|เวย์จำเป็นไหม)/i },
  { intent: "creatine", regex: /(creatine คือ|ควรกิน creatine|ครีเอทีน|ประโยชน์ครีเอทีน)/i },
  { intent: "caffeine_preworkout", regex: /(กาแฟก่อนออกกำลัง|คาเฟอีนก่อน workout|ดื่มกาแฟก่อนวิ่ง)/i },
  { intent: "meal_plan", regex: /(meal plan|จัดมื้ออาหาร|อาหารเข้ากับตาราง)/i },

  // 11. Equipment
  { intent: "equipment_no_equipment", regex: /(ไม่มีอุปกรณ์เลย|ไม่ใช้อุปกรณ์|bodyweight|ไม่มีดัมเบล)/i },
  { intent: "equipment_dumbbell", regex: /(มีดัมเบล|ดัมเบลคู่เดียว|dumbbell|เล่นดัมเบล)/i },
  { intent: "equipment_resistance_band", regex: /(resistance band|ยางยืด|ยางแรงต้าน)/i },
  { intent: "equipment_barbell", regex: /(บาร์เบล|barbell|เล่นบาร์)/i },
  { intent: "equipment_machine", regex: /(เครื่องนี้เล่นกล้าม|เครื่องในยิม|machine|แมชชีน)/i },
  { intent: "equipment_substitute_home", regex: /(ไม่มีเครื่อง.*ใช้อะไรแทน|ท่าแทนเครื่อง|แทนแมชชีน)/i },
  { intent: "equipment_weight_selection", regex: /(เลือกดัมเบลกี่กิโล|เริ่มยกกี่กิโล|น้ำหนักที่เหมาะสม|ดัมเบลหนักเท่าไหร่)/i },
  { intent: "equipment_gym_beginner", regex: /(เข้ายิมครั้งแรก|มือใหม่เข้าฟิตเนส|เพิ่งเข้ายิม)/i },
  { intent: "equipment_room_space", regex: /(ห้องเล็ก|พื้นที่น้อย|อยู่หอพัก|พื้นที่จำกัด)/i },
  { intent: "equipment_adjustment", regex: /(ปรับเบาะ|ตั้งเครื่อง|ปรับเครื่อง)/i },

  // 13. Motivation
  { intent: "motivation_today", regex: /(ไม่อยากออกกำลังกายเลย|ขี้เกียจออกกำลัง|ไม่มีแรงจูงใจ|หมดไฟ)/i },
  { intent: "motivation_consistency", regex: /(ให้ออกกำลังกายสม่ำเสมอ|สร้างวินัย|ฝึกวินัย)/i },
  { intent: "motivation_missed_workout", regex: /(ไม่ได้ออกกำลังกายเมื่อวาน|พลาด workout|หลุดตาราง|เมื่อวานโดด)/i },
  { intent: "motivation_short_workout", regex: /(ไม่มีเวลาแต่อยากขยับ|เวลา 10 นาที|mini workout|เวิร์กเอาต์สั้น)/i },
  { intent: "motivation_encouragement", regex: /(ให้กำลังใจหน่อย|พูดให้ฮึด|trainer ให้กำลังใจ|ท้อจัง)/i },
  { intent: "motivation_plateau", regex: /(ฝึกแล้วไม่ก้าวหน้า|ผลไม่ไปไหนเลย|หมดกำลังใจ.*progress|น้ำหนักนิ่ง)/i },
  { intent: "motivation_habit", regex: /(สร้างนิสัยออกกำลัง|เวลาเดิมทุกวัน)/i },
  { intent: "motivation_checkin", regex: /(เช็กอินก่อน|daily check-in)/i },
  { intent: "motivation_goal_breakdown", regex: /(เป้าหมายใหญ่แบ่งเป็น|แบ่งเป้าหมายให้เล็กลง|milestone)/i },
  { intent: "motivation_reengage", regex: /(หายไปนานอยากกลับมา|ช่วยเริ่มใหม่)/i },

  // 3. Exercise Library general
  { intent: "exercise_explain", regex: /(ท่านี้ทำยังไง|อธิบายท่า|ขอวิธีทำท่า)/i },
  { intent: "exercise_target_muscle", regex: /(ใช้กล้ามเนื้อส่วนไหน|เน้นกล้ามตรงไหน|ทำงานกับส่วนไหน|โดนส่วนไหน)/i },
  { intent: "exercise_sets_reps", regex: /(ควรทำกี่เซต|ทำท่านี้กี่ครั้ง|เล่นกี่เซตต่อครั้ง|กี่เซตกี่ครั้ง)/i },
  { intent: "exercise_rest", regex: /(พักกี่วินาที|ระหว่างเซตควรพัก|พักกี่นาทีระหว่าง)/i },
  { intent: "exercise_substitute", regex: /(มีท่าอะไรแทน|ใช้อะไรแทนได้|หาท่าแทน|ท่าทดแทน)/i },
  { intent: "exercise_beginner_suitability", regex: /(เหมาะกับมือใหม่ไหม|มือใหม่ทำท่านี้ได้ไหม)/i },
  { intent: "exercise_home_variant", regex: /(ทำที่บ้านได้ไหม|เวอร์ชันไม่ใช้อุปกรณ์)/i },
  { intent: "exercise_compound_isolation", regex: /(compound หรือ isolation|ท่าหลักหรือท่าแยก)/i },
  { intent: "exercise_breathing", regex: /(หายใจตอนไหน|หายใจยังไงตอนยก|การหายใจสำหรับท่า)/i },
  { intent: "exercise_slow_tempo", regex: /(ช้าหรือเร็ว|tempo ของท่า|คุมจังหวะ)/i }
];

function matchCoachingIntent(message = "") {
  const text = String(message || "").trim();
  if (!text) return null;

  for (const rule of INTENT_RULES) {
    if (rule.regex.test(text)) {
      const info = intentMap.get(rule.intent);
      if (info) {
        return {
          intent: rule.intent,
          category: info.category,
          expected_response: info.expected_response,
          examples: info.examples
        };
      }
    }
  }

  return null;
}

function getCoachingPrinciplePrompt(intentObj) {
  if (!intentObj) return "";
  return `\n【แนวทางเฉพาะสำหรับเรื่องนี้ (${intentObj.category})】: ${intentObj.expected_response}\n(คำแนะนำจาก FitAI: มีอิสระเต็มที่ในการอธิบาย ยกตัวอย่าง ให้เหตุผล และใช้ภาษาไทยที่กระชับ อบอุ่น เป็นธรรมชาติ โดยยึดความถูกต้องตามหลักการข้างต้น)`;
}

// Rich, dynamic fallback generator for any of the 14 coaching categories
function generateIntentFallback(intentObj, message = "", context = {}) {
  const profile = context.profile || {};
  const weight = profile.weight || 70;
  const bmi = profile.bmi || null;
  const intent = intentObj?.intent || "";
  const category = intentObj?.category || "";

  // 1. Safety
  if (category === "safety") {
    if (intent === "safety_chest_pain") {
      return "⚠️ **ข้อควรระวังสำคัญมากครับ:** หากคุณมีอาการเจ็บหรือแน่นหน้าอก โดยเฉพาะถ้ามีอาการหายใจไม่ออก หน้ามืด หรือปวดร้าวไปที่แขน/กราม กรุณา**หยุดกิจกรรมทันที นั่งพักในที่ปลอดภัย และโทรขอความช่วยเหลือทางการแพทย์ฉุกเฉิน (1669)** ครับ สุขภาพและความปลอดภัยของหัวใจต้องมาก่อนเสมอครับ";
    }
    if (intent === "safety_dizziness") {
      return "⚠️ **คำแนะนำจาก FitAI:** หากรู้สึกมึนหัวหรือหน้ามืดระหว่างออกกำลังกาย ให้**หยุดพักทันทีและนั่งลงในที่อากาศถ่ายเทสะดวก** อย่าเพิ่งลุกขึ้นกะทันหันครับ ค่อยๆ จิบน้ำเปล่า เช็กว่าได้รับพลังงานหรือน้ำเพียงพอหรือไม่ หากอาการยังไม่ดีขึ้นหลังจากพัก 10-15 นาที ควรหยุดการฝึกของวันนี้เพื่อความปลอดภัยครับ";
    }
    if (intent === "safety_back_pain") {
      return "🛑 **การดูแลอาการเจ็บหลัง:** หากรู้สึกเจ็บหรือแปล๊บที่หลังระหว่างยกน้ำหนักหรือทำ Deadlift ให้**หยุดเซตนั้นทันทีครับ** อย่าฝืนยกต่อ! สาเหตุส่วนใหญ่มักเกิดจากหลังโก่ง (Back Rounding) หรือใช้น้ำหนักเกินที่แกนกลางลำตัวจะล็อกได้ แนะนำให้พัก ประคบเย็นหากมีอาการอักเสบเฉียบพลัน และเมื่อกลับมาฝึกให้ลดน้ำหนักลงเน้นล็อกสะบักและเกร็งหน้าท้องให้แน่นครับ (หากมีอาการชาร้าวลงขา ควรพบแพทย์ผู้เชี่ยวชาญครับ)";
    }
    if (intent === "safety_joint_pain") {
      return "🛑 **การดูแลอาการเจ็บข้อต่อ/เข่า:** หากทำท่า Squat หรือกระโดดแล้วรู้สึกเจ็บข้อเข่า ให้**หยุดท่าดังกล่าวทันที**และสลับไปทำท่าที่มีแรงกระแทกต่ำ เช่น Glute Bridge หรือ Wall Sit ในมุมที่ไม่เจ็บครับ ตรวจสอบว่าเข่าไม่ได้หุบเข้าด้านใน (Knee Valgus) และปลายเท้าเปิดตามแนวข้อต่อเสมอครับ";
    }
    return `FitAI ให้ความสำคัญกับความปลอดภัยของคุณเป็นอันดับหนึ่งครับ: ${intentObj.expected_response} อย่าฝืนร่างกายหากมีสัญญาณเตือนหรืออาการเจ็บแปล๊บครับ`;
  }

  // 2. Nutrition
  if (category === "nutrition_hydration") {
    if (intent === "protein") {
      const minPro = Math.round(weight * 1.4);
      const maxPro = Math.round(weight * 2.0);
      return `สำหรับการออกกำลังกายและสร้างความแข็งแรง FitAI แนะนำปริมาณโปรตีนที่เหมาะสมอยู่ที่ **1.4 - 2.0 กรัม ต่อน้ำหนักตัว 1 กิโลกรัม** ครับ\n\n💡 สำหรับน้ำหนักของคุณ (${weight} kg):\n• ปริมาณที่แนะนำต่อวัน: **${minPro} - ${maxPro} กรัม/วัน**\n• แหล่งโปรตีนแนะนำ: อกไก่ (~31g/100g), ไข่ไก่ (ฟองละ ~6-7g), เนื้อปลา, เต้าหู้ขาว, และนมโปรตีนสูงหรือเวย์ครับ`;
    }
    if (intent === "nutrition_pre_workout") {
      return "🍌 **มื้อก่อนออกกำลังกาย (Pre-Workout):**\n• **ช่วงเวลา 1-2 ชั่วโมงก่อนฝึก:** ควรทานคาร์โบไฮเดรตย่อยง่ายร่วมกับโปรตีนเล็กน้อย เช่น ขนมปังโฮลวีท 1-2 แผ่นกับไข่ต้ม หรือกล้วยหอม 1 ลูกกับนมถั่วเหลือง/นมสด\n• **จุดประสงค์:** เพื่อเติมไกลโคเจนให้กล้ามเนื้อมีแรงฝึกเต็มที่โดยไม่จุกหรือแน่นท้องครับ";
    }
    if (intent === "nutrition_post_workout") {
      return "🍗 **มื้อหลังออกกำลังกาย (Post-Workout):**\n• ควรทานภายใน 1-2 ชั่วโมงหลังฝึก เน้น **โปรตีนคุณภาพสูง (~25-35g)** เพื่อซ่อมแซมและเสริมสร้างเส้นใยกล้ามเนื้อ ร่วมกับ **คาร์โบไฮเดรต** เพื่อฟื้นฟูระดับพลังงาน\n• ตัวอย่าง: อกไก่ย่างกับข้าวกล้อง, สเต็กปลากับมันหวานนึ่ง หรือสมูทตี้เวย์โปรตีนผสมข้าวโอ๊ตครับ";
    }
    if (intent === "creatine") {
      return "⚡ **Creatine (ครีเอทีน) คืออะไร & ช่วยอะไร?**\n• ครีเอทีนช่วยเพิ่มการสะสมสารพลังงาน ATP ในเซลล์กล้ามเนื้อ ทำให้คุณสามารถยกน้ำหนักได้หนักขึ้นและเพิ่มจำนวนครั้งในเซตได้ดีขึ้น\n• **วิธีทานทั่วไป:** วันละ 3-5 กรัม สม่ำเสมอทุกวันเวลาใดก็ได้ ดื่มน้ำตามให้เพียงพอ\n• *ข้อควรระวัง:* หากมีปัญหาเรื่องโรคไต ควรปรึกษาแพทย์ก่อนเริ่มทานครับ";
    }
  }

  // 3. Goals & Workout Plan
  if (category === "goals" || category === "workout_plan") {
    if (intent === "plan_full_body") {
      return "🏋️ **โปรแกรม Full Body Workout (เล่นครบทุกส่วนใน 1 วัน):**\n\n1. **ขา & ก้น:** Squat หรือ Chair Squat (3 เซ็ต · 10-12 ครั้ง)\n2. **อก & ไหล่ด้านหน้า:** Push-up หรือ Wall Push-up (3 เซ็ต · 8-10 ครั้ง)\n3. **หลัง & สะบัก:** Doorframe Row หรือ Dumbbell Row (3 เซ็ต · 10-12 ครั้ง)\n4. **แกนกลางลำตัว (Core):** Plank (3 เซ็ต · เซ็ตละ 20-30 วินาที)\n\n💡 *ข้อดี:* กระตุ้นการเผาผลาญได้ดี เหมาะสำหรับฝึก 2-3 วันต่อสัปดาห์โดยมีวันพักคั่นระหว่างวันครับ";
    }
    if (intent === "plan_beginner") {
      return "🌟 **ยินดีต้อนรับสู่ก้าวแรกของการฟิตหุ่นครับ!**\nสำหรับมือใหม่ สิ่งสำคัญที่สุดไม่ใช่การฝึกหนัก แต่คือ **'ความสม่ำเสมอและฟอร์มท่าที่ปลอดภัย'** ครับ\n\n• **ความถี่แนะนำ:** สัปดาห์ละ 3 วัน (เช่น จันทร์-พุธ-ศุกร์) วันละ 25-30 นาที\n• **ท่าพื้นฐาน:** เริ่มจาก Bodyweight Squat, Wall Push-up, Glute Bridge และ Bird Dog\n• ค่อยๆ ฝึกฟอร์มให้คุ้นเคย ไม่ต้องรีบใส่น้ำหนักเยอะ แล้วคุณจะเห็นพัฒนาการที่ดีขึ้นเรื่อยๆ ครับ!";
    }
  }

  // 4. Strength & Hypertrophy
  if (category === "strength_hypertrophy") {
    if (intent === "progressive_overload") {
      return "📈 **Progressive Overload คือหัวใจของการพัฒนากล้ามเนื้อและความแข็งแรงครับ!**\nหมายถึงการค่อยๆ เพิ่มความท้าทายให้กล้ามเนื้อทีละระดับเมื่อร่างกายเริ่มปรับตัวได้ โดยทำได้หลายวิธี:\n1. **เพิ่มน้ำหนัก:** เมื่อยกน้ำหนักเดิมครบเซตด้วยฟอร์มสวยๆ ให้เพิ่มน้ำหนักขึ้น 2.5 - 5%\n2. **เพิ่มจำนวนครั้ง (Reps):** จากเดิมทำได้ 8 ครั้ง พัฒนาเป็น 10-12 ครั้ง\n3. **เพิ่มคุณภาพฟอร์ม & Tempo:** ควบคุมจังหวะผ่อนน้ำหนักลงช้าๆ 2-3 วินาที\n4. **ลดเวลาพักระหว่างเซต:** เพื่อเพิ่มความเข้มข้นของการฝึกครับ";
    }
    if (intent === "rir_rpe") {
      return "🎯 **RIR (Reps in Reserve) & RPE คืออะไร?**\n• **RIR:** คือจำนวนครั้งที่คิดว่ายังยกต่อไหวแต่หยุดก่อน เช่น RIR 2 หมายถึงเหลือแรงยกได้อีกแค่ 2 ครั้งก็จะไม่ไหวแล้ว\n• **RPE:** สเกลวัดความเหนื่อย 1-10 (RPE 8 เทียบเท่า RIR 2)\n💡 *คำแนะนำของ FitAI:* สำหรับการสร้างกล้ามเนื้อ ไม่จำเป็นต้องเล่นจนหมดแรงทุกเซต (Failure) แนะนำให้คุมอยู่ที่ **RIR 1-2** จะช่วยสร้างกล้ามเนื้อได้ดีและไม่เสี่ยงต่อการบาดเจ็บครับ";
    }
  }

  // 5. Recovery & Sleep
  if (category === "recovery_sleep") {
    if (intent === "doms") {
      return "💪 **DOMS (Delayed Onset Muscle Soreness):**\nคืออาการปวดเมื่อยระบมกล้ามเนื้อที่มักจะเกิดขึ้นหลังออกกำลังกายไปแล้ว 24-48 ชั่วโมง เป็นกลไกปกติที่ร่างกายกำลังซ่อมแซมเส้นใยกล้ามเนื้อขนาดเล็กให้แข็งแรงขึ้นครับ\n\n💡 **วิธีบรรเทา:**\n• ทำ Active Recovery เช่น เดินเบาๆ หรือยืดเหยียดเบาๆ เพื่อกระตุ้นการไหลเวียนโลหิต\n• ดื่มน้ำให้เพียงพอและทานโปรตีนคุณภาพสูง\n• นอนหลับพักผ่อน 7-8 ชั่วโมง อาการจะค่อยๆ ดีขึ้นเองใน 2-3 วันครับ";
    }
    if (intent === "sleep_before_workout") {
      return "😴 **ถ้านอนน้อยหรือพักผ่อนไม่พอ:**\n• หากนอนน้อยกว่า 5-6 ชั่วโมงและรู้สึกเพลียสะสม FitAI แนะนำให้**ปรับลดความหนักของการฝึก (Deload)** หรือเปลี่ยนเป็นคาร์ดิโอเบาๆ เดินเร็ว หรือยืดเหยียดร่างกายแทนครับ\n• การฝืนยกเวทหนักในวันที่นอนไม่พอจะทำให้การควบคุมกล้ามเนื้อลดลง เสี่ยงต่อการบาดเจ็บ และร่างกายสังเคราะห์กล้ามเนื้อได้ไม่เต็มที่ครับ";
    }
  }

  // Default intelligent fallback based on intent expected response
  return `สวัสดีครับ FitAI ยินดีดูแลคุณครับ! 🏋️‍♂️✨\n\n💡 **คำแนะนำสำหรับเรื่องนี้:**\n${intentObj.expected_response}\n\nหากคุณต้องการให้ FitAI จัดตารางอย่างละเอียด หรือปรับเข้ากับเป้าหมายเฉพาะส่วน บอกรายละเอียดเพิ่มเติมได้เลยนะครับ!`;
}

module.exports = {
  matchCoachingIntent,
  getCoachingPrinciplePrompt,
  generateIntentFallback,
  dataset,
  intentMap
};
