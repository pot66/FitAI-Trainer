const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");

const {
  createWorkout,
  getMyWorkouts,
  getWorkoutById,
  deleteTodayWorkoutByExercise,
  deleteWorkout,
} = require("../controllers/workoutController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createWorkout
);

router.get(
  "/",
  authMiddleware,
  getMyWorkouts
);

// Delete today's workout for a specific exercise (before /:id route)
router.delete(
  "/today/:exerciseId",
  authMiddleware,
  deleteTodayWorkoutByExercise
);

router.get(
  "/:id",
  authMiddleware,
  getWorkoutById
);

router.delete(
  "/:id",
  authMiddleware,
  deleteWorkout
);

module.exports = router;
