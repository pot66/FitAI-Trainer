const prisma = require('E:/FitAI Trainer/backend/src/services/prisma');

// Rule definitions for behavioral extraction
const GOAL_RULES = [
  { key: 'fat_loss', label: 'ลดไขมัน / ลดพุง / ลดน้ำหนัก', regex: /(ลดไขมัน|ลดพุง|ลดน้ำหนัก|อยากผอม|เบิร์น|รีดไขมัน|ลดสัดส่วน)/i },
  { key: 'muscle_gain', label: 'สร้างกล้ามเนื้อ / เพิ่มขนาดตัว (Bulk)', regex: /(สร้างกล้าม|เพิ่มกล้าม|bulk|อยากตัวใหญ่|กล้ามโต|hypertrophy)/i },
  { key: 'tone_firm', label: 'กระชับสัดส่วน / ลีน', regex: /(กระชับ|ลีน|เฟิร์ม|กระชับสัดส่วน|อยากเฟิร์ม)/i },
  { key: 'running_endurance', label: 'วิ่ง / เพิ่มความอึด (Cardio Endurance)', regex: /(วิ่ง|มาราธอน|5k|10k|ความอึด|ซ้อมวิ่ง|อยากอึด)/i },
  { key: 'posture_health', label: 'ปรับบุคลิกภาพ / แก้หลังค่อม', regex: /(หลังค่อม|ไหล่ห่อ|ปรับบุคลิก|ยืนตัวตรง)/i }
];

const BODY_FOCUS_RULES = [
  { key: 'upper_body', label: 'ช่วงบน (Upper Body)', regex: /(ช่วงบน|ท่อนบน|upper|เน้นช่วงบน)/i },
  { key: 'lower_body', label: 'ช่วงล่าง (Lower Body)', regex: /(ช่วงล่าง|ท่อนล่าง|lower|เน้นช่วงล่าง)/i },
  { key: 'arms', label: 'กล้ามแขน (หน้าแขน & หลังแขน)', regex: /(เล่นแขน|เน้นแขน|bicep|tricep|หน้าแขน|หลังแขน|แขนใหญ่)/i },
  { key: 'chest', label: 'หน้าอก (Chest)', regex: /(เล่นอก|เน้นอก|chest|อกใหญ่|หน้าอก)/i },
  { key: 'back', label: 'แผ่นหลัง / ปีก (Back & Lats)', regex: /(เล่นหลัง|เน้นหลัง|ปีก|lat|สะบัก)/i },
  { key: 'shoulders', label: 'หัวไหล่ (Shoulders)', regex: /(เล่นไหล่|เน้นไหล่|หัวไหล่|shoulder|ไหล่กว้าง)/i },
  { key: 'core_abs', label: 'หน้าท้อง / ซิกแพค (Core & Abs)', regex: /(ท้อง|หน้าท้อง|ซิกแพค|พุง|abs|core|แพลงก์|ลดพุง)/i },
  { key: 'legs_glutes', label: 'ต้นขา / สะโพก / ก้น (Legs & Glutes)', regex: /(ขา|ต้นขา|ก้น|สะโพก|glute|squat|ขาเรียว)/i }
];

const CONSTRAINT_RULES = [
  { key: 'condo_quiet', label: 'ฝึกซ้อมที่คอนโด/หอพัก ต้องการท่าเงียบไร้เสียงกระโดด', regex: /(คอนโด|หอพัก|ห้องพัก|เสียงดัง|ข้างห้อง|ไม่กระโดด|ไร้เสียง)/i },
  { key: 'home_dumbbell', label: 'ออกกำลังกายที่บ้าน มีดัมเบลคู่เดียว', regex: /(มีดัมเบลคู่เดียว|ดัมเบล 1 คู่|ดัมเบลที่บ้าน|เล่นที่บ้านมีดัมเบล)/i },
  { key: 'no_equipment', label: 'ไม่มีอุปกรณ์ (บอดี้เวทล้วน)', regex: /(ไม่มีอุปกรณ์|ไม่ใช้อุปกรณ์|บอดี้เวท|ไม่มีดัมเบล)/i },
  { key: 'limited_time', label: 'มีเวลาจำกัด (15-30 นาทีต่อวัน)', regex: /(เวลาน้อย|ไม่มีเวลา|เวลาจำกัด|15 นาที|20 นาที|30 นาที|รีบเล่น)/i },
  { key: 'low_budget', label: 'งบประมาณจำกัด (≤ 150 บาทต่อวัน)', regex: /(งบน้อย|งบจำกัด|150 บาท|100 บาท|ประหยัด|เบี้ยน้อย)/i },
  { key: 'gym_training', label: 'เข้าฟิตเนส / เล่นในยิม', regex: /(เข้ายิม|ไปยิม|เครื่องเล่นในยิม|ฟิตเนส)/i }
];

const INJURY_RULES = [
  { key: 'knee_pain', label: 'มีอาการเจ็บหรือตึงข้อเข่า (เลี่ยงแรงกระแทกเข่า)', regex: /(เจ็บเข่า|ปวดเข่า|เข่าลั่น|ข้อเข่า|squat.*เจ็บเข่า)/i },
  { key: 'back_pain', label: 'มีอาการปวดหลัง / หลังล่าง (เลี่ยงการโก่งหลัง)', regex: /(เจ็บหลัง|ปวดหลัง|หลังยอก|หลังเดี้ยง|หลังตึง)/i },
  { key: 'shoulder_pain', label: 'มีอาการเจ็บหรือตึงหัวไหล่', regex: /(เจ็บไหล่|ปวดไหล่|ไหล่ติด|ยกแขนแล้วเจ็บ)/i },
  { key: 'office_syndrome', label: 'ออฟฟิศซินโดรม (ปวดตึงคอบ่าไหล่จากการนั่งนาน)', regex: /(ออฟฟิศซินโดรม|ปวดคอ|ปวดบ่า|นั่งโต๊ะทั้งวัน)/i }
];

const DIET_RULES = [
  { key: 'seven_eleven', label: 'ชอบทานหรือเลือกซื้อของกินโปรตีนสูงจาก 7-Eleven', regex: /(เซเว่น|7-eleven|7-11|สะดวกซื้อ)/i },
  { key: 'boiled_egg_hack', label: 'สนใจเปลี่ยนไข่ดาวเป็นไข่ต้มเพื่อลดแคลอรี่', regex: /(ไข่ต้ม.*ไข่ดาว|ไข่ดาว.*ไข่ต้ม)/i },
  { key: 'a_la_carte_clean', label: 'ชอบสั่งอาหารตามสั่งแบบผัดน้ำ/น้ำมันน้อย', regex: /(ตามสั่ง|ผัดน้ำ|ไม่ชูรส)/i },
  { key: 'tired_chicken_breast', label: 'เบื่ออกไก่ ต้องการเมนูสุขภาพทางเลือกใหม่ๆ', regex: /(เบื่ออกไก่|กินอย่างอื่นแทนอกไก่|เมนูอื่น)/i }
];

// Simple in-memory memory cache with 3-minute TTL
const memoryCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

/**
 * Extracts insights and preferences from a user's historical chat messages
 * @param {number} userId - The ID of the user
 * @param {boolean} forceRefresh - If true, bypass memory cache
 */
async function getUserLearnedContext(userId, forceRefresh = false) {
  if (!userId) return null;

  const now = Date.now();
  if (!forceRefresh && memoryCache.has(userId)) {
    const cached = memoryCache.get(userId);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    // 1. Fetch recent messages across all sessions of this user
    const userMessages = await prisma.chatMessage.findMany({
      where: {
        session: { userId: Number(userId) },
        role: 'user'
      },
      orderBy: { createdAt: 'desc' },
      take: 40
    });

    if (!userMessages.length) {
      return null;
    }

    // Combine recent message texts
    const combinedText = userMessages.map(m => m.content).join(' \n ');

    // 2. Detect Goals
    const detectedGoals = [];
    for (const rule of GOAL_RULES) {
      if (rule.regex.test(combinedText)) {
        detectedGoals.push(rule.label);
      }
    }

    // 3. Detect Body Focus
    const detectedFocus = [];
    for (const rule of BODY_FOCUS_RULES) {
      if (rule.regex.test(combinedText)) {
        detectedFocus.push(rule.label);
      }
    }

    // 4. Detect Constraints & Equipment
    const detectedConstraints = [];
    for (const rule of CONSTRAINT_RULES) {
      if (rule.regex.test(combinedText)) {
        detectedConstraints.push(rule.label);
      }
    }

    // 5. Detect Injuries & Sensitivities
    const detectedInjuries = [];
    for (const rule of INJURY_RULES) {
      if (rule.regex.test(combinedText)) {
        detectedInjuries.push(rule.label);
      }
    }

    // 6. Detect Dietary Habits
    const detectedDiet = [];
    for (const rule of DIET_RULES) {
      if (rule.regex.test(combinedText)) {
        detectedDiet.push(rule.label);
      }
    }

    // 7. Recent Topics Summary (Last 3 user inquiries)
    const recentQueries = userMessages.slice(0, 3).map(m => `"${m.content.trim()}"`);

    // 8. Build Natural Language Prompt Directive
    const promptLines = [
      '【ข้อมูลความต้องการเฉพาะบุคคลที่ AI เรียนรู้จากประวัติการแชท (Learned User Preferences)】:'
    ];

    if (detectedGoals.length) {
      promptLines.push(`• เป้าหมายที่สังเกตได้: ${detectedGoals.join(', ')}`);
    }
    if (detectedFocus.length) {
      promptLines.push(`• ส่วนร่างกายที่ผู้ใช้เน้นบ่อย: ${detectedFocus.join(', ')}`);
    }
    if (detectedConstraints.length) {
      promptLines.push(`• ข้อจำกัด/อุปกรณ์ที่บ้าน: ${detectedConstraints.join(', ')}`);
    }
    if (detectedInjuries.length) {
      promptLines.push(`• จุดที่ต้องระวัง/อาการเจ็บ: ${detectedInjuries.join(', ')} (กรุณาจัดท่าที่เซฟต่อจุดเหล่านี้เสมอ)`);
    }
    if (detectedDiet.length) {
      promptLines.push(`• พฤติกรรมอาหาร/โภชนาการ: ${detectedDiet.join(', ')}`);
    }
    if (recentQueries.length) {
      promptLines.push(`• คำถามล่าสุดที่ผู้ใช้เคยถาม: ${recentQueries.join(' -> ')}`);
    }

    promptLines.push(
      '💡 คำแนะนำสำหรับโค้ช FitAI: นำข้อมูลความชอบและข้อจำกัดในอดีตนี้มาต่อยอดตอบคำถามอย่างต่อเนื่อง ให้ผู้ใช้รู้สึกว่าคุณจดจำและเข้าใจความต้องการของเขาอย่างแท้จริง'
    );

    const directiveText = promptLines.join('\n');

    // Build concise note for local fallback
    const summaryParts = [];
    if (detectedFocus.length) summaryParts.push(`เน้น${detectedFocus[0]}`);
    if (detectedConstraints.length) summaryParts.push(detectedConstraints[0]);
    if (detectedGoals.length) summaryParts.push(detectedGoals[0]);

    const result = {
      userId,
      messageCount: userMessages.length,
      goals: detectedGoals,
      focusAreas: detectedFocus,
      constraints: detectedConstraints,
      injuries: detectedInjuries,
      dietHabits: detectedDiet,
      recentQueries,
      promptDirective: directiveText,
      briefSummary: summaryParts.length ? `(จากประวัติที่คุณ${summaryParts.join(' และ ')})` : ''
    };

    // Cache the result
    memoryCache.set(userId, { timestamp: now, data: result });
    return result;

  } catch (error) {
    console.warn(`User learning error for user ${userId}:`, error.message);
    return null;
  }
}

/**
 * Invalidate cached user memory when new message is sent
 */
function invalidateUserMemory(userId) {
  if (userId) {
    memoryCache.delete(userId);
  }
}

module.exports = {
  getUserLearnedContext,
  invalidateUserMemory
};
