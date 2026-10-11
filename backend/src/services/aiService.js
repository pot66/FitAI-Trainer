const {
  findFoodEntry,
  findSimilarFoodEntries,
  getNutrition,
  loadDatabase,
} = require("./nutritionService");
const { matchCoachingIntent, generateIntentFallback } = require("./coachKnowledgeService");
const { getUserLearnedContext } = require("./userLearningService");
const { shouldSearchGoogle, searchGoogle, formatSearchResultsForFallback } = require("./googleSearchService");
function getBMIAdvice(profile) {
    if (!profile || !profile.bmi) {
        return "";
    }

    const bmi = Number(profile.bmi);

    if (bmi < 18.5) {
        return (
            "จากข้อมูล BMI ของคุณอยู่ในช่วงน้ำหนักน้อย " +
            "ควรเน้นการออกกำลังกายแบบสร้างกล้ามเนื้อ " +
            "ร่วมกับการรับประทานอาหารให้เพียงพอ"
        );
    }

    if (bmi < 25) {
        return (
            "จากข้อมูล BMI ของคุณอยู่ในช่วงปกติ " +
            "สามารถออกกำลังกายได้หลากหลายรูปแบบ " +
            "และควรเน้นการออกกำลังกายอย่างสม่ำเสมอ"
        );
    }

    if (bmi < 30) {
        return (
            "จากข้อมูล BMI ของคุณอยู่ในช่วงน้ำหนักเกิน " +
            "ควรเน้นการออกกำลังกายแบบ Cardio " +
            "ร่วมกับการฝึกกล้ามเนื้ออย่างเหมาะสม"
        );
    }

    return (
        "จากข้อมูล BMI ของคุณอยู่ในช่วงโรคอ้วน " +
        "ควรเริ่มจากการออกกำลังกายที่แรงกระแทกต่ำ " +
        "เช่น เดินเร็ว ปั่นจักรยาน หรือว่ายน้ำ"
    );
}

function getWorkoutAdvice(message) {
    const text = message.toLowerCase();

    // Lower body (ช่วงล่าง / ขา / ก้น / สะโพก)
    if (
        text.includes("ช่วงล่าง") ||
        text.includes("ขา") ||
        text.includes("ก้น") ||
        text.includes("สะโพก") ||
        text.includes("lower")
    ) {
        return (
            "ท่าออกกำลังกายที่เหมาะสมสำหรับการออกกำลังกายช่วงล่าง (Lower Body) มีดังนี้ครับ:\n\n" +
            "- Squat (3 เซ็ต, 10-12 ครั้ง)\n" +
            "- Lunges (3 เซ็ต, 10-12 ครั้ง)\n" +
            "- Glute Bridge (3 เซ็ต, 12-15 ครั้ง)\n" +
            "- Bulgarian Split Squat (3 เซ็ต, 8-10 ครั้ง)\n" +
            "- Calf Raise (3 เซ็ต, 15 ครั้ง)\n\n" +
            "ท่าทั้งหมดนี้เหมาะกับช่วงล่างและจะช่วยฝึกความแข็งแรงของกล้ามเนื้อต้นขาและสะโพกครับ"
        );
    }

    // Upper body (ช่วงบน / อก / แขน / หลัง)
    if (
        text.includes("ช่วงบน") ||
        text.includes("อก") ||
        text.includes("หลัง") ||
        text.includes("แขน") ||
        text.includes("upper")
    ) {
        return (
            "ท่าออกกำลังกายที่เหมาะสมสำหรับการออกกำลังกายช่วงบน (Upper Body) มีดังนี้ครับ:\n\n" +
            "- Push-up (3 เซ็ต, 8-10 ครั้ง)\n" +
            "- Decline Push-up (3 เซ็ต, 8-10 ครั้ง)\n" +
            "- Wall Push Up (3 เซ็ต, 10-12 ครั้ง)\n" +
            "- Bodyweight Row (3 เซ็ต, 10-12 ครั้ง)\n" +
            "- Superman (3 เซ็ต, 10-12 ครั้ง)\n\n" +
            "ท่าทั้งหมดนี้ช่วยเสริมสร้างกล้ามเนื้อหน้าอก หลัง ไหล่ และแขนอย่างมีประสิทธิภาพครับ"
        );
    }

    // Core / Abs (แกนกลางลำตัว / หน้าท้อง)
    if (
        text.includes("แกนกลาง") ||
        text.includes("หน้าท้อง") ||
        text.includes("พุง") ||
        text.includes("core") ||
        text.includes("abs")
    ) {
        return (
            "ท่าออกกำลังกายที่เหมาะสมสำหรับแกนกลางลำตัวและหน้าท้อง (Core & Abs) มีดังนี้ครับ:\n\n" +
            "- Plank (3 เซ็ต, 20-30 วินาที)\n" +
            "- Crunch (3 เซ็ต, 12-15 ครั้ง)\n" +
            "- Bicycle Crunch (3 เซ็ต, 10-12 ครั้ง)\n" +
            "- Russian Twist (3 เซ็ต, 12-15 ครั้ง)\n" +
            "- Dead Bug (3 เซ็ต, 10-12 ครั้ง)\n\n" +
            "เน้นการเกร็งหน้าท้องและควบคุมการเคลื่อนไหวอย่างสม่ำเสมอครับ"
        );
    }

    // Cardio (คาร์ดิโอ / ลดน้ำหนัก / เบิร์น)
    if (
        text.includes("คาร์ดิโอ") ||
        text.includes("cardio") ||
        text.includes("ลดน้ำหนัก") ||
        text.includes("ลดไขมัน") ||
        text.includes("เบิร์น")
    ) {
        return (
            "ท่าออกกำลังกายแบบคาร์ดิโอ (Cardio) เพื่อเผาผลาญไขมันและเสริมความแข็งแรงของหัวใจ:\n\n" +
            "- Jumping Jack (3 เซ็ต, 30 วินาที)\n" +
            "- Burpee (3 เซ็ต, 8-10 ครั้ง)\n" +
            "- High Knees (3 เซ็ต, 20-30 วินาที)\n" +
            "- March In Place (3 เซ็ต, 45 วินาที)\n" +
            "- Skater (3 เซ็ต, 20-30 วินาที)\n\n" +
            "อย่าลืมจิบน้ำและพักระหว่างเซ็ตตามความเหมาะสมครับ"
        );
    }

    if (
        text.includes("squat") ||
        text.includes("สควอต")
    ) {
        return (
            "สำหรับ Squat ให้ยืนเท้ากว้างประมาณหัวไหล่ " +
            "รักษาหลังให้ตรง งอเข่าและสะโพกลงอย่างควบคุม " +
            "จากนั้นดันตัวกลับขึ้นอย่างช้า ๆ ครับ\n\n" +
            "- Squat (3 เซ็ต, 10-12 ครั้ง)"
        );
    }

    if (
        text.includes("push") ||
        text.includes("วิดพื้น") ||
        text.includes("push-up")
    ) {
        return (
            "สำหรับ Push-up ให้ลำตัวเป็นแนวตรง " +
            "เกร็งหน้าท้อง ลดตัวลงอย่างควบคุม " +
            "แล้วดันตัวกลับขึ้นครับ\n\n" +
            "- Push-up (3 เซ็ต, 8-10 ครั้ง)"
        );
    }

    if (
        text.includes("plank") ||
        text.includes("แพลงก์")
    ) {
        return (
            "สำหรับ Plank ให้รักษาลำตัวเป็นเส้นตรง " +
            "เกร็งหน้าท้องและหลีกเลี่ยงการปล่อยสะโพกตกครับ\n\n" +
            "- Plank (3 เซ็ต, 20-30 วินาที)"
        );
    }

    if (
        text.includes("ออกกำลังกาย") ||
        text.includes("workout") ||
        text.includes("วันนี้")
    ) {
        return (
            "คุณสามารถเริ่มออกกำลังกายตามแผนแนะนำดังนี้ครับ:\n\n" +
            "- Squat (3 เซ็ต, 10-12 ครั้ง)\n" +
            "- Push-up (3 เซ็ต, 8-10 ครั้ง)\n" +
            "- Plank (3 เซ็ต, 20-30 วินาที)\n" +
            "- Glute Bridge (3 เซ็ต, 12-15 ครั้ง)"
        );
    }

    return null;
}

// ==========================================
// Healthy Fitness Menu Bank for Fallback
// ==========================================
const HEALTHY_MENU_BANK = [
  { name: "อกไก่ย่างสมุนไพร + ฟักทองญี่ปุ่นนึ่ง", cal: 290, pro: 35, carb: 25, fat: 4, note: "โปรตีนสูง ไขมันต่ำมาก ฟักทองให้คาร์โบไฮเดรตเชิงซ้อนช่วยให้อิ่มนาน" },
  { name: "ปลากะพงนึ่งซีอิ๊วหรือนึ่งมะนาว + ผักกาดขาวลวก", cal: 240, pro: 32, carb: 8, fat: 5, note: "ย่อยง่าย เนื้อปลาอุดมด้วยกรดอะมิโนจำเป็นและโอเมก้า 3" },
  { name: "ยำไข่ต้มยางมะตูม + กุ้งลวกและเห็ดขาว", cal: 260, pro: 26, carb: 14, fat: 10, note: "ไขมันดีจากไข่แดง โปรตีนเน้นๆ รสชาติจัดจ้านสดชื่นไม่เลี่ยน" },
  { name: "ลาบอกไก่สับคั่วแห้งไร้น้ำมัน + แตงกวาและผักเคียง", cal: 220, pro: 34, carb: 10, fat: 3, note: "แคลอรี่ต่ำมาก อิ่มแน่น เหมาะสำหรับทั้งช่วงลดไขมันและสร้างกล้ามเนื้อ" },
  { name: "สเต็กปลาแซลมอนย่างเกลือพริกไทย + บรอกโคลี", cal: 380, pro: 34, carb: 12, fat: 18, note: "ไขมันดีสูง (Healthy Omega-3) ช่วยลดการอักเสบของกล้ามเนื้อหลังฝึก" },
  { name: "เต้าหู้ขาวคั่วพริกเกลือ + ไข่ขยี้ผัดน้ำ", cal: 250, pro: 22, carb: 12, fat: 11, note: "โปรตีนจากพืชและไข่ เหมาะสำหรับมื้อเบาๆ สบายท้อง" },
  { name: "ต้มยำกุ้งน้ำใสใส่เห็ดฟาง + ข้าวกล้อง 1 ทัพพี", cal: 280, pro: 24, carb: 35, fat: 3, note: "สมุนไพรไทยช่วยกระตุ้นระบบเผาผลาญ ไขมันต่ำมาก" },
  { name: "ข้าวกล้องผัดกะเพราอกไก่ (ผัดน้ำไร้น้ำมัน) + ไข่ดาวน้ำ", cal: 420, pro: 38, carb: 48, fat: 6, note: "เมนูโปรดของสายฟิต ให้พลังงานครบถ้วนสำหรับวันซ้อมหนัก" },
  { name: "สมูทตี้ข้าวโอ๊ตกล้วยหอมผสมเวย์หรือนมโปรตีนสูง", cal: 290, pro: 28, carb: 36, fat: 4, note: "สะดวก ดื่มง่าย เหมาะเป็นมื้อก่อนหรือหลังออกกำลังกายเพื่อฟื้นฟูกล้ามเนื้อ" },
  { name: "แกงจืดเต้าหู้หมูสับไร้มันใส่สาหร่ายวากาเมะ", cal: 190, pro: 22, carb: 10, fat: 6, note: "คล่องคอ แคลอรี่ต่ำ อุดมด้วยแร่ธาตุและไอโอดีน" }
];

function getRandomMenus(count = 3) {
  const shuffled = [...HEALTHY_MENU_BANK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}


function getExerciseTechniqueAdvice(lowerText) {
  // 1. Squat Depth & Form
  if (/(ย่อลึก|สควอทยังไง|สควอทอย่างไร|ฟอร์ม.*squat|squat.*ยังไง|squat.*ฟอร์ม|ลึกแค่ไหน|ย่อเท่าไหร่|ท่า.*squat)/i.test(lowerText)) {
    return [
      "เทคนิคและฟอร์มการทำ Squat ที่ถูกต้องและปลอดภัย:",
      "",
      "1. ความลึก (Depth): ควรย่อตัวลงมาจนกระทั่งต้นขาขนานกับพื้น (ทำมุมประมาณ 90 องศา) หรือลึกเท่าที่หลังยังตรงและส้นเท้าไม่ลอย ไม่จำเป็นต้องย่อจนก้นติดพื้นหากกล้ามเนื้อยังไม่ยืดหยุ่นพอ",
      "2. แนวกระดูกสันหลัง: ลำตัวตั้งตรง อกผาย เกร็งแกนกลางลำตัวตลอดเวลา ป้องกันหลังงอหรือแอ่นเกินไป",
      "3. แนวหัวเข่า: ให้หัวเข่าชี้ไปในทิศทางเดียวกับปลายเท้าเสมอ กางขาประมาณความกว้างหัวไหล่ และไม่ให้เข่าหุบเข้าด้านใน",
      "4. จังหวะการหายใจ: สูดลมหายใจเข้าขณะย่อตัวลง และพ่นลมหายใจออกขณะดันตัวขึ้นกลับสู่ท่ายืนครับ"
    ].join("\n");
  }

  // 2. Breathing Technique
  if (/(หายใจยังไง|การหายใจ|หายใจตอนไหน|จังหวะหายใจ|หายใจอย่างไร|กลั้นหายใจ)/i.test(lowerText)) {
    return [
      "หลักการหายใจที่ถูกต้องขณะออกกำลังกายแบบเวทเทรนนิ่งและบอดี้เวท:",
      "",
      "1. จังหวะผ่อนแรง (ยืดกล้ามเนื้อ): สูดลมหายใจเข้าทางจมูกช้าๆ เช่น ขณะย่อตัวลงใน Squat หรือลดหน้าอกลงใน Push-up",
      "2. จังหวะออกแรง (ต้านแรงโน้มถ่วง): พ่นลมหายใจออกทางปาก เช่น ขณะดันตัวขึ้นใน Squat หรือดันพื้นขึ้นใน Push-up",
      "3. ข้อควรระวังสำคัญ: ห้ามกลั้นหายใจขณะออกแรงเด็ดขาด เพราะจะทำให้ความดันในช่องอกและสมองสูงขึ้น อาจทำให้หน้ามืดหรือเวียนศีรษะได้ครับ"
    ].join("\n");
  }

  // 3. Push-up Form
  if (/(วิดพื้นยังไง|วิดพื้นอย่างไร|ฟอร์ม.*push.?up|push.?up.*ยังไง|ท่าวิดพื้น)/i.test(lowerText)) {
    return [
      "เทคนิคการทำ Push-up (วิดพื้น) ที่ถูกต้องและโดนกล้ามเนื้ออกเต็มๆ:",
      "",
      "1. การวางมือ: วางมือให้กว้างกว่าหัวไหล่เล็กน้อย นิ้วมือชี้ตรงไปข้างหน้า",
      "2. ลำตัว: ลำตัวต้องเป็นแนวตรงตั้งแต่ศีรษะจรดส้นเท้า เกร็งหน้าท้องและบั้นท้าย ไม่ให้สะโพกตกหรือแอ่น",
      "3. มุมข้อศอก: กางข้อศอกทำมุมประมาณ 45-60 องศากับลำตัว (ไม่กางศอก 90 องศาเพื่อเซฟหัวไหล่)",
      "4. การเคลื่อนไหว: ลดหน้าอกลงจนเกือบแตะพื้น แล้วออกแรงดันพื้นขึ้นจนแขนเหยียดตรงโดยไม่ล็อกข้อศอกครับ"
    ].join("\n");
  }

  // 4. Plank Form
  if (/(แพลงก์ยังไง|แพลงก์อย่างไร|ฟอร์ม.*plank|plank.*ยังไง|ท่าแพลงก์)/i.test(lowerText)) {
    return [
      "เทคนิคการทำ Plank ให้แกนกลางลำตัวแข็งแรงและปลอดภัยต่อหลัง:",
      "",
      "1. วางข้อศอกให้ตรงกับแนวหัวไหล่ แขนและลำตัวขนานกับพื้น",
      "2. เกร็งหน้าท้อง ดึงสะดือเข้าหากระดูกสันหลัง พร้อมเกร็งก้นและต้นขา",
      "3. รักษาแนวกระดูกสันหลังให้เป็นเส้นตรง ไม่ยกสะโพกโด่งและไม่ทิ้งสะโพกห้อย",
      "4. หายใจเข้าออกสม่ำเสมอ เริ่มต้นค้างไว้ 20-30 วินาทีต่อเซ็ต แล้วค่อยๆ เพิ่มเวลาครับ"
    ].join("\n");
  }

  // 5. Sets, Reps & Rest Time
  if (/(กี่เซ็ต|กี่ครั้ง|พักกี่นาที|พักระหว่างเซ็ต|พักนานแค่ไหน|พักเท่าไหร่)/i.test(lowerText)) {
    return [
      "คำแนะนำเรื่องจำนวนเซ็ต จำนวนครั้ง และเวลาพักระหว่างเซ็ต:",
      "",
      "- เพื่อกระชับกล้ามเนื้อและเผาผลาญไขมัน: 3-4 เซ็ต เซ็ตละ 12-15 ครั้ง พักระหว่างเซ็ต 45-60 วินาที",
      "- เพื่อเสริมสร้างขนาดกล้ามเนื้อ (Hypertrophy): 3-4 เซ็ต เซ็ตละ 8-12 ครั้ง พักระหว่างเซ็ต 60-90 วินาที",
      "- เพื่อพละกำลังและความแข็งแรง (Strength): 3-5 เซ็ต เซ็ตละ 4-6 ครั้ง พักระหว่างเซ็ต 2-3 นาที",
      "",
      "จิบน้ำเล็กน้อยระหว่างพักเซ็ตเพื่อให้ร่างกายสดชื่นอยู่เสมอครับ"
    ].join("\n");
  }

  // 6. Warmup & Cooldown
  if (/(วอร์มอัพ|อบอุ่นร่างกาย|คูลดาวน์|ยืดเหยียด|ยืดกล้ามเนื้อ)/i.test(lowerText)) {
    return [
      "คำแนะนำการวอร์มอัพและคูลดาวน์อย่างมีประสิทธิภาพ:",
      "",
      "1. ก่อนออกกำลังกาย (Dynamic Warmup): เน้นยืดเหยียดแบบเคลื่อนไหว 5-10 นาที เช่น หมุนหัวไหล่, แกว่งแขน, เตะขาสูง, Jumping Jacks เพื่อเพิ่มอุณหภูมิร่างกายและหล่อลื่นข้อต่อ",
      "2. หลังออกกำลังกาย (Static Cooldown): ยืดเหยียดแบบค้างไว้ท่าละ 15-30 วินาที เช่น ยืดต้นขาด้านหน้า, ยืดหลังแขน, ยืดสะโพก เพื่อลดความตึงและเร่งการฟื้นฟูกล้ามเนื้อครับ"
    ].join("\n");
  }

  return null;
}

function getFitAICapabilitiesResponse(context = {}) {
    const profile = context.profile;
    const nameGreeting = profile?.name ? `คุณ ${profile.name}` : "คุณ";
    return [
        `สวัสดีครับ${nameGreeting}! ผมคือ **FitAI Trainer** โค้ชฟิตเนส AI ส่วนตัวของคุณครับ 🏋️‍♂️✨`,
        `ผมได้รับการออกแบบมาเพื่อเป็นผู้ช่วยดูแลสุขภาพ การออกกำลังกาย และโภชนาการแบบครบวงจรในที่เดียว โดยมี **5 ฟังก์ชันเด่น** หลักที่จะช่วยให้คุณฟิตหุ่นและบรรลุเป้าหมายได้อย่างมีประสิทธิภาพ ดังนี้ครับ:`,
        "",
        "---",
        "",
        "### 🌟 5 ฟังก์ชันเด่นของ FitAI Trainer:",
        "",
        "1. 🎯 **AI Real-Time Pose Tracking & Form Analysis (ตรวจจับและวิเคราะห์ท่าทางผ่านกล้อง)**",
        "   • ใช้ AI Computer Vision ตรวจจับข้อต่อร่างกายแบบเรียลไทม์ขณะออกกำลังกายผ่านกล้องเว็บแคม",
        "   • ระบบนับจำนวนครั้ง (Rep Counter) อัตโนมัติอย่างแม่นยำ พร้อมจับเวลา",
        "   • ตรวจจับและแจ้งเตือนข้อผิดพลาดของฟอร์มทันที (เช่น ย่อไม่ลึกพอ, หลังงอ, จังหวะเร็วเกินไป) พร้อมคำแนะนำปรับท่าให้ถูกต้องและปลอดภัย ป้องกันอาการบาดเจ็บ",
        "   • รองรับโหมด **Unity 3D Interactive Workout** จำลองท่าทางด้วยโมเดล 3D เสมือนจริง",
        "",
        "2. 📅 **Personalized Smart Workout Plan (จัดและปรับตารางออกกำลังกายเฉพาะบุคคล)**",
        "   • ออกแบบโปรแกรมฝึกประจำสัปดาห์ (Full-Body, Upper/Lower, Cardio, Low-Impact ฯลฯ) ที่คำนวณตามสรีระ (BMI, น้ำหนัก, ส่วนสูง), เป้าหมาย และเวลาของคุณ",
        "   • ปรับเปลี่ยนแผนได้อย่างยืดหยุ่นผ่านการแชท เช่น *\"ขอเปลี่ยนท่านี้\", \"วันนี้ขอเน้นหน้าท้อง\", \"เจ็บเข่าขอท่า Low-Impact\"* หรือปรับเป็นวันพัก (Rest Day) ทันที",
        "   • มีคลิปวิดีโอสาธิตแต่ละท่าจาก YouTube ในตารางฝึกเพื่อความเข้าใจที่ถูกต้อง",
        "",
        "3. 🥗 **AI Food & Nutrition Tracker (บันทึกและวิเคราะห์โภชนาการอัจฉริยะ)**",
        "   • บันทึกมื้ออาหารในแต่ละวัน คำนวณพลังงาน (Calories) และสารอาหารหลัก (โปรตีน, คาร์โบไฮเดรต, ไขมัน)",
        "   • คำนวณและเปรียบเทียบกับค่า BMR / TDEE ประจำวันของคุณแบบอัตโนมัติ เพื่อคุมน้ำหนักหรือสร้างกล้ามเนื้อ",
        "   • มีระบบ Food Camera และ AI วิเคราะห์มื้ออาหาร หรือพิมพ์บอกเพื่อคำนวณแคลอรี่และสารอาหารได้ทันที",
        "   • ให้คำแนะนำเมนูสุขภาพทางเลือกและเทคนิคการกินคลีนในชีวิตประจำวัน",
        "",
        "4. 🎙️ **Voice Coach & Interactive Audio (โค้ชเสียงตอบโต้เสมือนจริง)**",
        "   • ระบบเสียงพูด AI โค้ช (Voice Coach) โทนเสียง Anime Mentor ชายเสียงทุ้ม สุขุม อบอุ่น และเป็นมืออาชีพ",
        "   • คอยให้กำลังใจ นับจังหวะ และแนะนำท่าด้วยเสียงแบบเรียลไทม์ขณะกำลังออกกำลังกาย",
        "   • สามารถเลือกเปิด-ปิดเสียงพูดได้ตามต้องการในหน้า Settings",
        "",
        "5. 📈 **Workout Progress & Analytics (ติดตามพัฒนาการและประวัติการฝึก)**",
        "   • สรุปสถิติการออกกำลังกาย จำนวนแคลอรี่ที่เผาผลาญ และความสม่ำเสมอ (Streak)",
        "   • บันทึกประวัติและแสดงแนวโน้มพัฒนาการ ให้คุณเห็นความก้าวหน้าของตัวเองได้อย่างชัดเจน",
        "",
        "---",
        "",
        "💡 **เริ่มต้นใช้งานได้ง่ายๆ:**",
        "• อยากเริ่มฝึก? พิมพ์ **\"เริ่มออกกำลังกายวันนี้\"** หรือกดที่เมนู **Workout**",
        "• อยากเช็กอาหาร? พิมพ์ **\"วันนี้กินอกไก่ไป 200 กรัม กี่แคล\"** หรือไปที่ **Food Tracker**",
        "• มีคำถามเรื่องท่าออกกำลังกายหรือการฟิตหุ่น? พิมพ์สอบถามผมได้ตลอดเวลาเลยครับ พร้อมลุยไปด้วยกันครับ! 🔥"
    ].join("\n");
}

function generateFallbackResponse(message, context = {}) {
    const profile = context.profile || null;
    const workout = context.workout || [];

    const text = String(message || "").trim();
    const lowerText = text.toLowerCase();

    // 1.1 Google / Web Search Fallback Response (เมื่อมีการค้นหาข้อมูลจากอินเทอร์เน็ต)
    if (context.searchData && context.searchData.results && context.searchData.results.length) {
        const searchBlock = formatSearchResultsForFallback(context.searchData);
        let learnedCue = "";
        if (context.userLearnedContext && context.userLearnedContext.briefSummary) {
            learnedCue = "\n" + context.userLearnedContext.briefSummary + "\n";
        }
        return [
            "FitAI ได้ค้นหาข้อมูลล่าสุดจาก Google และเว็บไซต์ที่เกี่ยวข้องให้คุณเรียบร้อยครับ 🌐🔍",
            learnedCue,
            searchBlock,
            "💡 **คำแนะนำจาก FitAI:** คุณสามารถคลิกดูลิงก์ต้นทางด้านบนเพื่ออ่านข้อมูลฉบับเต็ม หรือบอกผมเพิ่มเติมหากต้องการให้สรุปจุดไหนเป็นพิเศษครับ!"
        ].filter(Boolean).join("\n");
    }

    // 1.0 Google & Live Web Search Fallback Response
    if (context.searchData && context.searchData.results && context.searchData.results.length) {
        const searchBlock = formatSearchResultsForFallback(context.searchData);
        let learnedCue = "";
        if (context.userLearnedContext && context.userLearnedContext.briefSummary) {
            learnedCue = "\n" + context.userLearnedContext.briefSummary + "\n";
        }
        return [
            "FitAI ได้ค้นหาข้อมูลล่าสุดจาก Google และเว็บไซต์ที่เกี่ยวข้องให้คุณเรียบร้อยครับ 🌐🔍",
            learnedCue,
            searchBlock,
            "💡 **คำแนะนำจาก FitAI:** คุณสามารถคลิกดูลิงก์ต้นทางด้านบนเพื่ออ่านข้อมูลฉบับเต็ม หรือบอกผมเพิ่มเติมหากต้องการให้สรุปหรือปรับเข้ากับแผนของคุณได้เลยครับ!"
        ].filter(Boolean).join("\n");
    }

    // 1. Off-topic Guardrail (อยู่นอกเหนือฟิตเนส/สุขภาพ)
    const isOffTopic = /(เขียนโค้ด|python|javascript|java|php|การเมือง|หุ้น|คริปโต|หวย|ดูดวง|ซ่อมรถ|ข่าวบันเทิง|ดารา)/i.test(lowerText);
    if (isOffTopic) {
        return "เรื่องนี้อยู่นอกเหนือสายงานโค้ชฟิตเนสของผมเลยครับ 😅 แต่ถ้าเป็นเรื่องการออกกำลังกาย วางแผนตารางฝึก ท่าฝึก หรือเมนูอาหารสุขภาพ สอบถาม FitAI ได้เต็มที่เลยครับ! วันนี้มีเป้าหมายอยากฟิตส่วนไหนเป็นพิเศษไหมครับ? 💪";
    }

    // 2.5 Coaching Knowledge Base Matching (from 420 Q&A Dataset)
    const coachingMatch = matchCoachingIntent(text);
    if (coachingMatch) {
        return generateIntentFallback(coachingMatch, text, context);
    }

    // 2. Food / Menu Recommendation Queries ("มีเมนูอื่นไหม", "กินอะไรดี", "เบื่ออกไก่", "อาหาร")
    const isMenuRecommendation =
      /(มีเมนูอื่น|เมนูอื่น|มีอาหารอื่น|อาหารอื่น|กินไรดี|กินอะไรดี|เบื่ออกไก่|แนะนำเมนู|แนะนำอาหาร|เมนูแนะนำ|อาหารคลีน|ของกิน)/i.test(lowerText);
    if (isMenuRecommendation) {
        const picked = getRandomMenus(3);
        const intros = [
            "FitAI มีไอเดียเมนูอาหารสุขภาพทางเลือกที่ทั้งอร่อย ได้โปรตีนเน้นๆ และดีต่อการฟิตหุ่นมาแนะนำครับ 🍽️✨",
            "เบื่อเมนูเดิมๆ ใช่ไหมครับ? ลองเปลี่ยนบรรยากาศด้วยเมนูสุขภาพรสเด็ดเหล่านี้ดูครับ ได้ทั้งสารอาหารและช่วยฟื้นฟูกล้ามเนื้อแน่นอน 💪🥗",
            "จัดให้เลยครับ! รวมไอเดียเมนูสุขภาพรสชาติเยี่ยม ทำง่าย ทานแล้วไม่อึดอัด เหมาะกับคนออกกำลังกายครับ 🥑🍳"
        ];
        const randomIntro = intros[Math.floor(Math.random() * intros.length)];
        
        let response = randomIntro + "\n\n";
        picked.forEach((m, idx) => {
            response += `### ${idx + 1}. **${m.name}**\n`;
            response += `- ⚡ พลังงานโดยประมาณ: **~${m.cal} kcal** | 🍗 โปรตีน: **~${m.pro} g**\n`;
            response += `- 💡 *จุดเด่น:* ${m.note}\n\n`;
        });
        response += "💡 **ทริคจาก FitAI:** สามารถปรุงรสด้วยเครื่องเทศสมุนไพร พริกไทย หรือซีอิ๊วโซเดียมต่ำได้ตามชอบเลยครับ การทานอาหารที่ดีไม่จำเป็นต้องจืดชืดเสมอไปครับ!";
        return response;
    }

    // 3. Tired / Rest / Recovery ("เหนื่อยมาก", "ขอนอนพัก", "เมื่อย", "ปวดกล้ามเนื้อ")
    const isTiredOrRest = /(เหนื่อย|นอนพัก|ขอพัก|พักผ่อน|เมื่อย|ปวดกล้ามเนื้อ|ระบม|เมื่อยล้า|พักก่อน)/i.test(lowerText);
    if (isTiredOrRest) {
        return [
            "วันนี้เหนื่อยและเมื่อยล้า พักผ่อนได้เต็มที่เลยครับ! ร่างกายและกล้ามเนื้อพัฒนาตอนเราพักผ่อนและการนอนหลับที่มีคุณภาพครับ 🛌💤",
            "",
            "💡 **คำแนะนำการฟื้นฟูร่างกาย (Active Recovery):**",
            "- 💧 **ดื่มน้ำให้เพียงพอ:** ช่วยขับกรดแลกติกและลดอาการตึงของกล้ามเนื้อ",
            "- 🧘 **ยืดเหยียดเบา ๆ (Stretching):** สัก 5-10 นาทีก่อนนอน ช่วยให้หลับสบายและคลายความตึง",
            "- 🍗 **เติมโปรตีนและสารอาหาร:** ช่วยซ่อมแซมเส้นใยกล้ามเนื้อที่ถูกใช้งาน",
            "- 😴 **นอนหลับ 7-8 ชั่วโมง:** ฮอร์โมนเร่งการเจริญเติบโต (Growth Hormone) จะหลั่งเพื่อซ่อมแซมร่างกายอย่างเต็มที่",
            "",
            "พักผ่อนให้สดชื่น แล้วค่อยกลับมาลุยด้วยกันใหม่ในวันพรุ่งนี้ครับ FitAI เป็นกำลังใจให้เสมอครับ! 💪"
        ].join("\n");
    }

    // 4. Exercise Alternatives / Swap Poses ("เปลี่ยนท่า", "เล่นท่าไหนแทน", "ปวดเข่า", "ไม่มีอุปกรณ์")
    const isExerciseSwap = /(เปลี่ยนท่า|ท่าไหนแทน|แทนได้|เจ็บเข่า|ปวดเข่า|ปวดหลัง|เจ็บข้อมือ|ไม่มีอุปกรณ์|สลับท่า)/i.test(lowerText);
    if (isExerciseSwap) {
        if (lowerText.includes("เข่า") || lowerText.includes("squat") || lowerText.includes("สควอท")) {
            return [
                "เข้าใจเลยครับ หากมีอาการตึงหรือเจ็บเข่า ควรหลีกเลี่ยงแรงกดโดยตรงครับ FitAI แนะนำท่าทางเลือกที่เซฟเข่าแต่บริหารกล้ามเนื้อช่วงล่างได้ดีเยี่ยมดังนี้ครับ 🦵🛡️",
                "",
                "1. **Glute Bridge (สะพานโค้งก้น):** นอนหงายแล้วยกสะโพกขึ้น โฟกัสก้นและต้นขาด้านหลัง ไม่ลงน้ำหนักที่เข่าเลย (3 เซ็ต, 12-15 ครั้ง)",
                "2. **Wall Sit (นั่งพิงกำแพง):** พิงหลังกับผนัง ลดตัวลงในมุมที่เข่าไม่เจ็บ เกร็งค้างไว้ เป็นการฝึกแบบคงที่ลดแรงกระแทก (3 เซ็ต, 20-30 วินาที)",
                "3. **Step-Up (ก้าวขึ้นบันไดหรือกล่องเตี้ย):** ก้าวขึ้นลงช้าๆ เน้นการควบคุมกล้ามเนื้อ (3 เซ็ต, 10 ครั้ง/ข้าง)",
                "",
                "💡 ลองปรับทำท่าเหล่านี้ดูนะครับ ถ้าท่าไหนทำแล้วรู้สึกเจ็บแปลบให้หยุดทันที ความปลอดภัยต้องมาก่อนเสมอครับ!"
            ].join("\n");
        }
        return [
            "ยินดีช่วยปรับท่าทางเลือกให้เหมาะกับคุณครับ! 💪",
            "",
            "หากคุณไม่มีอุปกรณ์ หรือมีอาการตึงเฉพาะจุด สามารถเลือกท่าบอดี้เวทที่ปลอดภัยได้ เช่น:",
            "- **บริหารช่วงบน:** Incline Push-up (วิดพื้นกับโต๊ะ/ผนัง), Chair Dips, หรือ Wall Push-up",
            "- **บริหารแกนกลางลำตัว:** Plank, Dead Bug, Bird Dog (ปลอดภัยต่อหลังส่วนล่าง)",
            "- **บริหารช่วงล่าง:** Glute Bridge, Calf Raise, Chair Squat",
            "",
            "บอกผมได้เลยครับว่าต้องการเปลี่ยนท่าไหน หรือมีข้อจำกัดตรงจุดใด ผมจะจัดท่าที่เหมาะสมที่สุดให้ครับ!"
        ].join("\n");
    }

    // 4.5 Exercise Technique & Breathing Queries (ย่อลึกแค่ไหน, หายใจยังไง, ฟอร์มที่ถูกต้อง)
    const techniqueAdvice = getExerciseTechniqueAdvice(lowerText);
    if (techniqueAdvice) {
        return techniqueAdvice;
    }

    // 5. Workout Advice / Routine Recommendations
    const isSelfIntro = /(แนะนำตัว|คุณคือใคร|คุณเป็นใคร|ช่วยอะไรได้บ้าง|ทำอะไรได้บ้าง|ฟังก์ชันเด่น|ฟังก์ชันของ|ความสามารถ|ระบบทำอะไร|แนะนำ.*fitai|fitai.*คืออะไร|มีฟังก์ชันอะไร|แนะนำระบบ|ฟังก์ชัน.*มีอะไร)/i.test(lowerText);
    const isWorkoutAdviceQuery = !isSelfIntro && /(แนะนำ.*(ท่า|การฝึก|โปรแกรม)|ควรออก.*ท่า|ท่าไหน|ตารางการฝึก|แผนการฝึก|ซ้อมท่าไหน|workout routine)/i.test(lowerText);
    if (isWorkoutAdviceQuery) {
        if (context.activePlan) {
            return formatActivePlanRecommendation(context.activePlan, profile);
        }
        const bmiStatus = profile?.bmiStatus || "สมส่วน";
        const bmiVal = profile?.bmi || "22";
        return [
            `ยินดีจัดโปรแกรมและแนะนำการฝึกให้ครับ! 🏋️‍♂️ (อ้างอิงสถานะ BMI ${bmiVal} : ${bmiStatus})`,
            "",
            "**ตัวอย่างโปรแกรม Full-Body กระชับสัดส่วนและสร้างความแข็งแรง:**",
            "1. **Chair Squat หรือ Bodyweight Squat** (3 เซ็ต, 10-12 ครั้ง) — สร้างความแข็งแรงให้ต้นขาและสะโพก",
            "2. **Wall Push-up หรือ Standard Push-up** (3 เซ็ต, 8-10 ครั้ง) — พัฒนาหน้าอก หัวไหล่ และแขน",
            "3. **Glute Bridge** (3 เซ็ต, 12-15 ครั้ง) — เสริมความแข็งแรงแกนกลางลำตัวและสะโพก",
            "4. **Plank** (3 เซ็ต, 20-30 วินาที) — สร้างกล้ามเนื้อหน้าท้องที่มั่นคง",
            "",
            "🔥 **คำแนะนำ:** อย่าลืมวอร์มอัพ 3-5 นาทีก่อนเริ่ม และคูลดาวน์ยืดเหยียดหลังฝึกเสร็จนะครับ คุณสามารถบอกผมได้ตลอดว่าอยากเน้นส่วนไหนเป็นพิเศษครับ!"
        ].join("\n");
    }

    // 5.5 Unknown or Unfamiliar Fitness Term / Movement Handler
    // เมื่อผู้ใช้ถามคำศัพท์, ชื่อท่า, หรือเทคนิคการฝึกแปลกใหม่ที่ระบบไม่พบในฐานข้อมูล
    const isAskingUnknownTerm = /(คืออะไร|หมายถึงอะไร|รู้จัก.*ไหม|แปลว่าอะไร|ทำยังไง|มีท่า.*ไหม|เรียกว่าอะไร)/i.test(lowerText);
    if (isAskingUnknownTerm) {
        return [
            "เรื่องนี้หรือชื่อท่าที่คุณสอบถาม อาจเป็นคำศัพท์เฉพาะกลุ่ม เทคนิคเฉพาะทาง หรือชื่อเรียกเฉพาะตัวครับ 💡🏋️‍♂️",
            "",
            "เพื่อให้ผมช่วยวิเคราะห์และให้คำแนะนำที่ถูกต้องและปลอดภัยที่สุด รบกวนบอกข้อมูลเพิ่มเติมเล็กน้อยนะครับ:",
            "1. ท่าหรือเทคนิคนี้เน้นบริหาร **กล้ามเนื้อส่วนไหน** ครับ? (เช่น ขา, ก้น, อก, หลัง, ไหล่, แขน หรือหน้าท้อง)",
            "2. มีลักษณะการเคลื่อนไหวหรือใช้อุปกรณ์อะไรเป็นพิเศษไหมครับ? (เช่น ผลัก, ดึง, สควอท, ยกค้าง หรือใช้ดัมเบล/บอดี้เวท)",
            "3. มีเป้าหมายเพื่อสร้างกล้ามเนื้อ เพิ่มความยืดหยุ่น หรือเผาผลาญไขมันครับ?",
            "",
            "บอกผมได้เลยครับ! FitAI พร้อมช่วยปรับฟอร์มและแนะนำท่าทางเลือกมาตรฐานที่ตรงจุดให้คุณทันทีครับ 💪✨"
        ].join("\n");
    }

    // 6. Natural Trainer Default Response (พร้อมความเข้าใจประวัติผู้ใช้รายบุคคล)
    if (context.userLearnedContext) {
        const mem = context.userLearnedContext;
        const memoryPoints = [];
        if (mem.focusAreas && mem.focusAreas.length) memoryPoints.push(`เน้น${mem.focusAreas.join(", ")}`);
        if (mem.constraints && mem.constraints.length) memoryPoints.push(mem.constraints.join(", "));
        if (mem.dietHabits && mem.dietHabits.length) memoryPoints.push(mem.dietHabits.join(", "));
        
        if (memoryPoints.length) {
            return [
                "สวัสดีครับ FitAI พร้อมลุยและให้คำปรึกษาเรื่องฟิตเนสกับคุณเสมอครับ! 🎯💪",
                "",
                `💡 **FitAI จดจำความต้องการของคุณได้:** จากประวัติการพูดคุยของคุณ คุณมักจะ${memoryPoints.join(" และ ")} ใช่ไหมครับ!`,
                "",
                "วันนี้คุณอยากให้ผมช่วยจัดตารางออกกำลังกาย แนะนำท่าเฉพาะส่วน หรือแนะนำเมนูสุขภาพเพื่อต่อยอดความฟิตของคุณดีครับ? บอกผมได้เลยครับ! 😊"
            ].join("\n");
        }
    }

    // 6. Natural Trainer Default Response (แทนที่คำตอบหุ่นยนต์แบบเดิม)
    const coachIntros = [
        "ยินดีช่วยดูแลสุขภาพและการออกกำลังกายของคุณครับ! 💪",
        "FitAI พร้อมลุยและให้คำปรึกษาเรื่องฟิตเนสกับคุณเสมอครับ! 🎯",
        "สวัสดีครับ มีอะไรให้เทรนเนอร์ FitAI ช่วยเหลือเกี่ยวกับสุขภาพและการออกกำลังกายวันนี้ไหมครับ? 😊"
    ];
    const pickedIntro = coachIntros[Math.floor(Math.random() * coachIntros.length)];

    let defaultMsg = pickedIntro + "\n\n";
    if (profile) {
        defaultMsg += `ปัจจุบันคุณมีข้อมูล Profile: น้ำหนัก ${profile.weight || "-"} กก., ส่วนสูง ${profile.height || "-"} ซม., และ BMI ${profile.bmi || "-"} (${profile.bmiStatus || "สุขภาพดี"}) ครับ\n\n`;
    }
    defaultMsg += "คุณสามารถสอบถามหรือให้ผมช่วยได้หลากหลายเรื่องเลยครับ เช่น:\n";
    defaultMsg += "- 🏋️ **การออกกำลังกาย:** แนะนำท่าฝึก, ปรับเปลี่ยนท่า, แก้ไขฟอร์ม หรือจัดตารางฝึก\n";
    defaultMsg += "- 🥗 **โภชนาการ:** แนะนำเมนูอาหารสุขภาพ, อาหารโปรตีนสูง, หรือคำนวณแคลอรี่\n";
    defaultMsg += "- 🧘 **การฟื้นฟู:** วันพักผ่อน (Rest Day), การยืดเหยียดกล้ามเนื้อ หรือการดูแลเมื่อมีอาการเมื่อยล้า\n\n";
    defaultMsg += "วันนี้คุณอยากโฟกัสที่เรื่องไหน บอกผมได้ทันทีเลยครับ!";
    return defaultMsg;
}

const { askOllama, askOllamaStructured } = require("./ollamaService");
const { enrichResponseWithVideos } = require("./exerciseVideoService");

function isPlanRequest(message) {
    return /(ตาราง|แผน|วันนี้|แนะนำ.*ออกกำลัง|ออกกำลัง.*อะไร|workout\s*plan|today)/i.test(message);
}

function isStartingPlanChange(message) {
    return /^(?:ต้องการ|อยาก|ขอ)?\s*(?:เปลี่ยน|ปรับ)\s*(?:แผน|ตาราง)(?:\s*(?:ออกกำลังกาย|วันนี้))?[.!?]*$/i.test(String(message || "").trim());
}

function formatActivePlan(plan, profile = null) {
    if (!plan || plan.exerciseName === "Rest") {
        return `FitAI ได้ปรับตารางของวันนี้เป็น **วันพักผ่อนและฟื้นฟูร่างกาย** เรียบร้อยแล้วครับ 🧘\n\nพักผ่อน ดื่มน้ำให้เพียงพอ หรือยืดเหยียดกล้ามเนื้อเบา ๆ เพื่อให้ร่างกายได้ฟื้นฟูอย่างเต็มที่ครับ`;
    }
    const exercises = Array.isArray(plan.exercises) && plan.exercises.length
        ? plan.exercises
        : [{ name: plan.exerciseName, sets: plan.sets, repetitions: plan.repetitions }];
    const list = exercises.map((exercise, index) =>
        `${index + 1}. **${exercise.name}** (${exercise.sets ? `${exercise.sets} เซ็ต · ` : ""}${exercise.repetitions})`
    ).join("\n");
    return [
        `ตารางการออกกำลังกายสำหรับวันนี้ (**${plan.focus || "แผนออกกำลังกาย"}**):`,
        "",
        "**ท่าในตารางที่ต้องออกสำหรับวันนี้:**",
        list,
        "",
        "ตารางออกกำลังกายทางด้านขวาได้รับการอัปเดตตรงตามรายการนี้เรียบร้อยแล้วครับ สามารถคลิกดูคลิปวิดีโอสาธิตแต่ละท่าจาก YouTube ด้านล่างเพื่อฝึกฟอร์มที่ถูกต้องได้เลยครับ 🎯",
    ].join("\n");
}

function formatActivePlanRecommendation(plan, profile = null) {
    if (!plan || plan.exerciseName === "Rest") {
        const profileInfo = profile?.height && profile?.weight
            ? `(ส่วนสูง ${profile.height} ซม., น้ำหนัก ${profile.weight} กก., BMI ${profile.bmi || "-"})`
            : "";
        return [
            `จากข้อมูล Profile ของคุณ ${profileInfo}`,
            `ตารางการออกกำลังกายสำหรับวันนี้ของคุณคือ **วันพักผ่อนและฟื้นฟูร่างกาย** ครับ 🧘`,
            "",
            "แนะนำให้ดื่มน้ำให้เพียงพอ พักผ่อนกล้ามเนื้อ หรือยืดเหยียดเบา ๆ เพื่อให้ร่างกายพร้อมสำหรับการฝึกในวันต่อไปครับ",
            "",
            "💡 หากคุณต้องการเริ่มออกกำลังกายในวันนี้ หรือต้องการปรับเปลี่ยนตาราง สามารถบอกผมได้เลยครับ เช่น “อยากออกกำลังกายวันนี้” หรือ “ขอท่าช่วงล่าง”",
        ].join("\n");
    }

    const exercises = Array.isArray(plan.exercises) && plan.exercises.length
        ? plan.exercises
        : [{ name: plan.exerciseName, sets: plan.sets, repetitions: plan.repetitions }];

    const list = exercises.map((exercise, index) =>
        `${index + 1}. **${exercise.name}** (${exercise.sets ? `${exercise.sets} เซ็ต · ` : ""}${exercise.repetitions})`
    ).join("\n");

    const genderText = profile?.gender === "female" ? "หญิง" : profile?.gender === "male" ? "ชาย" : "";
    const details = [
        profile?.height ? `ส่วนสูง ${profile.height} ซม.` : null,
        profile?.weight ? `น้ำหนัก ${profile.weight} กก.` : null,
        profile?.age ? `อายุ ${profile.age} ปี` : null,
        genderText ? `เพศ${genderText}` : null,
        profile?.bmi ? `BMI ${profile.bmi} (${profile.bmiStatus || "สมส่วน"})` : null,
    ].filter(Boolean).join(", ");

    return [
        `FitAI ขอแนะนำท่าออกกำลังกายที่เหมาะสมกับคุณ โดยยึดตามตารางออกกำลังกายประจำวัน ดังนี้ครับ 🎯`,
        "",
        details ? `📊 **ข้อมูลของคุณ:** ${details}` : "",
        `🏋️ **ตารางวันนี้เน้นกลุ่ม:** **${plan.focus || "แผนออกกำลังกาย"}**`,
        "",
        "**ท่าออกกำลังกายในตารางที่คุณควรฝึกวันนี้:**",
        list,
        "",
        "ตารางออกกำลังกายทางด้านขวาตรงตามรายการนี้แล้วครับ สามารถคลิกดูคลิปวิดีโอสาธิตจาก YouTube ด้านล่างเพื่อฝึกฟอร์มที่ถูกต้องได้เลยครับ",
        "",
        "💡 *ต้องการเปลี่ยนท่าหรือแก้ไขกิจกรรมตาราง?* คุณสามารถพิมพ์บอกได้ทันที เช่น “เปลี่ยนท่า Squat เป็น Chair Squat” หรือ “วันนี้ขอเน้นหน้าท้อง” แล้วตารางจะอัปเดตตามที่คุณขอทันทีครับ!",
    ].filter(Boolean).join("\n");
}


// =====================================
// Food & Calorie Tracking Intelligence
// =====================================
function isFoodOrNutritionQuery(text = "") {
  const t = String(text || "").toLowerCase();
  const hasFoodKeywords =
    /(อาหาร|เมนู|กิน|ทาน|แดก|แคล|แคลอรี่|กี่แคล|calorie|calories|nutrition|โภชนาการ|โปรตีน|คาร์บ|ไขมัน|ข้าว|อกไก่|สลัด|กะเพรา|ก๋วยเตี๋ยว|ส้มตำ|มื้อ|diet|food|bmr|tdee|น้ำหนักเกิน|ลดความอ้วน|เพิ่มกล้าม|สร้างกล้าม|คลีน)/i.test(t);
  const isExplicitWorkoutChange =
    /(เปลี่ยนท่า|เปลี่ยนตาราง|ขอเปลี่ยนท่า|สลับท่า|แก้ตาราง|ตารางออกกำลังกาย)/i.test(t);
  return hasFoodKeywords && !isExplicitWorkoutChange;
}

function handleFoodAndNutritionQuery(message, context = {}) {
  if (!isFoodOrNutritionQuery(message)) return null;

  const text = String(message || "").trim();
  const lower = text.toLowerCase();
  const profile = context.profile || null;
  const foodLogs = Array.isArray(context.foodLogs) ? context.foodLogs : [];

  // 1. Calculate user BMR & TDEE
  let weight = Number(profile?.weight) || 70;
  let height = Number(profile?.height) || 170;
  let age = Number(profile?.age) || 25;
  const isMale = String(profile?.gender || "").toLowerCase().includes("male") || String(profile?.gender || "").includes("ชาย");
  let bmr = isMale ? (10 * weight + 6.25 * height - 5 * age + 5) : (10 * weight + 6.25 * height - 5 * age - 161);
  let targetCal = Math.round(bmr * 1.375); // standard activity level

  // Consumed today
  const totalCal = foodLogs.reduce((sum, l) => sum + (Number(l.totalCalories) || 0), 0);
  const totalPro = foodLogs.reduce((sum, l) => sum + (Number(l.totalProtein) || 0), 0);
  const totalCarb = foodLogs.reduce((sum, l) => sum + (Number(l.totalCarbs) || 0), 0);
  const totalFat = foodLogs.reduce((sum, l) => sum + (Number(l.totalFat) || 0), 0);
  const remainingCal = Math.max(0, Math.round(targetCal - totalCal));

  // --- SUB-CASE 1: Substitute or Similar Food Request (กินอะไรแทน... / เบื่อ...กินอะไรดี / มีเมนูอะไรคล้าย...) ---
  const isSubstituteQuery = /(?:กินอะไรแทน|ทานอะไรแทน|อะไรแทน|ทดแทน|เมนูแทน|เบื่อ|คล้ายกับ|เหมือนกับ|เมนูคล้าย|อาหารคล้าย|สไตล์เดียวกับ|อยากกิน.*แต่กลัวอ้วน|อยากกิน.*แต่แคลเยอะ)/i.test(lower);
  if (isSubstituteQuery) {
    let targetDish = text.replace(/^(?:อยากทราบว่า|ช่วยบอกหน่อย|แนะนำหน่อย|อยากรู้ว่า)?\s*(?:กินอะไรแทน|ทานอะไรแทน|อะไรแทน|ทดแทน|เมนูแทน|เบื่อ|อยากกิน|มีเมนูอะไรคล้าย|เมนูคล้าย|อาหารคล้าย|อาหารที่คล้าย)\s*/i, "");
    targetDish = targetDish.replace(/(?:ดี|ได้บ้าง|บ้าง|ครับ|ค่ะ|คะ|หน่อย|มั่ง|กินดี|กินอะไร|แทนดี|แทนได้บ้าง|สไตล์เดียวกัน|แต่กลัวอ้วน|แต่แคลเยอะ)+$/gi, "").trim();

    const knownEntry = findFoodEntry(targetDish);
    const dishDisplayName = knownEntry ? knownEntry.name : (targetDish || "เมนูที่คุณสอบถาม");
    const isBoredOfProtein = /อกไก่|ไก่|ไข่ต้ม|เวย์/i.test(targetDish);

    let sims = findSimilarFoodEntries(dishDisplayName, 4, knownEntry?.id, dishDisplayName);
    if (isBoredOfProtein) {
      sims = sims.filter((s) => !/ไก่/i.test(s.name));
      if (sims.length === 0) {
        const altDishes = ["สเต็กปลาทูน่า", "แซลมอนย่าง", "ไข่ต้ม", "แกงจืดเต้าหู้หมูสับ"];
        sims = loadDatabase().filter((d) => altDishes.includes(d.name)).slice(0, 3).map((d) => ({
          ...d,
          reason: "แหล่งโปรตีนชั้นดีทางเลือกทดแทนโปรตีนเดิม",
        }));
      }
    }

    if (sims.length > 0) {
      let reply = `FitAI ขอแนะนำ **เมนูทางเลือกทดแทนสำหรับ "${dishDisplayName}"** ครับ 🥗✨\n\n`;
      reply += `หากคุณต้องการเปลี่ยนบรรยากาศ หรือมองหาเมนูที่รสชาติใกล้เคียง/คุณค่าทางอาหารสมดุล นี่คือเมนูแนะนำครับ:\n\n`;

      sims.slice(0, 3).forEach((item, idx) => {
        const s = item.serving || { calories: item.per100g?.calories || 150, protein: 0, carbs: 0, fat: 0, unit: "จาน" };
        reply += `### ${idx + 1}. **${item.name}**\n`;
        reply += `- ⚡ พลังงาน: **${s.calories} kcal** (ต่อ 1 ${s.unit || "จาน"})\n`;
        reply += `- 🍗 โปรตีน: **${s.protein} g** | 🍚 คาร์บ: **${s.carbs} g** | 🥑 ไขมัน: **${s.fat} g**\n`;
        if (item.reason) reply += `- 💡 *เหตุผลที่แนะนำ:* ${item.reason}\n\n`;
      });

      const topItem = sims[0];
      const logData = {
        name: topItem.name,
        calories: topItem.serving?.calories || 250,
        protein: topItem.serving?.protein || 15,
        carbs: topItem.serving?.carbs || 30,
        fat: topItem.serving?.fat || 8,
        unit: topItem.serving?.unit || "จาน",
      };
      reply += `[LOG_FOOD_ACTION:${JSON.stringify(logData)}]\n\n`;
      reply += `💡 *คุณสามารถกดปุ่ม "บันทึกเมนูนี้ลงมื้ออาหาร" เพื่อบันทึกเข้าตารางแคลอรี่ประจำวันได้ทันทีครับ!*`;
      return reply;
    }
  }

  // --- SUB-CASE 2: Recommend Muscle-Building Food Menu (แนะนำเมนูอาหารเสริมกล้ามเนื้อ / เพิ่มกล้าม) ---
  if (/(เสริมกล้าม|สร้างกล้าม|เพิ่มกล้าม|กล้ามเนื้อ|protein|โปรตีนสูง)/i.test(lower) && /(เมนู|อาหาร|แนะนำ|กินอะไร|ควรทาน)/i.test(lower)) {
    const targetProteinMin = Math.round(weight * 1.6);
    const targetProteinMax = Math.round(weight * 2.0);
    const surplusCal = targetCal + 250;

    return [
      `FitAI ขอแนะนำ **เมนูอาหารเสริมสร้างกล้ามเนื้อ (High Protein Muscle Building Plan)** สำหรับคุณโดยเฉพาะครับ 💪🥗`,
      "",
      `📊 **เป้าหมายโภชนาการของคุณ (น้ำหนัก ${weight} กก.):**`,
      `- ⚡ แคลอรี่เป้าหมาย: **${surplusCal} kcal/วัน** (TDEE + 250 kcal เพื่อการเจริญเติบโตของกล้ามเนื้อ)`,
      `- 🍗 โปรตีนเป้าหมาย: **${targetProteinMin} - ${targetProteinMax} g/วัน** (1.6 - 2.0 g ต่อน้ำหนักตัว 1 กก.)`,
      "",
      `🍽️ **ตัวอย่างแผนเมนูอาหารประจำวัน:**`,
      `1. **🍳 มื้อเช้า: ไข่ต้ม 2 ฟอง + ขนมปังโฮลวีต 2 แผ่น + อกไก่ฉีก (หรือนมถั่วเหลืองไม่หวาน)**`,
      `   - พลังงาน: ~360 kcal | โปรตีน: ~28 g | คาร์บ: ~34 g`,
      "",
      `2. **🍛 มื้อกลางวัน: ข้าวผัดกะเพราอกไก่ (ใช้น้ำมันน้อย/ผัดน้ำ) + ไข่ดาวน้ำ**`,
      `   - พลังงาน: ~480 kcal | โปรตีน: ~38 g | คาร์บ: ~52 g`,
      "",
      `3. **🍌 ของว่าง / ก่อนหรือหลังออกกำลังกาย: กล้วยหอม 1 ลูก + ไข่ต้ม 1 ฟอง หรือ เวย์โปรตีน 1 สกู๊ป**`,
      `   - พลังงาน: ~190 kcal | โปรตีน: ~15 - 24 g`,
      "",
      `4. **🥗 มื้อเย็น: สเต็กปลากะพงย่าง หรือ ลาบอกไก่ + ข้าวกล้อง 1 ทัพพี + ผักเคียง**`,
      `   - พลังงาน: ~410 kcal | โปรตีน: ~35 g | คาร์บ: ~38 g`,
      "",
      `✅ **รวมสารอาหารทั้งวันโดยประมาณ:** พลังงาน ~**1,440 - 1,800 kcal** | โปรตีน **~115 - 125 g** (ครบถ้วนตามเป้าหมายสร้างกล้ามเนื้อ)`,
      "",
      `💡 **เคล็ดลับจาก FitAI:**`,
      `- ควรดื่มน้ำให้ได้อย่างน้อย 2.5 - 3 ลิตรต่อวัน เพื่อช่วยในการสังเคราะห์โปรตีนและการฟื้นฟูกล้ามเนื้อ`,
      `- ทานคาร์โบไฮเดรตเชิงซ้อน (เช่น ข้าวกล้อง, มันหวาน, ข้าวโอ๊ต) เพื่อให้มีพลังงานฝึกได้อย่างเต็มที่`,
      `- คุณสามารถกดบันทึกหรือถ่ายรูปอาหารเพื่อเช็กแคลอรี่และสารอาหารได้ที่แถบ **🥗 คำนวณแคลอรี่** ด้านขวาได้ตลอดเวลาครับ!`,
    ].join("\n");
  }

  // --- SUB-CASE 3: Recommend Weight Loss / Low-Calorie Menu (แนะนำเมนูลดน้ำหนัก / คุมแคลอรี่ / อาหารคลีน) ---
  if (/(ลดน้ำหนัก|ลดไขมัน|คุมแคล|คุมน้ำหนัก|อาหารคลีน|ผอม)/i.test(lower) && /(เมนู|อาหาร|แนะนำ|กินอะไร|ควรทาน)/i.test(lower)) {
    const deficitCal = Math.max(1200, targetCal - 400);

    return [
      `FitAI ขอแนะนำ **เมนูอาหารควบคุมแคลอรี่และลดไขมัน (Calorie Deficit & High Satiety Plan)** ครับ 🥗🔥`,
      "",
      `📊 **เป้าหมายโภชนาการของคุณ:**`,
      `- ⚡ แคลอรี่เป้าหมาย: **${deficitCal} kcal/วัน** (สร้าง Calorie Deficit อย่างปลอดภัย -400 kcal)`,
      `- 🍗 โปรตีน: **${Math.round(weight * 1.4)} g/วัน** (เพื่อรักษาความกระชับและมวลกล้ามเนื้อ)`,
      "",
      `🍽️ **เมนูอาหารไทยแคลอรี่ต่ำที่แนะนำ:**`,
      `1. **🍲 แกงจืดเต้าหู้หมูสับสาหร่าย / ต้มเลือดหมูใบตำลึง** (~140 - 160 kcal) — อิ่มท้อง แคลอรี่ต่ำมาก`,
      `2. **🥗 ส้มตำไทย (ไม่หวานจัด) + ไก่ย่างไม่ติดหนัง 1 ชิ้น** (~260 kcal) — โปรตีนแน่น แคลอรี่เบา`,
      `3. **🐟 ปลานึ่งมะนาว หรือ ต้มยำกุ้งน้ำใส + ข้าวสวย 1 ทัพพี** (~280 - 320 kcal) — ไขมันต่ำมาก`,
      `4. **🌶️ ลาบอกไก่ + ผักสดเคียงไม่อั้น** (~180 kcal) — รสชาติแซ่บ โปรตีนสูงกว่า 28 กรัม`,
      "",
      `💡 **ข้อแนะนำ:** หลีกเลี่ยงอาหารทอด ผัดน้ำมันเยิ้ม แกงกะทิ และน้ำหวานชง เพราะมักมีแคลอรี่แฝงสูงครับ`,
    ].join("\n");
  }

  // --- SUB-CASE 4: Specific Food Calorie / Nutrition Query (อกไก่ 100 กรัมมีโปรตีนกี่กรัม / ข้าวมันไก่กี่แคล / ต้มยำ ...) ---
  const isNutritionOrCalorieQuery =
    /(?:กี่แคล|คำนวณแคล|แคลอรี่เท่า|พลังงานเท่า|กี่กิโลแคล|กี่แคลอรี่|โปรตีนเท่า|โปรตีนกี่|คาร์บเท่า|คาร์บกี่|ไขมันเท่า|สารอาหาร|โภชนาการ|กี่กรัม)/i.test(lower) ||
    /(?:กิน|ทาน|มี).*(?:กี่แคล|เท่าไหร่|เท่าไร|กี่กรัม)/i.test(lower);

  if (isNutritionOrCalorieQuery) {
    const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:กรัม|g|ขีด|กิโล|กก)/i);
    let requestedGrams = null;
    if (weightMatch) {
      const val = parseFloat(weightMatch[1]);
      if (/ขีด/i.test(weightMatch[0])) requestedGrams = val * 100;
      else if (/กิโล|กก/i.test(weightMatch[0])) requestedGrams = val * 1000;
      else requestedGrams = val;
    }

    let dishName = text
      .replace(/^(?:อยากทราบว่า|ช่วยบอกหน่อย|ช่วยคำนวณ|คำนวณ|บอกหน่อย|แนะนำ|อยากรู้ว่า|มีเมนู|กิน|ทาน)\s*/i, "")
      .replace(/\d+\s*(?:กรัม|g|ขีด|กิโล|กก)?/gi, "")
      .replace(/(?:มี|ให้)?\s*(?:โปรตีน|คาร์บ|คาร์โบไฮเดรต|ไขมัน|แคลอรี่|พลังงาน|สารอาหาร)?\s*(?:ประมาณ)?\s*(?:กี่กรัม|กี่แคล|กี่กิโลแคล|เท่าไร|เท่าไหร่|อะไรบ้าง|กี่แคลอรี่)[\s\S]*$/gi, "")
      .replace(/[\s\?\,]+$/g, "")
      .trim();

    const knownEntry = findFoodEntry(dishName) || findFoodEntry(text);

    if (knownEntry) {
      let calories = 200, protein = 10, carbs = 20, fat = 5, unitText = "1 จาน";
      
      if (requestedGrams && knownEntry.per100g) {
        const ratio = requestedGrams / 100;
        calories = Math.round(knownEntry.per100g.calories * ratio);
        protein = Math.round(knownEntry.per100g.protein * ratio * 10) / 10;
        carbs = Math.round((knownEntry.per100g.carbs || 0) * ratio * 10) / 10;
        fat = Math.round((knownEntry.per100g.fat || 0) * ratio * 10) / 10;
        unitText = `${requestedGrams} กรัม`;
      } else if (knownEntry.serving) {
        calories = knownEntry.serving.calories;
        protein = knownEntry.serving.protein;
        carbs = knownEntry.serving.carbs;
        fat = knownEntry.serving.fat;
        unitText = `1 ${knownEntry.serving.unit || "จาน"}`;
      }

      const sims = findSimilarFoodEntries(knownEntry.name, 2, knownEntry.id, knownEntry.name);

      let reply = `FitAI คำนวณข้อมูลโภชนาการสำหรับ **${knownEntry.name}** (${unitText}) ให้เรียบร้อยครับ\n\n`;
      reply += `- พลังงาน: **${calories} kcal**\n`;
      reply += `- โปรตีน: **${protein} g** | คาร์โบไฮเดรต: **${carbs} g** | ไขมัน: **${fat} g**\n\n`;

      if (sims.length > 0) {
        reply += `**เมนูทางเลือกสุขภาพใกล้เคียง:**\n`;
        sims.forEach((alt) => {
          reply += `- **${alt.name}** (**${alt.serving?.calories} kcal**) — ${alt.reason || "เมนูใกล้เคียง"}\n`;
        });
        reply += `\n`;
      }

      const logData = {
        name: knownEntry.name,
        calories,
        protein,
        carbs,
        fat,
        unit: unitText,
      };
      reply += `[LOG_FOOD_ACTION:${JSON.stringify(logData)}]\n\n`;
      reply += `*คุณสามารถกดปุ่ม "บันทึกลงมื้ออาหาร" เพื่อบันทึกเข้าตารางแคลอรี่ประจำวันได้ทันทีครับ*`;
      return reply;
    } else if (dishName.length >= 2) {
      const est = getNutrition({ name: dishName, weight: requestedGrams || 100 });
      const sims = findSimilarFoodEntries(dishName, 3);
      const unitText = requestedGrams ? `${requestedGrams} กรัม` : `1 ${est.unit || "จาน"}`;

      let reply = `FitAI ประมาณการข้อมูลโภชนาการสำหรับ **"${dishName}"** (${unitText}) ให้เรียบร้อยครับ\n\n`;
      reply += `**ค่าพลังงานและสารอาหารโดยประมาณ:**\n`;
      reply += `- พลังงาน: **~${est.calories} kcal**\n`;
      reply += `- โปรตีน: **~${est.protein} g** | คาร์โบไฮเดรต: **~${est.carbs} g** | ไขมัน: **~${est.fat} g**\n\n`;

      if (sims.length > 0) {
        reply += `**เมนูใกล้เคียงหรือใช้ทดแทนกันได้ในระบบ:**\n`;
        sims.forEach((item, idx) => {
          const s = item.serving || { calories: 150, protein: 0, carbs: 0, fat: 0, unit: "จาน" };
          reply += `${idx + 1}. **${item.name}** (**${s.calories} kcal**) — ${item.reason || "โภชนาการใกล้เคียง"}\n`;
        });
        reply += `\n`;
      }

      const logData = {
        name: dishName,
        calories: est.calories,
        protein: est.protein,
        carbs: est.carbs,
        fat: est.fat,
        unit: unitText,
      };
      reply += `[LOG_FOOD_ACTION:${JSON.stringify(logData)}]\n\n`;
      reply += `*คุณสามารถกดปุ่มบันทึกด้านบนเพื่อบันทึก **${dishName}** หรือเลือกเมนูแนะนำเข้าสู่ตารางประจำวันได้ทันทีครับ*`;
      return reply;
    }
  }

  // --- SUB-CASE 5: Today's Summary & Remaining Calories (วันนี้กินไปกี่แคล / สรุปแคลอรี่ / เหลืออีกกี่แคล) ---
  if (lower.includes("วันนี้") || lower.includes("กินไป") || lower.includes("เหลือ") || lower.includes("สรุป")) {
    let msg = `วันนี้คุณรับประทานไปแล้วประมาณ **${Math.round(totalCal)} kcal** จากเป้าหมาย **${targetCal} kcal** (คงเหลือประมาณ **${remainingCal} kcal**) ครับ 🍽️\n\n`;
    msg += `**สรุปสารอาหารที่ได้รับ:**\n- 🍗 โปรตีน: **${Math.round(totalPro * 10) / 10} g**\n- 🍚 คาร์โบไฮเดรต: **${Math.round(totalCarb * 10) / 10} g**\n- 🥑 ไขมัน: **${Math.round(totalFat * 10) / 10} g**\n\n`;

    if (foodLogs.length > 0) {
      msg += `**รายการมื้ออาหารวันนี้:**\n`;
      foodLogs.forEach((l, idx) => {
        const itemNames = (l.items || []).map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(", ");
        msg += `${idx + 1}. [${l.mealType}] ${itemNames || "มื้ออาหาร"} — **${Math.round(l.totalCalories)} kcal**\n`;
      });
    } else {
      msg += `*(ยังไม่มีการบันทึกอาหารสำหรับวันนี้ สามารถพิมพ์ชื่ออาหาร หรือกดรูปกล้อง 📷 เพื่อสแกนและบันทึกได้ทันทีครับ)*`;
    }
    return msg;
  }

  // --- SUB-CASE 6: BMR & TDEE Calculation ---
  if (lower.includes("bmr") || lower.includes("tdee") || lower.includes("ควรทานกี่แคล") || lower.includes("วันละกี่แคล")) {
    return [
      `FitAI คำนวณอัตราการเผาผลาญพลังงาน (BMR & TDEE) ให้คุณเรียบร้อยครับ 📊`,
      "",
      `👤 **ข้อมูลสรีระ:** ส่วนสูง ${height} ซม. | น้ำหนัก ${weight} กก. | อายุ ${age} ปี`,
      "",
      `- **BMR (Basal Metabolic Rate):** **${Math.round(bmr)} kcal/วัน** (พลังงานขั้นต่ำที่ร่างกายใช้เพื่อดำรงชีพขณะพักผ่อน)`,
      `- **TDEE (Total Daily Energy Expenditure):** **${targetCal} kcal/วัน** (พลังงานรวมทั้งหมดที่ร่างกายเผาผลาญใน 1 วันตามกิจกรรม)`,
      "",
      `🎯 **คำแนะนำในการตั้งเป้าหมายแคลอรี่:**`,
      `- 🔥 **เพื่อลดไขมัน / ลดน้ำหนัก:** ทานวันละ **${Math.round(targetCal - 400)} kcal** (ขาดดุลอย่างปลอดภัย)`,
      `- ⚖️ **เพื่อรักษาน้ำหนักและสุขภาพ:** ทานวันละ **${targetCal} kcal**`,
      `- 💪 **เพื่อสร้างกล้ามเนื้อ:** ทานวันละ **${Math.round(targetCal + 250)} kcal** ควบคู่กับการเวทเทรนนิ่ง`,
    ].join("\n");
  }

  return null;
}
async function generateAIResponse(message, context = {}) {
    let answer = "";

    // 0.1 Lazy load User Learned Context from Chat History
    if (!context.userLearnedContext && context.userId) {
        try {
            context.userLearnedContext = await getUserLearnedContext(context.userId);
        } catch (learnErr) {
            console.warn("Could not retrieve learned context for user:", learnErr.message);
        }
    }

    // 0.2 Check if Google Search is requested or needed
    const searchCheck = shouldSearchGoogle(message);
    if (searchCheck.shouldSearch && !context.searchData) {
        try {
            context.searchData = await searchGoogle(searchCheck.query);
        } catch (searchErr) {
            console.warn("Google search failed in generateAIResponse:", searchErr.message);
        }
    }

    // 0.3 If user explicitly requested to search Google / web, prioritize live search response
    if (searchCheck.shouldSearch && searchCheck.reason === 'explicit_request' && context.searchData?.results?.length) {
        const ollamaSearchResponse = await askOllama(message, context);
        if (ollamaSearchResponse) {
            return await enrichResponseWithVideos(ollamaSearchResponse, message);
        }
        return formatSearchResultsForFallback(context.searchData);
    }

    // 0. Emergency Red Flag Triage (Highest Priority - Medical Safety 1669)
    const emergencyCheck = matchCoachingIntent(message);
    if (emergencyCheck && emergencyCheck.emergency) {
        return emergencyCheck.expected_response;
    }

    // 0. Self-introduction & Capabilities Guard
    const isSelfIntroOrCapabilities = /(แนะนำตัว|คุณคือใคร|คุณเป็นใคร|ช่วยอะไรได้บ้าง|ทำอะไรได้บ้าง|ฟังก์ชันเด่น|ฟังก์ชันของ|ความสามารถ|ระบบทำอะไร|แนะนำ.*fitai|fitai.*คืออะไร|มีฟังก์ชันอะไร|แนะนำระบบ|ฟังก์ชัน.*มีอะไร)/i.test(String(message || ""));
    if (isSelfIntroOrCapabilities) {
        return getFitAICapabilitiesResponse(context);
    }

    // 0. Strict Fitness Scope Guardrail: Do not answer non-fitness/tech/coding/political topics
    const isNonFitnessQuery = /(เขียนโค้ด|python|javascript|c\+\+|php|html|css|sql|เขียนโปรแกรม|แจกโค้ด|แก้บั๊ก|การเมือง|หุ้น|คริปโต|หวย|ดูดวง|ซ่อมรถ|ข่าวบันเทิง)/i.test(String(message || ""));
    if (isNonFitnessQuery) {
        return "เรื่องนี้อยู่นอกเหนือขอบเขตเทรนเนอร์ฟิตเนสของผมเลยครับ 😅 FitAI ถูกออกแบบมาเพื่อดูแลสุขภาพ แนะนำการออกกำลังกาย และวางแผนโภชนาการฟิตเนสโดยเฉพาะครับ! หากมีข้อสงสัยเรื่องท่าฝึก ตารางออกกำลังกาย หรือเมนูอาหารเพื่อสุขภาพ สอบถามผมได้เต็มที่เลยครับ! 💪";
    }

    // 0. Food & Calorie Tracking Handler
    const foodResponse = handleFoodAndNutritionQuery(message, context);
    if (foodResponse) {
        return foodResponse;
    }

    // 1. If plan was updated, return the authoritative synchronized plan response
    if (context.planUpdated && context.activePlan) {
        answer = formatActivePlan(context.activePlan, context.profile);
        return await enrichResponseWithVideos(answer, message);
    }

    // 2. If user is asking for exercise recommendation / advice / today's poses, strictly adhere to the table
    const isRecRequest = !isSelfIntroOrCapabilities && /(แนะนำ.*(ท่า|การออกกำลัง|โปรแกรมการฝึก)|ควรออก.*ท่า|มีท่า.*แนะนำ|ท่า.*เหมาะกับ|วันนี้.*(ออก|ฝึก).*ท่า|ท่าอะไร(ดี|บ้าง)?|ช่วยเลือกท่า|ขอท่า|ท่าที่ต้องออก|ออกกำลังกาย.*ท่าไหน)/i.test(message);
    if (context.activePlan && isRecRequest) {
        answer = formatActivePlanRecommendation(context.activePlan, context.profile);
        return await enrichResponseWithVideos(answer, message);
    }

    // 3. If starting plan change without details
    if (isStartingPlanChange(message)) {
        const prompt = [
            "ผู้ใช้ต้องการเปลี่ยนแผนออกกำลังกาย แต่ยังไม่ได้ระบุความต้องการ",
            "ตอบเป็นภาษาไทยอย่างกระชับ และถามคำถามเดียวเพื่อเก็บข้อมูลก่อนปรับแผน",
            "ให้ผู้ใช้เลือกหรือบอก: เป้าหมาย, ส่วนร่างกายที่อยากเน้น, ระดับความหนัก, เวลาที่มี, อุปกรณ์ และอาการเจ็บ/ข้อจำกัด",
            "ยังห้ามเสนอหรือเปลี่ยนรายการท่าออกกำลังกายในตอนนี้",
        ].join("\n");
        const ollamaResponse = await askOllama(prompt, context);
        answer = ollamaResponse || generateFallbackResponse(message, context);
    } else {
        const ollamaResponse = await askOllama(message, context);
        answer = ollamaResponse || generateFallbackResponse(message, context);
    }

    return await enrichResponseWithVideos(answer, message);
}

function uniqueNames(names) {
    return [...new Set(names.filter(Boolean))];
}

const THAI_EXERCISE_MAP = {
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

const FOCUS_CATEGORIES = {
    lower: {
        focusName: "ช่วงล่าง",
        primary: ["Squat", "Lunges", "Glute Bridge", "Bulgarian Split Squat", "Calf Raise", "Leg Press", "Chair Squat", "Sumo Squat", "Hip Thrust", "Donkey Kick", "Romanian Deadlift", "Forward Lunge", "Reverse Lunge", "Step Up"],
        lowImpact: ["Chair Squat", "Glute Bridge", "Calf Raise", "Sumo Squat", "Step Up", "Donkey Kick", "Leg Press"],
    },
    upper: {
        focusName: "ช่วงบน",
        primary: ["Push Up", "Push-up", "Decline Push-up", "Incline Push-up", "Wall Push Up", "Diamond Push-up", "Chest Dip", "Bodyweight Row", "Pull-up", "Inverted Row", "Superman", "Lateral Raise", "Shoulder Press", "Biceps Curl", "Triceps Dip"],
        lowImpact: ["Wall Push Up", "Incline Push-up", "Bodyweight Row", "Superman", "Decline Push-up"],
    },
    core: {
        focusName: "แกนกลางลำตัว",
        primary: ["Plank", "Crunch", "Bicycle Crunch", "Russian Twist", "Dead Bug", "Bird Dog", "Side Plank", "Leg Raise", "Mountain Climber", "Reverse Crunch", "Sit-up"],
        lowImpact: ["Bird Dog", "Dead Bug", "Plank", "Glute Bridge", "Side Plank"],
    },
    cardio: {
        focusName: "คาร์ดิโอและความทนทาน",
        primary: ["Jumping Jack", "High Knees", "Burpee", "Squat Jump", "Skater", "March In Place", "Jump Rope"],
        lowImpact: ["March In Place", "Step Up", "Walking", "Stationary Bike"],
    },
    full: {
        focusName: "ทั้งร่างกาย",
        primary: ["Burpee", "Squat", "Push Up", "Plank", "Lunges", "Jumping Jack", "Glute Bridge"],
        lowImpact: ["Chair Squat", "Wall Push Up", "Glute Bridge", "Bird Dog", "March In Place"],
    },
    mobility: {
        focusName: "ฟื้นฟูและยืดเหยียด",
        primary: ["Cat Cow", "Arm Circles", "Bird Dog", "Dead Bug", "Glute Bridge"],
        lowImpact: ["Cat Cow", "Arm Circles", "Bird Dog", "Dead Bug", "Glute Bridge"],
    },
};

function extractTargetExercise(text, exercises = []) {
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

const TUTORIAL_VERBS_REGEX = /(ยืนตรง|โดยวาง|ขับขา|เมื่อ|ปรับตำแหน่ง|กลับ.*คืน|เริ่มต้น|ให้หายใจ|หายใจเข้า|หายใจออก|ยืดขา|งอข้อศอก|งอเข่า|เกร็งหน้าท้อง|เกร็งลำตัว|เกร็งกล้ามเนื้อ|ก้าวเท้า|วางเท้า|ส่งน้ำหนัก|ระดับศีรษะ|ระดับสายตา|ลำตัวตรง|หลังตรง|ค่อยๆ|ดันตัว|ดึงตัว|ทำซ้ำ|ค้างไว้|ระวัง|อย่าให้|วางมือ|วางฝ่ามือ|ยุบข้อศอก|ย่อสะโพก|ลุกขึ้นยืน|โน้มตัว|สูดลมหายใจ)/i;

function isInstructionSentence(str) {
    if (!str) return false;
    const clean = str.trim();
    if (clean.length > 35) return true;
    if (TUTORIAL_VERBS_REGEX.test(clean)) return true;
    return false;
}

function extractExercisesFromAssistantText(text, availableExercises = []) {
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

function cleanExerciseName(name) {
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

function sanitizePlan(plan) {
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


const DAYS_OF_WEEK_SCHEDULE = [
  { key: "monday", label: "วันจันทร์" },
  { key: "tuesday", label: "วันอังคาร" },
  { key: "wednesday", label: "วันพุธ" },
  { key: "thursday", label: "วันพฤหัสบดี" },
  { key: "friday", label: "วันศุกร์" },
  { key: "saturday", label: "วันเสาร์" },
  { key: "sunday", label: "วันอาทิตย์" },
];

const HIGH_IMPACT_EXERCISES_LIST = [
  "Jumping Jack", "Burpee", "Squat Jump", "High Knees", "Jump Rope",
  "Jogging", "Skater", "Shuffle Dance Workout", "Zumba", "Aerobic Dance",
  "Football", "Basketball", "Badminton", "Tennis", "Volleyball"
];

const KNEE_SAFE_EXERCISES_LIST = [
  "Chair Squat", "Glute Bridge", "Wall Push Up", "Calf Raise", "Standing Calf Raise",
  "Donkey Kick", "Fire Hydrant", "Bird Dog", "Dead Bug", "Side Plank",
  "Plank", "Arm Circles", "Cat Cow", "March In Place", "Leg Press",
  "Seated Row", "Bench Press", "Biceps Curl", "Triceps Dip", "Incline Push-up"
];

const DUMBBELL_EXERCISES_LIST = [
  "Biceps Curl", "Hammer Curl", "Concentration Curl", "Arnold Press", "Shoulder Press",
  "Lateral Raise", "Front Raise", "Reverse Fly", "Chest Fly", "Dumbbell Skull Crusher",
  "Romanian Deadlift", "Single-leg Romanian Deadlift", "Triceps Kickback",
  "Overhead Triceps Extension", "Upright Row"
];

function parseUserPlanRequirements(prompt, profile) {
  const text = String(prompt || "").toLowerCase();

  const specificDays = [];
  if (/(จันทร์|mon)/i.test(text)) specificDays.push("monday");
  if (/(อังคาร|tue)/i.test(text)) specificDays.push("tuesday");
  if (/(พุธ|wed)/i.test(text)) specificDays.push("wednesday");
  if (/(พฤหัส|thu)/i.test(text)) specificDays.push("thursday");
  if (/(ศุกร์|fri)/i.test(text)) specificDays.push("friday");
  if (/(เสาร์|sat)/i.test(text)) specificDays.push("saturday");
  if (/(อาทิตย์|sun)/i.test(text)) specificDays.push("sunday");

  let trainingDays = null;
  const restMatch = text.match(/พัก\s*(\d+)\s*(?:วัน|day)/i);
  const daysMatch = text.match(/(\d+)\s*(?:วัน|day)/i);

  if (restMatch) {
    const restCount = parseInt(restMatch[1], 10);
    trainingDays = Math.max(1, Math.min(6, 7 - restCount));
  } else if (daysMatch && !/(15|20|30|40|45|50|60)\s*นาที/i.test(daysMatch[0])) {
    trainingDays = Math.max(1, Math.min(7, parseInt(daysMatch[1], 10)));
  } else if (/(สองวัน|2 วัน)/i.test(text)) {
    trainingDays = 2;
  } else if (/(สามวัน|3 วัน)/i.test(text)) {
    trainingDays = 3;
  } else if (/(สี่วัน|4 วัน)/i.test(text)) {
    trainingDays = 4;
  } else if (/(ห้าวัน|5 วัน)/i.test(text)) {
    trainingDays = 5;
  } else if (/(หกวัน|6 วัน)/i.test(text)) {
    trainingDays = 6;
  } else if (/(ทุกวัน|7 วัน)/i.test(text)) {
    trainingDays = 7;
  } else if (/(เสาร์\s*อาทิตย์|วันหยุด)/i.test(text) && !/(จันทร์|อังคาร|พุธ|พฤหัส|ศุกร์)/i.test(text)) {
    trainingDays = 2;
    if (specificDays.length === 0) specificDays.push("saturday", "sunday");
  } else if (specificDays.length > 0) {
    trainingDays = specificDays.length;
  }

  const hasKneePain = /(เข่า|เจ็บเข่า|ปวดเข่า|ข้อเข่า|ไม่กระโดด|ห้ามกระโดด|เลี่ยงกระโดด|เซฟเข่า|low\s*impact|แรงกระแทกต่ำ)/i.test(text);
  const hasBackPain = /(หลัง|เจ็บหลัง|ปวดหลัง|หลังล่าง|lower\s*back)/i.test(text);
  const hasWristPain = /(ข้อมือ|เจ็บข้อมือ|ปวดข้อมือ)/i.test(text);
  const isBeginner = /(มือใหม่|เพิ่งเริ่ม|ไม่เคยออก|เหนื่อยง่าย|beginner)/i.test(text);
  const isAdvanced = /(แอดวานซ์|ระดับสูง|หนักๆ|หนักหน่วง|advanced)/i.test(text);

  const isFatLoss = /(ลดไขมัน|ลดน้ำหนัก|เบิร์น|คาร์ดิโอ|ผอม|ลีน|burn|fat\s*loss|cardio|hiit|weight\s*loss)/i.test(text);
  const isMuscle = /(สร้างกล้าม|เพิ่มกล้าม|กล้ามเนื้อ|เพิ่มขนาด|ยกเวท|เวทเทรนนิ่ง|hypertrophy|muscle|strength|bulk)/i.test(text);
  const isTone = /(กระชับ|เฟิร์ม|ฟิต|สัดส่วน|tone|shape)/i.test(text);
  const isMobility = /(ยืดเหยียด|ฟื้นฟู|โยคะ|mobility|stretch|flexibility)/i.test(text);

  const targetChest = /(อก|หน้าอก|chest)/i.test(text);
  const targetArm = /(แขน|ต้นแขน|ไทรเซป|ไบเซป|arm|bicep|tricep)/i.test(text);
  const targetBack = /(หลัง|ปีกหลัง|back|lat)/i.test(text);
  const targetShoulder = /(ไหล่|หัวไหล่|shoulder)/i.test(text);
  const targetLower = /(ขา|ก้น|สะโพก|ต้นขา|lower|leg|glute|butt|thigh)/i.test(text);
  const targetCore = /(หน้าท้อง|พุง|เอว|แกนกลาง|core|abs|sixpack|เบิร์นพุง)/i.test(text);
  const targetFullBody = /(ทั่วตัว|ทั้งตัว|full\s*body)/i.test(text);

  const hasDumbbell = /(ดัมเบล|dumbbell|เวท)/i.test(text);
  const isBodyweightOnly = /(บอดี้เวท|bodyweight|ไม่ใช้อุปกรณ์|ไม่มีอุปกรณ์|ที่บ้าน)/i.test(text);

  let targetMinutes = 30;
  const timeMatch = text.match(/(\d+)\s*นาที/i);
  if (timeMatch) {
    targetMinutes = parseInt(timeMatch[1], 10);
  }

  const bmi = Number(profile?.bmi || 0);
  const age = Number(profile?.age || 0);
  const autoLowImpact = hasKneePain || bmi >= 28 || age >= 55;

  if (!trainingDays) {
    if (isBeginner) trainingDays = 3;
    else if (isFatLoss) trainingDays = 4;
    else if (isMuscle) trainingDays = 5;
    else trainingDays = 4;
  }

  return {
    rawPrompt: prompt,
    trainingDays,
    specificDays,
    hasKneePain,
    hasBackPain,
    hasWristPain,
    autoLowImpact,
    isBeginner,
    isAdvanced,
    isFatLoss,
    isMuscle,
    isTone,
    isMobility,
    targets: {
      chest: targetChest,
      arm: targetArm,
      back: targetBack,
      shoulder: targetShoulder,
      lower: targetLower,
      core: targetCore,
      fullBody: targetFullBody,
    },
    hasDumbbell,
    isBodyweightOnly,
    targetMinutes,
    bmi,
    age,
  };
}

async function customizeWeeklyPlan({ prompt, profile = {}, exercises = [], currentPlan = [] }) {
  const reqs = parseUserPlanRequirements(prompt, profile);
  const {
    trainingDays,
    specificDays,
    autoLowImpact,
    hasKneePain,
    hasBackPain,
    isBeginner,
    isMuscle,
    isFatLoss,
    targets,
    hasDumbbell,
    isBodyweightOnly,
    targetMinutes,
  } = reqs;

  const validDbNames = new Set(exercises.map((e) => e.name).filter(Boolean));

  let activeDayKeys = [];
  if (specificDays && specificDays.length > 0) {
    activeDayKeys = DAYS_OF_WEEK_SCHEDULE.map((d) => d.key).filter((k) => specificDays.includes(k));
  } else {
    switch (trainingDays) {
      case 1: activeDayKeys = ["wednesday"]; break;
      case 2: activeDayKeys = ["tuesday", "friday"]; break;
      case 3: activeDayKeys = ["monday", "wednesday", "friday"]; break;
      case 4: activeDayKeys = ["monday", "tuesday", "thursday", "friday"]; break;
      case 5: activeDayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday"]; break;
      case 6: activeDayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]; break;
      case 7: activeDayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]; break;
      default: activeDayKeys = ["monday", "tuesday", "thursday", "friday"]; break;
    }
  }

  const focusPlans = [];
  if (targets.chest || targets.arm) {
    focusPlans.push({ focus: "อกและไหล่ (Upper Push)", category: "upper_push" });
    focusPlans.push({ focus: "หลังและแขน (Upper Pull)", category: "upper_pull" });
    focusPlans.push({ focus: "ช่วงล่างและสะโพก (Lower Body)", category: "lower" });
    focusPlans.push({ focus: "แขนและหน้าท้อง (Arm & Core)", category: "arm" });
    focusPlans.push({ focus: "ทั่วร่างกายเผาผลาญ (Full Body)", category: "full" });
    focusPlans.push({ focus: "แกนกลางและความทนทาน (Core & Cardio)", category: "cardio" });
    focusPlans.push({ focus: "ฟื้นฟูและยืดเหยียด (Active Recovery)", category: "mobility" });
  } else if (targets.lower) {
    focusPlans.push({ focus: "ต้นขาและสะโพก (Legs & Glutes)", category: "lower" });
    focusPlans.push({ focus: "แกนกลางและหน้าท้อง (Core & Abs)", category: "core" });
    focusPlans.push({ focus: "ช่วงบนและแขน (Upper Body)", category: "upper_push" });
    focusPlans.push({ focus: "ช่วงล่างและน่อง (Lower Power)", category: "lower" });
    focusPlans.push({ focus: "คาร์ดิโอเผาผลาญ (Fat Burn Cardio)", category: "cardio" });
    focusPlans.push({ focus: "ทั่วร่างกาย (Full Body)", category: "full" });
    focusPlans.push({ focus: "ฟื้นฟูและยืดเหยียด (Mobility)", category: "mobility" });
  } else if (targets.core) {
    focusPlans.push({ focus: "แกนกลางและหน้าท้อง (Core & Six-pack)", category: "core" });
    focusPlans.push({ focus: "ช่วงบนและอก (Upper Push)", category: "upper_push" });
    focusPlans.push({ focus: "ช่วงล่างและขา (Lower Body)", category: "lower" });
    focusPlans.push({ focus: "เอวและหน้าท้องส่วนลึก (Deep Core)", category: "core" });
    focusPlans.push({ focus: "คาร์ดิโอเผาผลาญพุง (Fat Burn Cardio)", category: "cardio" });
    focusPlans.push({ focus: "ทั่วร่างกาย (Full Body)", category: "full" });
    focusPlans.push({ focus: "ฟื้นฟูกล้ามเนื้อ (Mobility)", category: "mobility" });
  } else if (isFatLoss) {
    focusPlans.push({ focus: "คาร์ดิโอและช่วงล่าง (Cardio & Lower Burn)", category: "cardio" });
    focusPlans.push({ focus: "ช่วงบนและแกนกลางลำตัว (Upper & Core)", category: "upper_push" });
    focusPlans.push({ focus: "คาร์ดิโอความทนทาน (Endurance Burn)", category: "cardio" });
    focusPlans.push({ focus: "ทั่วร่างกายสลายไขมัน (Full Body Circuit)", category: "full" });
    focusPlans.push({ focus: "แกนกลางและหน้าท้อง (Core Burn)", category: "core" });
    focusPlans.push({ focus: "คาร์ดิโอเบิร์นต่อเนื่อง (HIIT Cardio)", category: "cardio" });
    focusPlans.push({ focus: "ยืดเหยียดและฟื้นฟู (Active Recovery)", category: "mobility" });
  } else if (isMuscle) {
    focusPlans.push({ focus: "กล้ามเนื้ออกและไหล่ (Chest & Shoulders)", category: "upper_push" });
    focusPlans.push({ focus: "กล้ามเนื้อหลังและแขน (Back & Arms)", category: "upper_pull" });
    focusPlans.push({ focus: "กล้ามเนื้อขาและสะโพก (Quads & Glutes)", category: "lower" });
    focusPlans.push({ focus: "ไหล่และแกนกลางลำตัว (Shoulders & Core)", category: "upper_push" });
    focusPlans.push({ focus: "ทั่วร่างกายสร้างพลัง (Full Body Power)", category: "full" });
    focusPlans.push({ focus: "แขนและหน้าท้อง (Arms & Abs)", category: "arm" });
    focusPlans.push({ focus: "ยืดเหยียดกล้ามเนื้อ (Mobility)", category: "mobility" });
  } else {
    focusPlans.push({ focus: "กล้ามเนื้อช่วงล่าง (Lower Body)", category: "lower" });
    focusPlans.push({ focus: "กล้ามเนื้อช่วงบน (Upper Body)", category: "upper_push" });
    focusPlans.push({ focus: "แกนกลางลำตัว (Core & Abs)", category: "core" });
    focusPlans.push({ focus: "คาร์ดิโอและความทนทาน (Cardio)", category: "cardio" });
    focusPlans.push({ focus: "ทั่วร่างกาย (Full Body)", category: "full" });
    focusPlans.push({ focus: "ฟื้นฟูและยืดเหยียด (Mobility)", category: "mobility" });
    focusPlans.push({ focus: "แอโรบิกและฟื้นฟู (Active Recovery)", category: "cardio" });
  }

  const isRestrictedImpact = autoLowImpact || hasKneePain;

  function filterSafeExercises(list) {
    let res = [...list];
    if (isRestrictedImpact) {
      res = res.filter((name) => !HIGH_IMPACT_EXERCISES_LIST.includes(name));
      if (res.length < 3) {
        res = [...res, ...KNEE_SAFE_EXERCISES_LIST.filter((e) => !res.includes(e))];
      }
    }
    if (hasBackPain) {
      res = res.filter((name) => !["Good Morning", "Deadlift", "Burpee"].includes(name));
    }
    if (hasDumbbell) {
      res.sort((a, b) => (DUMBBELL_EXERCISES_LIST.includes(b) ? 1 : 0) - (DUMBBELL_EXERCISES_LIST.includes(a) ? 1 : 0));
    } else if (isBodyweightOnly) {
      res = res.filter((name) => !DUMBBELL_EXERCISES_LIST.includes(name));
    }
    const existing = res.filter((name) => validDbNames.has(name));
    return existing.length >= 3 ? existing : res;
  }

  const categoryExerciseMap = {
    lower: filterSafeExercises([
      "Chair Squat", "Glute Bridge", "Squat", "Lunges", "Bulgarian Split Squat",
      "Calf Raise", "Sumo Squat", "Hip Thrust", "Donkey Kick", "Step Up",
      "Leg Press", "Standing Calf Raise", "Romanian Deadlift"
    ]),
    upper_push: filterSafeExercises([
      "Push Up", "Chest Fly", "Shoulder Press", "Wall Push Up", "Incline Push-up",
      "Lateral Raise", "Arnold Press", "Decline Push-up", "Diamond Push-up"
    ]),
    upper_pull: filterSafeExercises([
      "Seated Row", "Bodyweight Row", "Superman", "Reverse Fly", "Lat Pulldown",
      "Inverted Row", "Pull-up", "Biceps Curl", "Upright Row"
    ]),
    arm: filterSafeExercises([
      "Biceps Curl", "Hammer Curl", "Concentration Curl", "Triceps Dip",
      "Overhead Triceps Extension", "Triceps Kickback", "Arm Circles",
      "Wall Push Up", "Dumbbell Skull Crusher"
    ]),
    core: filterSafeExercises([
      "Plank", "Bird Dog", "Dead Bug", "Glute Bridge", "Side Plank",
      "Crunch", "Bicycle Crunch", "Russian Twist", "Leg Raise", "Reverse Crunch"
    ]),
    cardio: filterSafeExercises(
      isRestrictedImpact
        ? ["March In Place", "Stationary Bike", "Walking", "Step Up", "Elliptical", "Chair Squat"]
        : ["Jumping Jack", "High Knees", "Burpee", "March In Place", "Squat Jump", "Skater", "Jump Rope", "Stationary Bike"]
    ),
    full: filterSafeExercises([
      "Squat", "Push Up", "Glute Bridge", "Plank", "Lunges", "Bird Dog",
      "Chair Squat", "Wall Push Up", "March In Place"
    ]),
    mobility: filterSafeExercises([
      "Cat Cow", "Arm Circles", "Bird Dog", "Dead Bug", "Glute Bridge"
    ]),
  };

  const usedPrimaryNames = new Set();
  let activeIndex = 0;

  const plan = DAYS_OF_WEEK_SCHEDULE.map((day, dayIndex) => {
    const isActive = activeDayKeys.includes(day.key);

    if (!isActive) {
      return {
        key: day.key,
        label: day.label,
        focus: "พักผ่อนและฟื้นฟู",
        exerciseName: "Rest",
        exercises: [],
        sets: "",
        repetitions: "พักผ่อน / ยืดเหยียดเบา ๆ",
        reason: isRestrictedImpact
          ? "วันพักฟื้นฟูข้อต่อและกล้ามเนื้อตามหลักวิทยาศาสตร์การกีฬาเพื่อป้องกันการบาดเจ็บ"
          : "วันพักผ่อนเพื่อให้เส้นใยกล้ามเนื้อซ่อมแซมและเติบโตอย่างเต็มที่",
        dayIndex,
        isRest: true,
      };
    }

    const planConfig = focusPlans[activeIndex % focusPlans.length];
    activeIndex++;

    const pool = categoryExerciseMap[planConfig.category] || categoryExerciseMap.lower;
    const exerciseCount = targetMinutes <= 20 ? 3 : targetMinutes <= 35 ? 4 : 5;

    let primaryName = pool.find((name) => !usedPrimaryNames.has(name)) || pool[0] || "Squat";
    usedPrimaryNames.add(primaryName);

    const remainingInPool = pool.filter((name) => name !== primaryName);
    const selectedExerciseNames = [primaryName, ...remainingInPool.slice(0, exerciseCount - 1)];

    const defaultSets = isBeginner ? 2 : isMuscle ? (targets.chest || targets.arm ? 4 : 3) : 3;
    const defaultReps =
      planConfig.category === "cardio"
        ? isRestrictedImpact ? "30–45 วินาที" : "45–60 วินาที"
        : planConfig.category === "mobility"
        ? "8–10 นาที"
        : isMuscle
        ? "8–10 ครั้ง"
        : isFatLoss
        ? "12–15 ครั้ง"
        : "10–12 ครั้ง";

    const dailyExercises = selectedExerciseNames.map((name) => {
      const isTimeBased = /(Plank|Dead Bug|Bird Dog|March In Place|Cat Cow|Stationary Bike)/i.test(name);
      return {
        name,
        sets: defaultSets,
        repetitions: isTimeBased ? "30–45 วินาที" : defaultReps,
      };
    });

    let reason = `AI คำนวณตารางเน้นกลุ่ม ${planConfig.focus}`;
    if (isRestrictedImpact) {
      reason += " โดยคัดกรองเฉพาะท่าที่ปลอดภัยต่อข้อเข่า (Low Impact)";
    }
    if (hasDumbbell) {
      reason += " พร้อมเพิ่มท่าฝึกด้วยดัมเบล";
    }

    return {
      key: day.key,
      label: day.label,
      focus: planConfig.focus,
      exerciseName: primaryName,
      exercises: dailyExercises,
      sets: defaultSets,
      repetitions: dailyExercises[0]?.repetitions || defaultReps,
      reason,
      dayIndex,
      isRest: false,
    };
  });

  const workoutDaysCount = activeDayKeys.length;
  const restDaysCount = 7 - workoutDaysCount;

  const badges = [
    `ฝึก ${workoutDaysCount} วัน / สัปดาห์`,
    `พัก ${restDaysCount} วัน ฟื้นฟูกล้ามเนื้อ`,
  ];
  if (isRestrictedImpact) badges.push("เซฟข้อเข่า (Low Impact)");
  if (isFatLoss) badges.push("เป้าหมาย: เผาผลาญไขมัน");
  if (isMuscle) badges.push("เป้าหมาย: สร้างกล้ามเนื้อ");
  if (hasDumbbell) badges.push("อุปกรณ์: ดัมเบล");
  if (isBeginner) badges.push("ระดับ: เริ่มต้น (ปลอดภัย)");
  badges.push(`เวลา: ${targetMinutes} นาที / วัน`);

  const activeDayNamesThai = activeDayKeys.map((k) => DAYS_OF_WEEK_SCHEDULE.find((d) => d.key === k)?.label).join(", ");
  const summary = `${isFatLoss ? "แผนลดไขมัน" : isMuscle ? "แผนสร้างกล้ามเนื้อ" : "แผนออกกำลังกายเฉพาะบุคคล"} ${workoutDaysCount} วัน ${isRestrictedImpact ? "(Low Impact เซฟข้อเข่า)" : ""}`;

  const strategy = `AI คำนวณและจัดตารางสัปดาห์นี้ตามความต้องการของคุณเรียบร้อยแล้วครับ: จัดโปรแกรมฝึก ${workoutDaysCount} วัน (${activeDayNamesThai}) สลับวันพัก ${restDaysCount} วัน ${isRestrictedImpact ? "โดยคัดกรองท่ากระโดดและแรงกระแทกออกทั้งหมดเพื่อความปลอดภัยสูงสุดของข้อเข่า " : ""}${hasDumbbell ? "พร้อมเสริมท่าดัมเบลตามที่ต้องการ " : ""}คุมระดับความหนักและเวลาฝึก ${targetMinutes} นาทีต่อวัน`;

  // Format rich chat message with week breakdown
  const dayBreakdown = plan.map((day) => {
    if (day.isRest) {
      return `• **${day.label}**: พักผ่อนและฟื้นฟูร่างกาย`;
    }
    const exList = day.exercises.map((e) => `${e.name} (${e.sets} เซ็ต · ${e.repetitions})`).join(", ");
    return `• **${day.label}** (${day.focus}): ${exList}`;
  }).join("\n");

  const chatMessageRaw = `FitAI จัดตารางออกกำลังกายทั้งสัปดาห์ให้คุณใหม่ตามความต้องการเรียบร้อยแล้วครับ!\n\n**กลยุทธ์การฝึก:** ${strategy}\n\n**ตารางการฝึกประจำสัปดาห์ (7 วัน):**\n${dayBreakdown}\n\nตารางในระบบได้รับการอัปเดตเรียบร้อยแล้วครับ สามารถเริ่มฝึกได้ทันที!`;
  const chatMessage = await enrichResponseWithVideos(chatMessageRaw);

  return {
    plan,
    summary,
    strategy,
    trainingDaysCount: workoutDaysCount,
    restDaysCount,
    badges,
    chatMessage,
  };
}


async function suggestPlanAdjustment({ profile, exercises = [], plan = [], message, todayKey, lastAssistantMessage = "" }) {
    const lowerMessage = String(message || "").toLowerCase();

    // Guard: Self-introduction / Capabilities query must not adjust plan
    const isSelfIntroOrCapabilities = /(แนะนำตัว|คุณคือใคร|คุณเป็นใคร|ช่วยอะไรได้บ้าง|ทำอะไรได้บ้าง|ฟังก์ชันเด่น|ฟังก์ชันของ|ความสามารถ|ระบบทำอะไร|แนะนำ.*fitai|fitai.*คืออะไร|มีฟังก์ชันอะไร|แนะนำระบบ|ฟังก์ชัน.*มีอะไร)/i.test(lowerMessage);
    if (isSelfIntroOrCapabilities) {
        return { plan, changed: false, message: "" };
    }

    // Check if user requested a whole-week plan adjustment or customization
    const isWholeWeek = /(ทั้งสัปดาห์|ทั้งอาทิตย์|ตลอดสัปดาห์|ตารางสัปดาห์|ปรับแผนทั้ง|จัดตารางทั้ง|จัดตารางใหม่|ปรับตารางใหม่|แผนใหม่ทั้ง|ตารางใหม่|\d+\s*วันต่อสัปดาห์|\d+\s*วันต่ออาทิตย์|เล่น\s*\d+\s*วัน|พัก\s*\d+\s*วัน|เฉพาะวันหยุด)/i.test(lowerMessage);
    if (isWholeWeek) {
        const customized = await customizeWeeklyPlan({ prompt: message, profile, exercises, currentPlan: plan });
        return {
            plan: sanitizePlan(customized.plan),
            changed: true,
            message: customized.chatMessage,
            summary: customized.summary,
            strategy: customized.strategy,
            badges: customized.badges,
        };
    }
    const targetIndex = Math.max(0, plan.findIndex((day) => day.key === todayKey));
    const current = plan[targetIndex] || { key: todayKey, focus: "ช่วงล่าง", exercises: [] };
    const allowed = exercises.map((exercise) => exercise.name).filter(Boolean);

        // Check anaphoric references from previous assistant recommendation
    const isAnaphoric = /(ท่านี้|ท่าเหล่านี้|ท่าพวกนี้|ตามนี้|ที่แนะนำ|ที่บอก|ท่านั้น|ท่าข้างบน|เอาท่านี้|นำท่านี้|ใช้ท่านี้|จัดตามนี้|อัปเดตตามนี้|ใส่ตารางของวันนี้|ใช้ในตาราง|ใส่ตาราง|นำมาใช้ในตาราง|นำไปใช้ในตาราง|เพิ่มในตาราง|ลงตาราง)/i.test(lowerMessage);
    if (isAnaphoric && lastAssistantMessage) {
        const extracted = extractExercisesFromAssistantText(lastAssistantMessage, exercises);
        if (extracted && extracted.exercises.length > 0) {
            const next = plan.map((day, i) => i === targetIndex ? {
                ...day,
                focus: extracted.focus || "ช่วงแขน",
                exerciseName: extracted.exercises[0].name,
                exercises: extracted.exercises,
                reason: "AI อัปเดตตารางตามท่าที่แนะนำให้ผู้ใช้ล่าสุด",
            } : day);
            const exerciseListStr = extracted.exercises
                .map((e, i) => `${i + 1}. **${e.name}** (${e.sets ? `${e.sets} เซ็ต · ` : ""}${e.repetitions})`)
                .join("\n");
            const dayLabels = {
                monday: "จันทร์", tuesday: "อังคาร", wednesday: "พุธ",
                thursday: "พฤหัสบดี", friday: "ศุกร์", saturday: "เสาร์", sunday: "อาทิตย์"
            };
            const dayLabel = dayLabels[todayKey] || "วันนี้";
            const msg = `ตารางการออกกำลังกายสำหรับวัน${dayLabel} (**${extracted.focus || "การออกกำลังกาย"}**):\n\n**ท่าในตารางที่ต้องออกสำหรับวันนี้:**\n${exerciseListStr}\n\nตารางออกกำลังกายทางด้านขวาได้รับการอัปเดตตรงตามรายการนี้เรียบร้อยแล้วครับ สามารถคลิกดูคลิปวิดีโอสาธิตแต่ละท่าจาก YouTube ด้านล่างเพื่อฝึกฟอร์มที่ถูกต้องได้เลยครับ 🎯`;
            const enriched = await enrichResponseWithVideos(msg);
            return {
                plan: sanitizePlan(next),
                changed: true,
                message: enriched
            };
        }
    }

    // Check if user requested rest
    const wantsRest = /(พัก|เหนื่อย|ล้า|เจ็บ|ปวด|เมื่อย|ไม่ไหว|rest|tired|sore)/i.test(lowerMessage);
    if (wantsRest && !/(ไม่พัก|อยากออก|ขอท่า|เปลี่ยนเป็น)/i.test(lowerMessage)) {
        const next = plan.map((day, idx) => idx === targetIndex ? {
            ...day,
            focus: "พักผ่อนและฟื้นฟู",
            exerciseName: "Rest",
            exercises: [],
            sets: "",
            repetitions: "พักผ่อน / ยืดเหยียดเบา ๆ",
            reason: "AI ปรับเป็นวันพักตามที่ผู้ใช้แจ้งถึงความเหนื่อยล้า",
        } : day);
        return { plan: next, changed: true, message: "ผมปรับแผนของวันนี้เป็น “วันพักและฟื้นฟูร่างกาย” ให้เรียบร้อยแล้วครับ พักผ่อนและดื่มน้ำให้เพียงพอนะครับ" };
    }

    // Custom sets / reps request
    const setsMatch = lowerMessage.match(/(\d+)\s*เซ็ต/);
    const customSets = setsMatch ? Number(setsMatch[1]) : null;
    const repsMatch = lowerMessage.match(/(\d+[-–]\d+|\d+)\s*(?:ครั้ง|วินาที|นาที)/);
    const customReps = repsMatch ? repsMatch[0] : null;

    // Check if user specified a pose
    const requestedObj = extractTargetExercise(lowerMessage, exercises);
    const requested = requestedObj ? requestedObj.name : null;

    // Check if user specifically requested to replace an existing pose: "เปลี่ยนท่า [A] เป็น [B]"
    let replacedOldExercise = null;
    const replacePattern = /เปลี่ยน(?:ท่า)?\s+([A-Za-zก-๙\s\-]+?)\s+(?:เป็น|แทน|มาเป็น)\s+([A-Za-zก-๙\s\-]+)/i;
    const replaceMatch = lowerMessage.match(replacePattern);
    if (replaceMatch && replaceMatch[1]) {
        const oldTerm = replaceMatch[1].trim().toLowerCase();
        replacedOldExercise = (current.exercises || []).find((e) => {
            const eLow = e.name.toLowerCase();
            return eLow.includes(oldTerm) || oldTerm.includes(eLow);
        });
    }

    // Determine category focus
    const isArm = /(แขน|ต้นแขน|ไทรเซป|ไบเซป|bicep|tricep|arm)/i.test(lowerMessage);
    const isLower = /(ช่วงล่าง|ขา|ก้น|สะโพก|ต้นขา|lower|leg|squat|lunge)/i.test(lowerMessage);
    const isUpper = /(ช่วงบน|อก|หลัง|แขน|ไหล่|upper|push|pull|chest)/i.test(lowerMessage);
    const isCore = /(แกนกลาง|หน้าท้อง|พุง|เอว|core|abs|plank|crunch)/i.test(lowerMessage);
    const isCardio = /(คาร์ดิโอ|ลดน้ำหนัก|ลดไขมัน|เบิร์น|cardio|fat|burn|เดินเร็ว|วิ่ง|ปั่นจักรยาน)/i.test(lowerMessage);
    const isMobility = /(ยืดเหยียด|ฟื้นฟู|โยคะ|mobility|stretch)/i.test(lowerMessage);
    const isFull = /(ทั้งตัว|ทั้งร่างกาย|full\s*body)/i.test(lowerMessage);
    const isLowImpact = /(แรงกระแทกต่ำ|เจ็บเข่า|ปวดเข่า|ข้อเข่า|low\s*impact|เข่าไม่ดี|น้ำหนักเยอะ)/i.test(lowerMessage);

    let categoryKey = isArm ? "arm" : isLower ? "lower"
        : isUpper ? "upper"
        : isCore ? "core"
        : isCardio ? "cardio"
        : isMobility ? "mobility"
        : isFull ? "full"
        : null;

    if (!categoryKey) {
        if (requested) {
            const exObj = exercises.find((e) => e.name === requested);
            const cat = (exObj?.category || "").toLowerCase();
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
    const useLowImpact = isLowImpact || (profile?.bmi >= 25) || (profile?.age >= 50);
    const targetPool = useLowImpact && categoryInfo.lowImpact ? categoryInfo.lowImpact : categoryInfo.primary;

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

    // Case A: User replaced a single exercise in today's table
    if (requested && replacedOldExercise && Array.isArray(current.exercises) && current.exercises.length > 0) {
        const updatedExercises = current.exercises.map((ex) => {
            if (ex.name === replacedOldExercise.name) {
                return {
                    name: requested,
                    sets: customSets || ex.sets || 3,
                    repetitions: customReps || ex.repetitions || "10–12 ครั้ง",
                };
            }
            return {
                ...ex,
                sets: customSets || ex.sets,
                repetitions: customReps || ex.repetitions,
            };
        });

        const next = plan.map((day, index) => index === targetIndex ? {
            ...day,
            exerciseName: updatedExercises[0].name,
            exercises: updatedExercises,
            reason: `เปลี่ยนท่า ${replacedOldExercise.name} เป็น ${requested} ตามคำขอของผู้ใช้`,
            updatedAt: new Date().toISOString(),
        } : day);

        const exerciseListStr = updatedExercises.map((ex, i) => `${i + 1}. **${ex.name}** (${ex.sets ? `${ex.sets} เซ็ต · ` : ""}${ex.repetitions})`).join("\n");
        const msg = `FitAI ปรับตารางแผนออกกำลังกายวัน${dayLabel} ให้แล้วครับ โดยเปลี่ยนท่า ${replacedOldExercise.name} เป็น **${requested}** เรียบร้อยแล้วครับ:\n\n${exerciseListStr}`;
        const enriched = await enrichResponseWithVideos(msg);
        return { plan: next, changed: true, message: enriched };
    }

    // Case B: General adjustment or category switch
    let selectedNames = requested ? [requested] : [];
    let advice = "";

    if (!requested) {
        const allowedInCategory = targetPool.filter((p) => allowed.includes(p));
        const result = await askOllamaStructured([
            "You are a cautious fitness coach. Pick up to 5 exercise names only from the allowed list.",
            `User profile: age ${profile?.age ?? "unknown"}, BMI ${profile?.bmi ?? "unknown"}, status ${profile?.bmiStatus ?? "unknown"}.`,
            `Category focus: ${categoryInfo.focusName}. User request: ${message}`,
            `Allowed exercises: ${allowedInCategory.join(", ")}`,
            'Return JSON: {"exerciseNames":["exact allowed name"],"advice":"short Thai explanation"}',
        ].join("\n"));
        try {
            const parsed = result ? JSON.parse(result) : null;
            selectedNames = Array.isArray(parsed?.exerciseNames)
                ? parsed.exerciseNames.filter((name) => allowedInCategory.includes(name))
                : [];
            advice = typeof parsed?.advice === "string" ? parsed.advice.slice(0, 360) : "";
        } catch {
            selectedNames = [];
        }
    }

    const primaryName = requested || selectedNames[0] || targetPool.find((p) => allowed.includes(p)) || targetPool[0];
    const compPool = targetPool.filter((name) => name !== primaryName && allowed.includes(name));
    const validExisting = (current.exercises || [])
        .map((e) => e.name)
        .filter((n) => n !== primaryName && targetPool.includes(n));
    const names = uniqueNames([primaryName, ...selectedNames.slice(1), ...compPool, ...validExisting]).slice(0, 5);

    const existing = new Map((current.exercises || []).map((exercise) => [exercise.name, exercise]));
    const adjustedExercises = names.map((name) => {
        const prev = existing.get(name);
        return {
            name,
            sets: customSets || prev?.sets || (profile?.bmi >= 25 || profile?.age >= 50 ? 2 : 3),
            repetitions: customReps || prev?.repetitions || (categoryKey === "cardio" ? "30–45 วินาที" : "10–12 ครั้ง"),
        };
    });

    const next = plan.map((day, index) => index === targetIndex ? {
        ...day,
        focus: categoryInfo.focusName,
        exerciseName: adjustedExercises[0].name,
        exercises: adjustedExercises,
        sets: adjustedExercises[0].sets,
        repetitions: adjustedExercises[0].repetitions,
        reason: requested ? `เปลี่ยนท่าหลักเป็น ${requested} ตามคำขอของผู้ใช้` : `FitAI จัดท่าฝึกสำหรับกลุ่ม ${categoryInfo.focusName}`,
        updatedAt: new Date().toISOString(),
    } : day);

    const exerciseListStr = adjustedExercises.map((ex, i) => `${i + 1}. **${ex.name}** (${ex.sets ? `${ex.sets} เซ็ต · ` : ""}${ex.repetitions})`).join("\n");

    const source = requested
        ? `FitAI ปรับตารางแผนออกกำลังกายวัน${dayLabel} ให้แล้วครับ โดยเปลี่ยนท่าหลักเป็น **${requested}** พร้อมจัดท่าเสริมในกลุ่ม ${categoryInfo.focusName} ให้ครบชุดเรียบร้อยแล้วครับ:\n\n${exerciseListStr}`
        : `FitAI ปรับตารางแผนออกกำลังกายวัน${dayLabel} ให้เน้นกลุ่ม ${categoryInfo.focusName}${useLowImpact ? " (แรงกระแทกต่ำ)" : ""} เรียบร้อยแล้วครับ:\n\n${exerciseListStr}`;

    const rawMsg = advice ? `${source}\n\n${advice}` : source;
    const enrichedMsg = await enrichResponseWithVideos(rawMsg);
    return { plan: next, changed: true, message: enrichedMsg };
}

function generateWeeklyPlan({ profile, exercises = [] }) {
    const names = exercises.map((exercise) => exercise.name).filter(Boolean);
    const fallback = ["Chair Squat", "Wall Push Up", "Glute Bridge", "Bird Dog", "March In Place"];
    const choices = [...names, ...fallback];
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"].map((day, index) => ({
        day,
        focus: ["ช่วงล่าง", "ช่วงบน", "แกนกลางลำตัว", "คาร์ดิโอ", "ทั้งร่างกาย"][index],
        exercises: choices.slice(index, index + 5).map((name, offset) => ({
            name,
            sets: profile?.bmi >= 30 || profile?.age >= 60 ? 2 : 3,
            repetitions: index === 3 ? "30–45 วินาที" : `${8 + offset * 2}–${10 + offset * 2} ครั้ง`,
        })),
    }));
    return { days, generatedBy: "local-safe-plan" };
}

module.exports = {
    customizeWeeklyPlan,
    generateAIResponse,
    generateFallbackResponse,
    generateWeeklyPlan,
    suggestPlanAdjustment,
};
