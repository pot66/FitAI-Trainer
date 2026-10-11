// ============================================
// FitAI Trainer
// AI Form Analyzer (Multi-Exercise Support)
// ============================================

// ============================================
// Analyze Angle
// ============================================

function analyzeAngle(
  angle,
  min,
  max
) {
  if (
    angle === null ||
    angle === undefined
  ) {
    return {
      valid: false,
      message: "ไม่พบข้อมูลมุมข้อต่อ",
    };
  }

  if (angle < min) {
    return {
      valid: false,
      message: "มุมข้อต่อต่ำเกินไป",
    };
  }

  if (angle > max) {
    return {
      valid: false,
      message: "มุมข้อต่อสูงเกินไป",
    };
  }

  return {
    valid: true,
    message: "ท่าถูกต้อง",
  };
}

// ============================================
// Analyze Form
// ============================================

export function analyzeForm({
  exercise,
  config,
  angles,
}) {
  if (!exercise) {
    return {
      correct: false,
      score: 0,
      feedback: "ยังไม่ได้เลือก Exercise",
      issues: [],
    };
  }

  if (!config) {
    return {
      correct: true,
      score: 70,
      feedback: "กำลังวิเคราะห์ท่า",
      issues: [],
    };
  }

  const issues = [];
  const ex = String(exercise).toLowerCase().replace(/[^a-z0-9]/g, "");

  // ============================================
  // Squat
  // ============================================
  if (ex.includes("squat")) {
    const knee = Number(angles?.averageKneeAngle || angles?.leftKneeAngle || angles?.rightKneeAngle);
    if (Number.isFinite(knee)) {
      if (knee > 170) {
        issues.push("เริ่มย่อตัวลง");
      } else if (knee < 65) {
        issues.push("อย่าย่อลึกเกินไป");
      }
    }
  }

  // ============================================
  // Push-up
  // ============================================
  else if (ex.includes("pushup") || ex.includes("push")) {
    const elbow = Number(angles?.averageElbowAngle || angles?.leftElbowAngle || angles?.rightElbowAngle);
    if (Number.isFinite(elbow)) {
      if (elbow > 175) {
        issues.push("เริ่มลดตัวลง");
      } else if (elbow < 50) {
        issues.push("อย่าหดข้อศอกมากเกินไป");
      }
    }
  }

  // ============================================
  // Lunges
  // ============================================
  else if (ex.includes("lunge")) {
    const knee = Number(angles?.frontKneeAngle || angles?.averageKneeAngle);
    if (Number.isFinite(knee)) {
      if (knee > 150) {
        issues.push("เริ่มก้าวขาและย่อตัวลงทำมุม 90 องศา");
      } else if (knee < 65) {
        issues.push("อย่าย่อเข่าล้ำปลายเท้ามากเกินไป");
      }
    }
  }

  // ============================================
  // Jumping Jacks
  // ============================================
  else if (ex.includes("jumpingjack") || ex.includes("jack")) {
    const arm = Number(angles?.averageArmAngle || angles?.leftArmAngle || angles?.rightArmAngle);
    if (Number.isFinite(arm)) {
      if (arm < 80) {
        issues.push("ยกแขนขึ้นและกางขาให้สุดจังหวะ");
      }
    }
  }

  // ============================================
  // Sit-ups
  // ============================================
  else if (ex.includes("situp")) {
    const hip = Number(angles?.averageHipAngle || angles?.leftHipAngle || angles?.rightHipAngle);
    if (Number.isFinite(hip)) {
      if (hip > 140) {
        issues.push("เกร็งหน้าท้องและยกลำตัวขึ้น");
      } else if (hip < 45) {
        issues.push("ไม่ต้องก้มหน้าชิดเข่าเกินไป คุมคอให้ผ่อนคลาย");
      }
    }
  }

  // ============================================
  // General Result
  // ============================================
  const correct = issues.length === 0;

  let score = correct
    ? 95
    : Math.max(50, 95 - issues.length * 15);

  let feedback = correct
    ? "✅ ท่าถูกต้องครับ"
    : issues[0];

  return {
    correct,
    score,
    feedback,
    issues,
  };
}

// ============================================
// Feedback From Database
// ============================================

export function getDatabaseFeedback(
  feedbackRules,
  key
) {
  if (
    !feedbackRules ||
    !key
  ) {
    return null;
  }

  if (
    typeof feedbackRules === "string"
  ) {
    try {
      feedbackRules = JSON.parse(feedbackRules);
    } catch {
      return null;
    }
  }

  return feedbackRules[key] || null;
}
