const prisma = require('../services/prisma');
const { generateWeeklyPlan, suggestPlanAdjustment } = require('../services/aiService');
const { aiConfig } = require('../config');

async function createWeeklyPlan(req, res) {
  try {
    const userId = req.user.userId;
    const [profile, exercises] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.exercise.findMany({ orderBy: { id: 'asc' } }),
    ]);
    if (!profile) return res.status(400).json({ success: false, message: 'กรุณาสร้าง Profile ก่อนสร้างแผน' });
    const plan = await generateWeeklyPlan({ profile, exercises, user: { id: userId } });
    return res.json({ success: true, data: plan });
  } catch (error) {
    console.error('AI plan error:', error);
    return res.status(500).json({ success: false, message: 'ไม่สามารถสร้าง AI Plan ได้' });
  }
}

async function detectExercise(req, res) {
  try {
    const aiUrl = aiConfig.aiService.url;
    const response = await fetch(`${aiUrl}/exercise/detect`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageBase64: req.body?.imageBase64,
        confidence: req.body?.confidence,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json();
    return res.status(response.ok ? 200 : 502).json(data);
  } catch (error) {
    console.error("Exercise AI proxy failed:", error.message);
    return res.status(503).json({
      success: false,
      available: false,
      message: "Exercise AI service unavailable",
    });
  }
}

async function adjustWeeklyPlan(req, res) {
  try {
    const { plan, message, todayKey, lastAssistantMessage } = req.body || {};
    if (!Array.isArray(plan) || !message || !todayKey) {
      return res.status(400).json({ success: false, message: "plan, message and todayKey are required" });
    }
    const [profile, exercises] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: req.user.userId } }),
      prisma.exercise.findMany({ orderBy: { name: "asc" } }),
    ]);
    const result = await suggestPlanAdjustment({ profile, exercises, plan, message, todayKey, lastAssistantMessage });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI plan adjustment error:", error);
    return res.status(500).json({ success: false, message: "Unable to adjust workout plan" });
  }
}

module.exports = { createWeeklyPlan, detectExercise, adjustWeeklyPlan };
