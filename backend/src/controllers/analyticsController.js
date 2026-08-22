const prisma = require('../services/prisma');

function average(values) {
  const clean = values.map(Number).filter(Number.isFinite);
  return clean.length ? Number((clean.reduce((a, b) => a + b, 0) / clean.length).toFixed(1)) : 0;
}

async function getDashboardAnalytics(req, res) {
  try {
    const userId = req.user.userId;
    const [profile, workouts] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.workoutSession.findMany({ where: { userId }, include: { exercise: true }, orderBy: { startedAt: 'desc' }, take: 60 }),
    ]);
    const scores = workouts.map((w) => w.score).filter((v) => v !== null);
    const totalReps = workouts.reduce((sum, w) => sum + Number(w.repetitions || 0), 0);
    const totalDuration = workouts.reduce((sum, w) => sum + Number(w.duration || 0), 0);
    const uniqueDays = new Set(workouts.map((w) => new Date(w.startedAt).toISOString().slice(0, 10))).size;
    const recent = workouts.slice(0, 10);
    return res.json({
      success: true,
      data: {
        profile,
        totals: { sessions: workouts.length, uniqueDays, repetitions: totalReps, durationSeconds: totalDuration, averageScore: average(scores) },
        recent,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: 'ไม่สามารถโหลด Analytics ได้' });
  }
}

module.exports = { getDashboardAnalytics };
