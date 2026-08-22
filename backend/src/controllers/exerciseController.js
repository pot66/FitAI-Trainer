const prisma = require("../services/prisma");

async function getExercises(req, res) {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error("Get exercises error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getExerciseById(req, res) {
  try {
    const exerciseId = Number(req.params.id);

    if (!Number.isInteger(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exercise ID",
      });
    }

    const exercise = await prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    return res.json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    console.error("Get exercise error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  getExercises,
  getExerciseById,
};