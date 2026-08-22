// ============================================
// FitAI Trainer
// AI Form Analyzer
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
      message:
        "ไม่พบข้อมูลมุมข้อต่อ",
    };
  }

  if (
    angle < min
  ) {
    return {
      valid: false,
      message:
        "มุมข้อต่อต่ำเกินไป",
    };
  }

  if (
    angle > max
  ) {
    return {
      valid: false,
      message:
        "มุมข้อต่อสูงเกินไป",
    };
  }

  return {
    valid: true,
    message:
      "ท่าถูกต้อง",
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
      feedback:
        "ยังไม่ได้เลือก Exercise",
      issues: [],
    };
  }

  if (!config) {
    return {
      correct: true,
      score: 70,
      feedback:
        "กำลังวิเคราะห์ท่า",
      issues: [],
    };
  }

  const issues = [];

  // ============================================
  // Squat
  // ============================================

  if (
    exercise === "squat"
  ) {
    const knee =
      Number(
        angles?.averageKneeAngle
      );

    if (
      Number.isFinite(knee)
    ) {
      if (
        knee > 170
      ) {
        issues.push(
          "เริ่มย่อตัวลง"
        );
      }

      if (
        knee < 65
      ) {
        issues.push(
          "อย่าย่อลึกเกินไป"
        );
      }
    }
  }

  // ============================================
  // Push-up
  // ============================================

  if (
    exercise ===
    "push-up"
  ) {
    const elbow =
      Number(
        angles?.averageElbowAngle
      );

    if (
      Number.isFinite(elbow)
    ) {
      if (
        elbow > 175
      ) {
        issues.push(
          "เริ่มลดตัวลง"
        );
      }

      if (
        elbow < 50
      ) {
        issues.push(
          "อย่าหดข้อศอกมากเกินไป"
        );
      }
    }
  }

  // ============================================
  // General Result
  // ============================================

  const correct =
    issues.length === 0;

  let score = correct
    ? 95
    : Math.max(
        50,
        95 -
          issues.length *
            15
      );

  let feedback =
    correct
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
    typeof feedbackRules ===
    "string"
  ) {
    try {
      feedbackRules =
        JSON.parse(
          feedbackRules
        );
    } catch {
      return null;
    }
  }

  return (
    feedbackRules[key] ||
    null
  );
}