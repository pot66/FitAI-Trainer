const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getExercises,
  getExerciseById,
} = require("../controllers/exerciseController");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getExercises
);

router.get(
  "/:id",
  authMiddleware,
  getExerciseById
);

module.exports = router;