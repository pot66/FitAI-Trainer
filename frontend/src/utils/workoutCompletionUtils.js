import { cleanExerciseName } from "../ai/recommendationEngine.js";

const LEGACY_STORAGE_KEY = "fitai-today-completed-exercises";

/**
 * Get current logged in user ID from localStorage
 */
export function getCurrentUserId() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u && (u.id || u.userId)) return u.id || u.userId;
    }
  } catch (_) {}
  return null;
}

/**
 * Get current date key in local time (YYYY-MM-DD)
 */
export function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generate user-scoped storage key for today's completed exercises
 */
export function getStorageKey(userId = null) {
  const uid = userId || getCurrentUserId();
  return uid
    ? `fitai-today-completed-exercises-user-${uid}`
    : `fitai-today-completed-exercises-guest`;
}

/**
 * Normalize an exercise name for consistent comparison
 */
export function normalizeExerciseName(name) {
  if (!name) return "";
  const cleaned = cleanExerciseName(name);
  return String(cleaned).trim().toLowerCase();
}

/**
 * Retrieve list of exercises completed today for a specific user.
 * If the saved date is not today, automatically reset to empty list!
 */
export function getTodayCompletedExercises(userId = null) {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  // Clear legacy global key if found to avoid cross-user pollution
  try {
    if (window.localStorage.getItem(LEGACY_STORAGE_KEY)) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch (_) {}

  const key = getStorageKey(userId);
  const todayKey = getTodayDateKey();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.date !== todayKey || !Array.isArray(parsed.exercises)) {
      // Date has changed (new day!) -> reset today's completion list for this user
      window.localStorage.setItem(key, JSON.stringify({ date: todayKey, exercises: [] }));
      return [];
    }
    return parsed.exercises;
  } catch (err) {
    console.warn("Error reading today's completed exercises:", err);
    return [];
  }
}

/**
 * Mark an exercise as completed today for a specific user
 */
export function markExerciseCompletedToday(exerciseName, userId = null) {
  if (!exerciseName || typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  const key = getStorageKey(userId);
  const todayKey = getTodayDateKey();
  const cleanedName = cleanExerciseName(exerciseName);
  const currentList = getTodayCompletedExercises(userId);

  // Check if already in list (case-insensitive)
  const normTarget = normalizeExerciseName(cleanedName);
  const exists = currentList.some((ex) => normalizeExerciseName(ex) === normTarget);

  let updatedList = currentList;
  if (!exists) {
    updatedList = [...currentList, cleanedName];
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify({ date: todayKey, exercises: updatedList })
      );
    } catch (err) {
      console.warn("Error saving completed exercise:", err);
    }
  }

  // Notify listeners across components
  window.dispatchEvent(
    new CustomEvent("fitai-workout-completed", {
      detail: {
        exerciseName: cleanedName,
        date: todayKey,
        exercises: updatedList,
        userId: userId || getCurrentUserId(),
      },
    })
  );

  return updatedList;
}

/**
 * Toggle an exercise completion status for today for a specific user (mark or unmark)
 */
export function toggleExerciseCompletedToday(exerciseName, userId = null) {
  if (!exerciseName || typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  const key = getStorageKey(userId);
  const todayKey = getTodayDateKey();
  const currentList = getTodayCompletedExercises(userId);
  const cleanedName = cleanExerciseName(exerciseName);
  const normTarget = normalizeExerciseName(cleanedName);
  const exists = currentList.some((ex) => normalizeExerciseName(ex) === normTarget);

  let updatedList;
  if (exists) {
    updatedList = currentList.filter((ex) => normalizeExerciseName(ex) !== normTarget);
  } else {
    updatedList = [...currentList, cleanedName];
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ date: todayKey, exercises: updatedList })
    );
  } catch (err) {
    console.warn("Error toggling completed exercise:", err);
  }

  window.dispatchEvent(
    new CustomEvent("fitai-workout-completed", {
      detail: {
        exerciseName: cleanedName,
        date: todayKey,
        exercises: updatedList,
        userId: userId || getCurrentUserId(),
      },
    })
  );

  return updatedList;
}

/**
 * Check whether a workout session meets the completion criteria for the plan.
 * A session is considered completed if:
 * 1. Score is 85 or above (standard benchmark for sessions reaching 100% of target).
 * 2. Repetitions reach 24 or above (at least 2 full sets of 12).
 * 3. Or duration is 60s or above with score >= 80 (for timed exercises).
 */
export function isWorkoutSessionGoalCompleted(workout) {
  if (!workout) return false;
  if (typeof workout.score === "number" && workout.score >= 85) {
    return true;
  }
  if (Number(workout.repetitions || 0) >= 24) {
    return true;
  }
  if (Number(workout.duration || 0) >= 60 && Number(workout.score || 0) >= 80) {
    return true;
  }
  return false;
}

/**
 * Sync today's completed exercises strictly from the user's workout history (e.g. from GET /workouts).
 * This ensures completion reflects solely workouts that actually met the goal.
 */
export function syncTodayCompletedFromWorkouts(workoutList, userId = null) {
  const key = getStorageKey(userId);
  const todayKey = getTodayDateKey();

  if (!Array.isArray(workoutList) || typeof window === "undefined") {
    return getTodayCompletedExercises(userId);
  }

  const todaySet = new Set();
  const resultList = [];

  for (const w of workoutList) {
    if (!w) continue;
    const sessionDate = w.startedAt || w.completedAt || w.createdAt;
    if (!sessionDate) continue;

    const d = new Date(sessionDate);
    if (isNaN(d.getTime())) continue;

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const sessionDateKey = `${y}-${m}-${day}`;

    // ตรวจสอบว่าออกกำลังกายในวันนี้ และออกครบตามเป้าหมาย (isWorkoutSessionGoalCompleted)
    if (sessionDateKey === todayKey && isWorkoutSessionGoalCompleted(w)) {
      const exName = w.exercise?.name || w.exerciseName || w.name;
      if (exName) {
        const clean = cleanExerciseName(exName);
        const norm = normalizeExerciseName(clean);
        if (!todaySet.has(norm)) {
          todaySet.add(norm);
          resultList.push(clean);
        }
      }
    }
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ date: todayKey, exercises: resultList })
    );
  } catch (err) {
    console.warn("Error syncing completed exercises:", err);
  }

  return resultList;
}

/**
 * Check if a specific exercise has been completed today
 */
export function isExerciseCompletedToday(exerciseName, todayList) {
  if (!exerciseName) return false;
  const list = todayList || getTodayCompletedExercises();
  if (!Array.isArray(list) || list.length === 0) return false;

  const targetNorm = normalizeExerciseName(exerciseName);
  if (!targetNorm) return false;

  return list.some((item) => {
    const itemNorm = normalizeExerciseName(item);
    if (itemNorm === targetNorm) return true;
    // Allow partial inclusion for compound phrases
    if (targetNorm.length >= 4 && itemNorm.length >= 4) {
      if (itemNorm.includes(targetNorm) || targetNorm.includes(itemNorm)) return true;
    }
    return false;
  });
}

/**
 * Check completion summary for a day's workout plan
 */
export function getDayCompletionStatus(day, todayList) {
  if (!day || day.isRest || day.exerciseName === "Rest") {
    return { total: 0, completed: 0, isAllCompleted: false, isRest: true };
  }
  const exercises = Array.isArray(day.exercises) && day.exercises.length > 0
    ? day.exercises
    : day.exerciseName ? [{ name: day.exerciseName }] : [];

  if (exercises.length === 0) {
    return { total: 0, completed: 0, isAllCompleted: false, isRest: false };
  }

  let completedCount = 0;
  for (const ex of exercises) {
    if (isExerciseCompletedToday(ex.name, todayList)) {
      completedCount++;
    }
  }

  return {
    total: exercises.length,
    completed: completedCount,
    isAllCompleted: completedCount > 0 && completedCount >= exercises.length,
    hasAnyCompleted: completedCount > 0,
    isRest: false,
  };
}
