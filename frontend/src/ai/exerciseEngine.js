// ============================================
// FitAI Trainer
// AI Exercise Engine
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
  return String(
    name || ""
  )
    .trim()
    .toLowerCase();
}

// ============================================
// Create Engine
// ============================================

export function createExerciseEngine(
  exercise = null
) {
  const engine = {
    exercise,
    counter: createRepCounter(
      exercise || {}
    ),

    process(landmarks) {
      return processExercise(
        exercise,
        engine,
        landmarks
      );
    },

    reset() {
      engine.counter =
        createRepCounter(
          exercise || {}
        );
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
    landmarks.length <
      33
  ) {
    return {
      visible: false,

      reps:
        engine?.counter?.reps ||
        0,

      score: 0,

      form: "waiting",

      feedback:
        "กรุณายืนให้เห็นทั้งตัว",

      angles: {},
    };
  }

  const name =
    normalizeExerciseName(
      exercise.name
    );

  // ============================================
  // SQ UAT
  // ============================================

  if (
    name === "squat"
  ) {
    return processSquat(
      exercise,
      engine,
      landmarks
    );
  }

  // ============================================
  // PUSH-UP
  // ============================================

  if (
    name === "push-up"
  ) {
    return processPushUp(
      exercise,
      engine,
      landmarks
    );
  }

  // ============================================
  // BICEPS CURL
  // ============================================

  if (
    name ===
      "biceps curl"
  ) {
    return processBicepsCurl(
      exercise,
      engine,
      landmarks
    );
  }

  // ============================================
  // PLANK
  // ============================================

  if (
    name === "plank"
  ) {
    return processPlank(
      exercise,
      engine,
      landmarks
    );
  }

  // ============================================
  // Generic Exercise
  // ============================================

  return {
    visible: true,

    reps:
      engine?.counter?.reps ||
      0,

    score: 70,

    form: "analyzing",

    feedback:
      "กำลังวิเคราะห์ท่านี้",

    angles: {},
  };
}

// ============================================
// Squat
// ============================================

function processSquat(
  exercise,
  engine,
  landmarks
) {
  const leftKnee =
    calculateJointAngle(
      landmarks,
      23,
      25,
      27
    );

  const rightKnee =
    calculateJointAngle(
      landmarks,
      24,
      26,
      28
    );

  const averageKneeAngle =
    (
      leftKnee +
      rightKnee
    ) / 2;

  const repResult =
    updateRepCounter(
      engine.counter,
      averageKneeAngle
    );

  const form =
    analyzeForm({
      exercise: "squat",

      config:
        exercise,

      angles: {
        averageKneeAngle,
        leftKneeAngle:
          leftKnee,
        rightKneeAngle:
          rightKnee,
      },
    });

  return {
    visible: true,

    reps:
      repResult.state.reps,

    counted:
      repResult.counted,

    phase:
      repResult.state.phase,

    score:
      form.score,

    form:
      form.correct
        ? "correct"
        : "incorrect",

    feedback:
      form.feedback,

    issues:
      form.issues,

    angles: {
      leftKneeAngle:
        leftKnee,

      rightKneeAngle:
        rightKnee,

      averageKneeAngle:
        Math.round(
          averageKneeAngle
        ),
    },
  };
}

// ============================================
// Push-up
// ============================================

function processPushUp(
  exercise,
  engine,
  landmarks
) {
  const leftElbow =
    calculateJointAngle(
      landmarks,
      11,
      13,
      15
    );

  const rightElbow =
    calculateJointAngle(
      landmarks,
      12,
      14,
      16
    );

  const averageElbowAngle =
    (
      leftElbow +
      rightElbow
    ) / 2;

  const repResult =
    updateRepCounter(
      engine.counter,
      averageElbowAngle
    );

  const form =
    analyzeForm({
      exercise:
        "push-up",

      config:
        exercise,

      angles: {
        averageElbowAngle,
      },
    });

  return {
    visible: true,

    reps:
      repResult.state.reps,

    counted:
      repResult.counted,

    phase:
      repResult.state.phase,

    score:
      form.score,

    form:
      form.correct
        ? "correct"
        : "incorrect",

    feedback:
      form.feedback,

    issues:
      form.issues,

    angles: {
      leftElbowAngle:
        leftElbow,

      rightElbowAngle:
        rightElbow,

      averageElbowAngle:
        Math.round(
          averageElbowAngle
        ),
    },
  };
}

// ============================================
// Biceps Curl
// ============================================

function processBicepsCurl(
  exercise,
  engine,
  landmarks
) {
  const leftElbow =
    calculateJointAngle(
      landmarks,
      11,
      13,
      15
    );

  const rightElbow =
    calculateJointAngle(
      landmarks,
      12,
      14,
      16
    );

  const averageElbowAngle =
    (
      leftElbow +
      rightElbow
    ) / 2;

  const repResult =
    updateRepCounter(
      engine.counter,
      averageElbowAngle
    );

  const form =
    analyzeForm({
      exercise:
        "biceps curl",

      config:
        exercise,

      angles: {
        averageElbowAngle,
      },
    });

  return {
    visible: true,

    reps:
      repResult.state.reps,

    counted:
      repResult.counted,

    phase:
      repResult.state.phase,

    score:
      form.score,

    form:
      form.correct
        ? "correct"
        : "incorrect",

    feedback:
      form.feedback,

    issues:
      form.issues,

    angles: {
      leftElbowAngle:
        leftElbow,

      rightElbowAngle:
        rightElbow,

      averageElbowAngle:
        Math.round(
          averageElbowAngle
        ),
    },
  };
}

// ============================================
// Plank
// ============================================

function processPlank(
  exercise,
  engine,
  landmarks
) {
  const leftHip =
    calculateJointAngle(
      landmarks,
      11,
      23,
      27
    );

  const rightHip =
    calculateJointAngle(
      landmarks,
      12,
      24,
      28
    );

  const averageHipAngle =
    (
      leftHip +
      rightHip
    ) / 2;

  const correct =
    averageHipAngle >
      165 &&
    averageHipAngle <
      195;

  return {
    visible: true,

    reps: 0,

    counted: false,

    phase:
      "holding",

    score:
      correct
        ? 95
        : 65,

    form:
      correct
        ? "correct"
        : "incorrect",

    feedback:
      correct
        ? "✅ รักษาท่านี้ไว้ครับ"
        : "⚠️ พยายามรักษาลำตัวให้ตรงครับ",

    issues:
      correct
        ? []
        : [
            "body_alignment",
          ],

    angles: {
      leftHipAngle:
        leftHip,

      rightHipAngle:
        rightHip,

      averageHipAngle:
        Math.round(
          averageHipAngle
        ),
    },
  };
}