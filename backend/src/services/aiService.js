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

    if (
        text.includes("squat") ||
        text.includes("สควอต")
    ) {
        return (
            "สำหรับ Squat ให้ยืนเท้ากว้างประมาณหัวไหล่ " +
            "รักษาหลังให้ตรง งอเข่าและสะโพกลงอย่างควบคุม " +
            "จากนั้นดันตัวกลับขึ้นอย่างช้า ๆ"
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
            "แล้วดันตัวกลับขึ้น"
        );
    }

    if (
        text.includes("plank") ||
        text.includes("แพลงก์")
    ) {
        return (
            "สำหรับ Plank ให้รักษาลำตัวเป็นเส้นตรง " +
            "เกร็งหน้าท้องและหลีกเลี่ยงการปล่อยสะโพกตก"
        );
    }

    if (
        text.includes("ออกกำลังกาย") ||
        text.includes("workout") ||
        text.includes("วันนี้")
    ) {
        return (
            "คุณสามารถเริ่มด้วย Squat 3 เซ็ต " +
            "เซ็ตละ 10-12 ครั้ง, Push-up 3 เซ็ต " +
            "เซ็ตละ 8-10 ครั้ง และ Plank 3 เซ็ต " +
            "เซ็ตละ 20-30 วินาที"
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
                `สวัสดีครับ 👋 ` +
                `ผมคือ FitAI Trainer ` +
                `ตอนนี้ผมมีข้อมูลของคุณแล้ว ` +
                `BMI ของคุณคือ ${profile.bmi || "-"} ` +
                `(${profile.bmiStatus || "-"}) ` +
                `มีอะไรให้ผมช่วยเกี่ยวกับการออกกำลังกายไหมครับ`
            );
        }

        return (
            "สวัสดีครับ 👋 " +
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
        lowerText.includes("ควรออก")
    ) {
        if (!profile) {
            return (
                "ผมแนะนำให้เริ่มจาก Squat, Push-up " +
                "และ Plank แบบเบา ๆ ก่อนครับ " +
                "หากต้องการคำแนะนำเฉพาะบุคคล " +
                "กรุณาเพิ่มข้อมูลในหน้า Profile"
            );
        }

        return (
            `จากข้อมูลของคุณ อายุ ${profile.age} ปี ` +
            `ส่วนสูง ${profile.height} cm ` +
            `น้ำหนัก ${profile.weight} kg ` +
            `และ BMI ${profile.bmi} ` +
            `(${profile.bmiStatus})\n\n` +
            `ผมแนะนำให้เริ่มจากการออกกำลังกายระดับเบาถึงปานกลาง ` +
            `ประมาณ 20-30 นาทีต่อครั้ง ` +
            `และค่อย ๆ เพิ่มความหนักตามความเหมาะสมครับ`
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

function isPlanRequest(message) {
    return /(ตาราง|แผน|วันนี้|แนะนำ.*ออกกำลัง|ออกกำลัง.*อะไร|workout\s*plan|today)/i.test(message);
}

function isStartingPlanChange(message) {
    return /^(?:ต้องการ|อยาก|ขอ)?\s*(?:เปลี่ยน|ปรับ)\s*(?:แผน|ตาราง)(?:\s*(?:ออกกำลังกาย|วันนี้))?[.!?]*$/i.test(String(message || "").trim());
}

function formatActivePlan(plan) {
    if (plan.exerciseName === "Rest") {
        return `แผนวันนี้: ${plan.focus}\n\nพักผ่อนหรือยืดเหยียดเบา ๆ ตามความพร้อมของร่างกายครับ`;
    }
    const exercises = Array.isArray(plan.exercises) && plan.exercises.length
        ? plan.exercises
        : [{ name: plan.exerciseName, sets: plan.sets, repetitions: plan.repetitions }];
    const list = exercises.map((exercise, index) =>
        `${index + 1}. ${exercise.name} — ${exercise.sets ? `${exercise.sets} เซ็ต · ` : ""}${exercise.repetitions}`
    ).join("\n");
    return `แผนวันนี้: ${plan.focus}\n\n${list}\n\nรายการนี้ตรงกับตารางแผนด้านขวา กด “เริ่มแผนวันนี้” เพื่อเข้าสู่โหมดกล้องได้เลยครับ`;
}

async function generateAIResponse(message, context = {}) {
    if (isStartingPlanChange(message)) {
        const prompt = [
            "ผู้ใช้ต้องการเปลี่ยนแผนออกกำลังกาย แต่ยังไม่ได้ระบุความต้องการ",
            "ตอบเป็นภาษาไทยอย่างกระชับ และถามคำถามเดียวเพื่อเก็บข้อมูลก่อนปรับแผน",
            "ให้ผู้ใช้เลือกหรือบอก: เป้าหมาย, ส่วนร่างกายที่อยากเน้น, ระดับความหนัก, เวลาที่มี, อุปกรณ์ และอาการเจ็บ/ข้อจำกัด",
            "ยังห้ามเสนอหรือเปลี่ยนรายการท่าออกกำลังกายในตอนนี้",
        ].join("\n");
        const ollamaResponse = await askOllama(prompt, context);
        return ollamaResponse || "ขณะนี้ไม่สามารถเชื่อมต่อ Ollama ได้ กรุณาลองใหม่อีกครั้งครับ";
    }
    const ollamaResponse = await askOllama(message, context);
    return ollamaResponse || "ขณะนี้ไม่สามารถเชื่อมต่อ Ollama ได้ กรุณาลองใหม่อีกครั้งครับ";
}

function uniqueNames(names) {
    return [...new Set(names.filter(Boolean))];
}

async function suggestPlanAdjustment({ profile, exercises = [], plan = [], message, todayKey }) {
    const targetIndex = Math.max(0, plan.findIndex((day) => day.key === todayKey));
    const current = plan[targetIndex];
    if (!current || current.exerciseName === "Rest") {
        return { plan, changed: false, message: "วันนี้เป็นวันพัก จึงยังไม่ปรับเป็นท่าออกกำลังกายครับ" };
    }

    const allowed = exercises.map((exercise) => exercise.name).filter(Boolean);
    const lowerMessage = String(message || "").toLowerCase();
    const requested = allowed.find((name) => lowerMessage.includes(name.toLowerCase()));
    let selectedNames = requested ? [requested] : [];
    let advice = "";

    if (!requested) {
        const result = await askOllamaStructured([
            "You are a cautious fitness coach. Pick up to 5 exercise names only from the allowed list.",
            `User profile: age ${profile?.age ?? "unknown"}, BMI ${profile?.bmi ?? "unknown"}, status ${profile?.bmiStatus ?? "unknown"}.`,
            `Current focus: ${current.focus}. User request: ${message}`,
            `Allowed exercises: ${allowed.join(", ")}`,
            'Return JSON: {"exerciseNames":["exact allowed name"],"advice":"short Thai explanation"}',
        ].join("\n"));
        try {
            const parsed = result ? JSON.parse(result) : null;
            selectedNames = Array.isArray(parsed?.exerciseNames)
                ? parsed.exerciseNames.filter((name) => allowed.includes(name))
                : [];
            advice = typeof parsed?.advice === "string" ? parsed.advice.slice(0, 360) : "";
        } catch {
            selectedNames = [];
        }
    }

    const existingNames = (current.exercises || []).map((exercise) => exercise.name);
    const names = uniqueNames([...selectedNames, ...existingNames, ...allowed]).slice(0, 5);
    if (!names.length) return { plan, changed: false, message: "ยังไม่มีท่าในคลัง Exercise สำหรับจัดแผนครับ" };

    const existing = new Map((current.exercises || []).map((exercise) => [exercise.name, exercise]));
    const adjustedExercises = names.map((name) => existing.get(name) || {
        name,
        sets: current.sets || 3,
        repetitions: current.repetitions || "10–12 ครั้ง",
    });
    const next = plan.map((day, index) => index === targetIndex ? {
        ...day,
        exerciseName: adjustedExercises[0].name,
        exercises: adjustedExercises,
        reason: requested ? "เปลี่ยนตามท่าที่ผู้ใช้ระบุ" : "Ollama คัดเลือกจากข้อมูล Profile และคำขอของผู้ใช้",
    } : day);
    const source = requested
        ? `ผมเปลี่ยนท่าแรกเป็น ${requested} ตามที่คุณขอ และจัดรายการที่เหลือให้เข้ากับแผนวันนี้แล้วครับ`
        : "Ollama เลือกท่าจากคลัง Exercise ที่มีอยู่และปรับตารางให้แล้วครับ";
    return { plan: next, changed: true, message: advice ? `${source}\n${advice}` : source };
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
    generateWeeklyPlan,
    suggestPlanAdjustment,
};
