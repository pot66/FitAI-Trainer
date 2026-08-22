// ============================================
// FitAI Trainer
// AI Repetition Counter
// ============================================

export function createRepCounter(
  config = {}
) {
  return {
    phase: "up",

    reps: 0,

    lastAngle: null,

    stableFrames: 0,

    minStableFrames:
      config.minStableFrames || 3,

    downThreshold:
      Number(
        config.downThreshold
      ) || 120,

    upThreshold:
      Number(
        config.upThreshold
      ) || 160,
  };
}

// ============================================
// Update Rep Counter
// ============================================

export function updateRepCounter(
  state,
  angle
) {
  if (
    !state ||
    angle === null ||
    angle === undefined ||
    !Number.isFinite(angle)
  ) {
    return {
      state,
      counted: false,
    };
  }

  let counted = false;

  // ============================================
  // DOWN
  // ============================================

  if (
    state.phase === "up" &&
    angle <=
      state.downThreshold
  ) {
    state.phase = "down";

    state.stableFrames = 1;
  }

  // ============================================
  // Continue DOWN
  // ============================================

  else if (
    state.phase === "down" &&
    angle <=
      state.downThreshold
  ) {
    state.stableFrames += 1;
  }

  // ============================================
  // DOWN → UP
  // ============================================

  else if (
    state.phase === "down" &&
    angle >=
      state.upThreshold
  ) {
    if (
      state.stableFrames >=
      state.minStableFrames
    ) {
      state.reps += 1;

      counted = true;
    }

    state.phase = "up";

    state.stableFrames = 0;
  }

  // ============================================
  // เก็บ Angle ล่าสุด
  // ============================================

  state.lastAngle =
    angle;

  return {
    state,
    counted,
  };
}