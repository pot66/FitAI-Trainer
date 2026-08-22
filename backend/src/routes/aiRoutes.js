const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { createWeeklyPlan, detectExercise, adjustWeeklyPlan } = require('../controllers/aiController');
const router = express.Router();

router.post('/weekly-plan', authMiddleware, createWeeklyPlan);
router.post('/exercise-detect', authMiddleware, detectExercise);
router.post('/plan-adjustment', authMiddleware, adjustWeeklyPlan);

module.exports = router;
