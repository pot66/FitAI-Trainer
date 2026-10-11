// ============================================
// FitAI Trainer
// AI Exercise Engine (Multi-Exercise Support)
// ============================================

import {
  calculateJointAngle,
} from "./angleCalculator";

import {
  createRepCounter,
  updateRepCounter,
} from "./repCounter";

import {
  analyzeForm,
} from "./formAnalyzer";

// ============================================
// Normalize Exercise Name
// ============================================

function normalizeExerciseName(
  name
) {
  const s = String(
    name || ""
  )
    .trim()
    .toLowerCase();

  if (/(squat|สควอท)/i.test(s)) return "squat";
  if (/(push\s*up|push-up|วิดพื้น)/i.test(s)) return "push-up";
  if (/(bicep|ไบเซป)/i.test(s)) return "biceps curl";
  if (/(plank|แพลงก์)/i.test(s)) return "plank";
  if (/(lunge|ลันจ์)/i.test(s)) return "lunge";
  if (/(jumping\s*jack|กระโดดตบ)/i.test(s)) return "jumping jacks";
  if (/(sit\s*up|situp|ซิตอัป)/i.test(s)) return "sit-up";

  return s;
}

// ============================================
// Create Engine
// ============================================

export function createExerciseEngine(
  exercise = null
) {
  const normalized = normalizeExerciseName(exercise?.name || "");
  let defaultDown = 120;
  let defaultUp = 160;

  if (normalized === "jumping jacks") {
    defaultDown = 60;
    defaultUp = 135;
  } else if (normalized === "sit-up") {
    defaultDown = 85;
    defaultUp = 140;
  } else if (normalized === "lunge") {
    defaultDown = 110;
    defaultUp = 155;
  }

  const engine = {
    exercise,
    counter: createRepCounter({
      ...(exercise || {}),
      downThreshold: exercise?.downThreshold || defaultDown,
      upThreshold: exercise?.upThreshold || defaultUp,
    }),

    process(landmarks) {
      return processExercise(
        exercise,
        engine,
        landmarks
      );
    },

    reset() {
      engine.counter = createRepCounter({
        ...(exercise || {}),
        downThreshold: exercise?.downThreshold || defaultDown,
        upThreshold: exercise?.upThreshold || defaultUp,
      });
    },
  };

  return engine;
}

// ============================================
// Process Exercise
// ============================================

export function processExercise(
  exercise,
  engine,
  landmarks
) {
  if (
    !exercise ||
    !landmarks ||
    landmarks.length < 33
  ) {
    return {
      visible: false,
      reps: engine?.counter?.reps || 0,
      score: 0,
      form: "waiting",
      feedback: "กรุณายืนให้เห็นทั้งตัว",
      angles: {},
    };
  }

  const name = normalizeExerciseName(exercise.name);

  // ============================================
  // SQUAT
  // ============================================
  if (name === "squat") {
    return processSquat(exercise, engine, landmarks);
  }

  // ============================================
  // PUSH-UP
  // ============================================
  if (name === "push-up") {
    return processPushUp(exercise, engine, landmarks);
  }

  // ============================================
  // BICEPS CURL
  // ============================================
  if (name === "biceps curl") {
    return processBicepsCurl(exercise, engine, landmarks);
  }

  // ============================================
  // PLANK
  // ============================================
  if (name === "plank") {
    return processPlank(exercise, engine, landmarks);
  }

  // ============================================
  // LUNGES (NEW)
  // ============================================
  if (name === "lunge") {
    return processLunge(exercise, engine, landmarks);
  }

  // ============================================
  // JUMPING JACKS (NEW)
  // ============================================
  if (name === "jumping jacks") {
    return processJumpingJacks(exercise, engine, landmarks);
  }

  // ============================================
  // SIT-UPS (NEW)
  // ============================================
  if (name === "sit-up") {
    return processSitUps(exercise, engine, landmarks);
  }

  // ============================================
  // Generic Exercise
  // ============================================
  return {
    visible: true,
    reps: engine?.counter?.reps || 0,
    score: 75,
    form: "analyzing",
    feedback: "กำลังวิเคราะห์ท่านี้",
    angles: {},
  };
}

// ============================================
// Squat
// ============================================

function processSquat(exercise, engine, landmarks) {
  const leftKnee = calculateJointAngle(landmarks, 23, 25, 27);
  const rightKnee = calculateJointAngle(landmarks, 24, 26, 28);
  const averageKneeAngle = (leftKnee + rightKnee) / 2;

  const repResult = updateRepCounter(engine.counter, averageKneeAngle);
  const form = analyzeForm({
    exercise: "squat",
    config: exercise,
    angles: {
      averageKneeAngle,
      leftKneeAngle: leftKnee,
      rightKneeAngle: rightKnee,
    },
  });

  return {
    visible: true,
    reps: repResult.state.reps,
    counted: repResult.counted,
    phase: repResult.state.phase,
    score: form.score,
    form: form.correct ? "correct" : "incorrect",
    feedback: form.feedback,
    issues: form.issues,
    angles: {
      leftKneeAngle: Math.round(leftKnee),
      rightKneeAngle: Math.round(rightKnee),
      averageKneeAngle: Math.round(averageKneeAngle),
    },
  };
}

// ============================================
// Push-up
// ============================================

function processPushUp(exercise, engine, landmarks) {
  const leftElbow = calculateJointAngle(landmarks, 11, 13, 15);
  const rightElbow = calculateJointAngle(landmarks, 12, 14, 16);
  const averageElbowAngle = (leftElbow + rightElbow) / 2;

  const repResult = updateRepCounter(engine.counter, averageElbowAngle);
  const form = analyzeForm({
    exercise: "push-up",
    config: exercise,
    angles: { averageElbowAngle },
  });

  return {
    visible: true,
    reps: repResult.state.reps,
    counted: repResult.counted,
    phase: repResult.state.phase,
    score: form.score,
    form: form.correct ? "correct" : "incorrect",
    feedback: form.feedback,
    issues: form.issues,
    angles: {
      leftElbowAngle: Math.round(leftElbow),
      rightElbowAngle: Math.round(rightElbow),
      averageElbowAngle: Math.round(averageElbowAngle),
    },
  };
}

// ============================================
// Biceps Curl
// ============================================

function processBicepsCurl(exercise, engine, landmarks) {
  const leftElbow = calculateJointAngle(landmarks, 11, 13, 15);
  const rightElbow = calculateJointAngle(landmarks, 12, 14, 16);
  const averageElbowAngle = (leftElbow + rightElbow) / 2;

  const repResult = updateRepCounter(engine.counter, averageElbowAngle);
  const form = analyzeForm({
    exercise: "biceps curl",
    config: exercise,
    angles: { averageElbowAngle },
  });

  return {
    visible: true,
    reps: repResult.state.reps,
    counted: repResult.counted,
    phase: repResult.state.phase,
    score: form.score,
    form: form.correct ? "correct" : "incorrect",
    feedback: form.feedback,
    issues: form.issues,
    angles: {
      leftElbowAngle: Math.round(leftElbow),
      rightElbowAngle: Math.round(rightElbow),
      averageElbowAngle: Math.round(averageElbowAngle),
    },
  };
}

// ============================================
// Plank
// ============================================

function processPlank(exercise, engine, landmarks) {
  const leftHip = calculateJointAngle(landmarks, 11, 23, 27);
  const rightHip = calculateJointAngle(landmarks, 12, 24, 28);
  const averageHipAngle = (leftHip + rightHip) / 2;

  const correct = averageHipAngle > 165 && averageHipAngle < 195;

  return {
    visible: true,
    reps: 0,
    counted: false,
    phase: "holding",
    score: correct ? 95 : 65,
    form: correct ? "correct" : "incorrect",
    feedback: correct ? "✅ รักษาท่านี้ไว้ครับ" : "⚠️ พยายามรักษาลำตัวให้ตรงครับ",
    issues: correct ? [] : ["body_alignment"],
    angles: {
      leftHipAngle: Math.round(leftHip),
      rightHipAngle: Math.round(rightHip),
      averageHipAngle: Math.round(averageHipAngle),
    },
  };
}

// ============================================
// Lunges (NEW)
// ============================================

function processLunge(exercise, engine, landmarks) {
  const leftKnee = calculateJointAngle(landmarks, 23, 25, 27);
  const rightKnee = calculateJointAngle(landmarks, 24, 26, 28);
  // In lunge, working front knee has deeper flexion
  const workingKnee = Math.min(leftKnee, rightKnee);

  const repResult = updateRepCounter(engine.counter, workingKnee);
  const form = analyzeForm({
    exercise: "lunge",
    config: exercise,
    angles: { frontKneeAngle: workingKnee },
  });

  return {
    visible: true,
    reps: repResult.state.reps,
    counted: repResult.counted,
    phase: repResult.state.phase,
    score: form.score,
    form: form.correct ? "correct" : "incorrect",
    feedback: form.feedback,
    issues: form.issues,
    angles: {
      frontKneeAngle: Math.round(workingKnee),
      leftKneeAngle: Math.round(leftKnee),
      rightKneeAngle: Math.round(rightKnee),
    },
  };
}

// ============================================
// Jumping Jacks (NEW)
// ============================================

function processJumpingJacks(exercise, engine, landmarks) {
  const leftArm = calculateJointAngle(landmarks, 23, 11, 15);
  const rightArm = calculateJointAngle(landmarks, 24, 12, 16);
  const averageArmAngle = (leftArm + rightArm) / 2;

  // Arms up: high angle (> 130), Arms down: low angle (< 60)
  // Invert repCounter comparison by tracking 180 - averageArmAngle or direct threshold
  const repResult = updateRepCounter(engine.counter, 180 - averageArmAngle);
  const form = analyzeForm({
    exercise: "jumping jacks",
    config: exercise,
    angles: { averageArmAngle },
  });

  return {
    visible: true,
    reps: repResult.state.reps,
    counted: repResult.counted,
    phase: repResult.state.phase,
    score: form.score,
    form: form.correct ? "correct" : "incorrect",
    feedback: form.feedback,
    issues: form.issues,
    angles: {
      averageArmAngle: Math.round(averageArmAngle),
    },
  };
}

// ============================================
// Sit-ups (NEW)
// ============================================

function processSitUps(exercise, engine, landmarks) {
  const leftHip = calculateJointAngle(landmarks, 11, 23, 25);
  const rightHip = calculateJointAngle(landmarks, 12, 24, 26);
  const averageHipAngle = (leftHip + rightHip) / 2;

  const repResult = updateRepCounter(engine.counter, averageHipAngle);
  const form = analyzeForm({
    exercise: "sit-up",
    config: exercise,
    angles: { averageHipAngle },
  });

  return {
    visible: true,
    reps: repResult.state.reps,
    counted: repResult.counted,
    phase: repResult.state.phase,
    score: form.score,
    form: form.correct ? "correct" : "incorrect",
    feedback: form.feedback,
    issues: form.issues,
    angles: {
      averageHipAngle: Math.round(averageHipAngle),
    },
  };
}
