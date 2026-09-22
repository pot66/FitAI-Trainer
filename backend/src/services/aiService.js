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

function generateFallbackResponse(message, context = {}) {
    const profile = context.profile || null;
    const workout = context.workout || [];

    const text = String(message || "").trim();
    const lowerText = text.toLowerCase();

    // 1. Off-topic Guardrail (อยู่นอกเหนือฟิตเนส/สุขภาพ)
    const isOffTopic = /(เขียนโค้ด|python|javascript|java|php|การเมือง|หุ้น|คริปโต|หวย|ดูดวง|ซ่อมรถ|ข่าวบันเทิง|ดารา)/i.test(lowerText);
    if (isOffTopic) {
        return "เรื่องนี้อยู่นอกเหนือสายงานโค้ชฟิตเนสของผมเลยครับ 😅 แต่ถ้าเป็นเรื่องการออกกำลังกาย วางแผนตารางฝึก ท่าฝึก หรือเมนูอาหารสุขภาพ สอบถาม FitAI ได้เต็มที่เลยครับ! วันนี้มีเป้าหมายอยากฟิตส่วนไหนเป็นพิเศษไหมครับ? 💪";
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

    // 5. Workout Advice / Routine Recommendations
    const isWorkoutAdviceQuery = /(แนะนำ|ควรออก|ท่าไหน|ตาราง|แผน|ออกกำลังกาย|ซ้อม|workout|exercise| routine)/i.test(lowerText);
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

  // If user is asking open-ended menu questions (e.g. "มีเมนูอื่นไหม", "กินอะไรดี", "แนะนำอาหาร"),
  // let it pass to Ollama so the AI answers freely with creative variety!
  const isGeneralMenuIdea = /(มีเมนูอื่น|เมนูอื่น|กินไรดี|กินอะไรดี|เบื่ออกไก่|แนะนำเมนู|แนะนำอาหาร|เมนูแนะนำ|มีอะไรกินบ้าง)/i.test(lower);
  if (isGeneralMenuIdea) {
    return null; // Passes through to askOllama or dynamic fallback!
  }
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

  // --- SUB-CASE A: Recommend Muscle-Building Food Menu (แนะนำเมนูอาหารเสริมกล้ามเนื้อ / เพิ่มกล้าม) ---
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

  // --- SUB-CASE B: Recommend Weight Loss / Low-Calorie Menu (แนะนำเมนูลดน้ำหนัก / คุมแคลอรี่ / อาหารคลีน) ---
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

  // --- SUB-CASE C: Specific Food Calorie Query (ข้าวมันไก่กี่แคล / คำนวณแคล ...) ---
  const extractResults = [];
  try {
    const db = require("../data/nutritionDatabase.json");
    for (const item of db) {
      for (const alias of [item.name, ...(item.aliases || [])]) {
        if (alias && alias.length >= 2 && lower.includes(alias.toLowerCase())) {
          if (!extractResults.some((f) => f.id === item.id)) {
            extractResults.push(item);
          }
          break;
        }
      }
    }
  } catch (err) {
    console.error("Failed to load nutritionDatabase in aiService:", err);
  }

  if (extractResults.length > 0 && (lower.includes("แคล") || lower.includes("กี่") || lower.includes("คำนวณ") || lower.includes("กิน") || lower.includes("เท่าไหร่") || lower.includes("เท่าไร") || lower.includes("จาน"))) {
    let responseText = `FitAI คำนวณข้อมูลโภชนาการและแคลอรี่ให้เรียบร้อยครับ 🍽️\n\n`;
    let totalFoundCal = 0;
    let totalFoundPro = 0;
    let totalFoundCarb = 0;
    let totalFoundFat = 0;

    extractResults.forEach((item, idx) => {
      const s = item.serving || { calories: item.per100g?.calories || 0, protein: 0, carbs: 0, fat: 0, unit: "จาน" };
      totalFoundCal += Number(s.calories) || 0;
      totalFoundPro += Number(s.protein) || 0;
      totalFoundCarb += Number(s.carbs) || 0;
      totalFoundFat += Number(s.fat) || 0;

      responseText += `### ${idx + 1}. **${item.name}** (${item.nameEn || ""})\n`;
      responseText += `- ⚡ พลังงาน: **${s.calories} kcal** (ต่อ 1 ${s.unit || "จาน"})\n`;
      responseText += `- 🍗 โปรตีน: **${s.protein} g** | 🍚 คาร์บ: **${s.carbs} g** | 🥑 ไขมัน: **${s.fat} g**\n\n`;
    });

    if (extractResults.length > 1) {
      responseText += `📊 **รวมทั้งหมด:** **${Math.round(totalFoundCal)} kcal** (โปรตีน ${Math.round(totalFoundPro * 10) / 10}g, คาร์บ ${Math.round(totalFoundCarb * 10) / 10}g, ไขมัน ${Math.round(totalFoundFat * 10) / 10}g)\n\n`;
    }

    const first = extractResults[0];
    const logActionData = {
      name: extractResults.map(i => i.name).join(" + "),
      calories: Math.round(totalFoundCal),
      protein: Math.round(totalFoundPro * 10) / 10,
      carbs: Math.round(totalFoundCarb * 10) / 10,
      fat: Math.round(totalFoundFat * 10) / 10,
      unit: first.serving?.unit || "จาน",
    };

    responseText += `[LOG_FOOD_ACTION:${JSON.stringify(logActionData)}]\n\n`;
    responseText += `💡 *คุณสามารถกดปุ่ม "บันทึกลงมื้ออาหาร" ด้านบนเพื่อบันทึกเข้าตารางแคลอรี่ประจำวันได้ทันทีครับ!*`;
    return responseText;
  }

  // --- SUB-CASE D: Today's Summary & Remaining Calories (วันนี้กินไปกี่แคล / สรุปแคลอรี่ / เหลืออีกกี่แคล) ---
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

  // --- SUB-CASE E: BMR & TDEE Calculation ---
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
    const isRecRequest = /(แนะนำ.*(ท่า|ออกกำลัง|การออกกำลัง|ทำอะไร|โปรแกรม)|ควรออก.*ท่า|มีท่า.*แนะนำ|ท่า.*เหมาะกับ|วันนี้.*(ออก|ทำ|ฝึก|ท่า)|(ออก|ทำ|ฝึก).*ท่าไหน|ท่าอะไร(ดี|บ้าง)?|ช่วยเลือกท่า|ขอท่า|ท่าที่ต้องออก|ตาราง|แผน|ออกกำลังกาย.*อะไร|workout|exercise|routine|program|today)/i.test(message);
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

async function suggestPlanAdjustment({ profile, exercises = [], plan = [], message, todayKey }) {
    const targetIndex = Math.max(0, plan.findIndex((day) => day.key === todayKey));
    const current = plan[targetIndex] || { key: todayKey, focus: "ช่วงล่าง", exercises: [] };
    const allowed = exercises.map((exercise) => exercise.name).filter(Boolean);
    const lowerMessage = String(message || "").toLowerCase();

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
    const isLower = /(ช่วงล่าง|ขา|ก้น|สะโพก|ต้นขา|lower|leg|squat|lunge)/i.test(lowerMessage);
    const isUpper = /(ช่วงบน|อก|หลัง|แขน|ไหล่|upper|push|pull|chest)/i.test(lowerMessage);
    const isCore = /(แกนกลาง|หน้าท้อง|พุง|เอว|core|abs|plank|crunch)/i.test(lowerMessage);
    const isCardio = /(คาร์ดิโอ|ลดน้ำหนัก|ลดไขมัน|เบิร์น|cardio|fat|burn|เดินเร็ว|วิ่ง|ปั่นจักรยาน)/i.test(lowerMessage);
    const isMobility = /(ยืดเหยียด|ฟื้นฟู|โยคะ|mobility|stretch)/i.test(lowerMessage);
    const isFull = /(ทั้งตัว|ทั้งร่างกาย|full\s*body)/i.test(lowerMessage);
    const isLowImpact = /(แรงกระแทกต่ำ|เจ็บเข่า|ปวดเข่า|ข้อเข่า|low\s*impact|เข่าไม่ดี|น้ำหนักเยอะ)/i.test(lowerMessage);

    let categoryKey = isLower ? "lower"
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
            categoryKey = (current.focus || "").includes("บน") ? "upper"
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
    generateAIResponse,
    generateFallbackResponse,
    generateWeeklyPlan,
    suggestPlanAdjustment,
};
