const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  analyzeFood,
  calculateNutrition,
  createFoodLog,
  getMyFoodLogs,
  getTodayFoodSummary,
  getFoodLogById,
  deleteFoodLog,
  searchFoods,
} = require("../controllers/foodController");

const router = express.Router();

// Configure multer memory storage (up to 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// All food routes require authentication
router.use(authMiddleware);

// AI Image Analysis
router.post("/analyze", upload.single("image"), analyzeFood);

// Nutrition Calculator & Database Search
router.post("/calculate", calculateNutrition);
router.get("/search", searchFoods);

// Food Logs CRUD & Daily Summary
router.get("/logs/today", getTodayFoodSummary);
router.post("/logs", createFoodLog);
router.get("/logs", getMyFoodLogs);
router.get("/logs/:id", getFoodLogById);
router.delete("/logs/:id", deleteFoodLog);

module.exports = router;