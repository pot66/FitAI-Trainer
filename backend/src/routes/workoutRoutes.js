const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");

const {
  createWorkout,
  getMyWorkouts,
  getWorkoutById,
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

router.get(
  "/:id",
  authMiddleware,
  getWorkoutById
);

module.exports = router;