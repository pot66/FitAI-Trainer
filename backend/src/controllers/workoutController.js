const prisma = require("../services/prisma");

async function createWorkout(req, res) {
  try {
    const {
      exerciseId,
      repetitions,
      duration,
      score,
      startedAt,
      completedAt,
    } = req.body;

    if (!exerciseId) {
      return res.status(400).json({
        success: false,
        message: "exerciseId is required",
      });
    }

    const exercise = await prisma.exercise.findUnique({
      where: {
        id: Number(exerciseId),
      },
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    const workout = await prisma.workoutSession.create({
      data: {
        userId: req.user.userId,
        exerciseId: Number(exerciseId),

        repetitions:
          repetitions !== undefined
            ? Number(repetitions)
            : null,

        duration:
          duration !== undefined
            ? Number(duration)
            : null,

        score:
          score !== undefined
            ? Number(score)
            : null,

        startedAt: startedAt
          ? new Date(startedAt)
          : new Date(),

        completedAt: completedAt
          ? new Date(completedAt)
          : null,
      },

      include: {
        exercise: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Workout saved successfully",
      data: workout,
    });
  } catch (error) {
    console.error("Create workout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getMyWorkouts(req, res) {
  try {
    const workouts = await prisma.workoutSession.findMany({
      where: {
        userId: req.user.userId,
      },

      include: {
        exercise: true,
      },

      orderBy: {
        startedAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: workouts,
    });
  } catch (error) {
    console.error("Get workouts error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getWorkoutById(req, res) {
  try {
    const workoutId = Number(req.params.id);

    if (!Number.isInteger(workoutId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workout ID",
      });
    }

    const workout = await prisma.workoutSession.findFirst({
      where: {
        id: workoutId,
        userId: req.user.userId,
      },

      include: {
        exercise: true,
      },
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    return res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    console.error("Get workout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createWorkout,
  getMyWorkouts,
  getWorkoutById,
};