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

function generateFallbackResponse(message, context = {}) {
    const profile = context.profile || null;
    const workout = context.workout || [];

    const text = message.trim();
    const lowerText = text.toLowerCase();

    // =====================================
    // Greeting
    // =====================================

    if (
        lowerText.includes("สวัสดี") ||
        lowerText.includes("hello") ||
        lowerText.includes("hi")
    ) {
        if (profile) {
            return (
                `สวัสดีครับ  ` +
                `ผมคือ FitAI Trainer ` +
                `ตอนนี้ผมมีข้อมูลของคุณแล้ว ` +
                `BMI ของคุณคือ ${profile.bmi || "-"} ` +
                `(${profile.bmiStatus || "-"}) ` +
                `มีอะไรให้ผมช่วยเกี่ยวกับการออกกำลังกายไหมครับ`
            );
        }

        return (
            "สวัสดีครับ  " +
            "ผมคือ FitAI Trainer " +
            "มีอะไรให้ผมช่วยเกี่ยวกับการออกกำลังกายไหมครับ"
        );
    }

    // =====================================
    // Profile information
    // =====================================

    if (
        lowerText.includes("ข้อมูลของฉัน") ||
        lowerText.includes("profile") ||
        lowerText.includes("ข้อมูลส่วนตัว")
    ) {
        if (!profile) {
            return (
                "ตอนนี้ยังไม่มีข้อมูล Profile ของคุณครับ " +
                "กรุณาไปที่หน้า Profile เพื่อเพิ่มข้อมูลก่อนครับ"
            );
        }

        return (
            "ข้อมูลของคุณครับ 👤\n\n" +
            `อายุ: ${profile.age || "-"} ปี\n` +
            `ส่วนสูง: ${profile.height || "-"} cm\n` +
            `น้ำหนัก: ${profile.weight || "-"} kg\n` +
            `BMI: ${profile.bmi || "-"}\n` +
            `สถานะ BMI: ${profile.bmiStatus || "-"}`
        );
    }

    // =====================================
    // BMI
    // =====================================

    if (
        lowerText.includes("bmi") ||
        lowerText.includes("ดัชนีมวลกาย")
    ) {
        if (!profile) {
            return (
                "ผมยังไม่มีข้อมูลส่วนสูงและน้ำหนักของคุณครับ " +
                "กรุณาเพิ่มข้อมูลในหน้า Profile ก่อนครับ"
            );
        }

        return (
            `BMI ของคุณคือ ${profile.bmi || "-"} ` +
            `ซึ่งอยู่ในระดับ ${profile.bmiStatus || "-"} ครับ\n\n` +
            `${getBMIAdvice(profile)}`
        );
    }

    // =====================================
    // Weight
    // =====================================

    if (
        lowerText.includes("น้ำหนัก") ||
        lowerText.includes("weight")
    ) {
        if (!profile) {
            return (
                "ผมยังไม่มีข้อมูลน้ำหนักของคุณครับ " +
                "สามารถเพิ่มได้ที่หน้า Profile"
            );
        }

        return (
            `ตอนนี้น้ำหนักของคุณคือ ${profile.weight} kg ครับ ` +
            `และ BMI อยู่ที่ ${profile.bmi || "-"}`
        );
    }

    // =====================================
    // Height
    // =====================================

    if (
        lowerText.includes("ส่วนสูง") ||
        lowerText.includes("height")
    ) {
        if (!profile) {
            return (
                "ผมยังไม่มีข้อมูลส่วนสูงของคุณครับ"
            );
        }

        return (
            `ส่วนสูงของคุณคือ ${profile.height} cm ครับ`
        );
    }

    // =====================================
    // Workout advice
    // =====================================

    const workoutAdvice =
        getWorkoutAdvice(message);

    if (workoutAdvice) {
        let response = workoutAdvice;

        if (profile) {
            response +=
                `\n\nสำหรับคุณโดยเฉพาะ ` +
                `BMI ปัจจุบันคือ ${profile.bmi || "-"}` +
                ` (${profile.bmiStatus || "-"})`;

            response +=
                `\n${getBMIAdvice(profile)}`;
        }

        return response;
    }

    // =====================================
    // Workout history
    // =====================================

    if (
        lowerText.includes("ประวัติ") ||
        lowerText.includes("history")
    ) {
        if (!workout.length) {
            return (
                "ตอนนี้ยังไม่มีประวัติการออกกำลังกายครับ"
            );
        }

        return (
            `ผมพบประวัติการออกกำลังกายล่าสุด ` +
            `${workout.length} รายการครับ ` +
            `สามารถนำข้อมูลเหล่านี้ไปใช้วางแผน ` +
            `การออกกำลังกายครั้งต่อไปได้`
        );
    }

    // =====================================
    // Personalized recommendation
    // =====================================

    if (
        lowerText.includes("แนะนำ") ||
        lowerText.includes("ควรทำอะไร") ||
        lowerText.includes("ควรออก") ||
        lowerText.includes("ท่า") ||
        lowerText.includes("วันนี้") ||
        lowerText.includes("ตาราง") ||
        lowerText.includes("แผน") ||
        lowerText.includes("workout") ||
        lowerText.includes("exercise")
    ) {
        if (context.activePlan) {
            return formatActivePlanRecommendation(context.activePlan, profile);
        }

        const bmiNote = profile
            ? `(อ้างอิงจากข้อมูล BMI ${profile.bmi || "-"} ของคุณ)`
            : "";
        return (
            `FitAI แนะนำท่าออกกำลังกายพื้นฐานที่ปลอดภัยและเหมาะสม ${bmiNote} ดังนี้ครับ:\n\n` +
            "- Squat (3 เซ็ต, 10-12 ครั้ง)\n" +
            "- Push-up (3 เซ็ต, 8-10 ครั้ง)\n" +
            "- Plank (3 เซ็ต, 20-30 วินาที)\n" +
            "- Glute Bridge (3 เซ็ต, 12-15 ครั้ง)\n\n" +
            "คลิกดูคลิปวิดีโอสาธิตแต่ละท่าเพื่อฝึกตามได้อย่างถูกต้องและปลอดภัยครับ"
        );
    }

    // =====================================
    // Default
    // =====================================

    if (profile) {
        return (
            `ผมเข้าใจคำถามของคุณว่า "${text}" ครับ\n\n` +
            `ผมสามารถช่วยเรื่องการออกกำลังกาย ` +
            `โดยอ้างอิงข้อมูล Profile ของคุณได้ ` +
            `เช่น BMI ${profile.bmi || "-"} ` +
            `(${profile.bmiStatus || "-"})\n\n` +
            `ลองถามผมเกี่ยวกับ BMI, Workout, Squat, ` +
            `Push-up หรือแผนการออกกำลังกายได้เลยครับ`
        );
    }

    return (
        `ผมเข้าใจคำถามของคุณว่า "${text}" ครับ\n\n` +
        "ผมสามารถช่วยเรื่องการออกกำลังกายได้ครับ " +
        "ลองถามเกี่ยวกับ BMI, Workout, Squat หรือ Push-up ได้เลย"
    );
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

async function generateAIResponse(message, context = {}) {
    let answer = "";

    // 1. If plan was updated, return the authoritative synchronized plan response
    if (context.planUpdated && context.activePlan) {
        answer = formatActivePlan(context.activePlan, context.profile);
        return await enrichResponseWithVideos(answer);
    }

    // 2. If user is asking for exercise recommendation / advice / today's poses, strictly adhere to the table
    const isRecRequest = /(แนะนำ.*(ท่า|ออกกำลัง|การออกกำลัง|ทำอะไร|โปรแกรม)|ควรออก.*ท่า|มีท่า.*แนะนำ|ท่า.*เหมาะกับ|วันนี้.*(ออก|ทำ|ฝึก|ท่า)|(ออก|ทำ|ฝึก).*ท่าไหน|ท่าอะไร(ดี|บ้าง)?|ช่วยเลือกท่า|ขอท่า|ท่าที่ต้องออก|ตาราง|แผน|ออกกำลังกาย.*อะไร|workout|exercise|routine|program|today)/i.test(message);
    if (context.activePlan && isRecRequest) {
        answer = formatActivePlanRecommendation(context.activePlan, context.profile);
        return await enrichResponseWithVideos(answer);
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

    return await enrichResponseWithVideos(answer);
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
