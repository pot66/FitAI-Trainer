const prisma = require("../services/prisma");

function calculateBMI(weight, height) {
  const heightInMeter = height / 100;

  return weight / (heightInMeter * heightInMeter);
}

function getBMIStatus(bmi) {
  if (bmi < 18.5) {
    return "Underweight";
  }

  if (bmi < 25) {
    return "Normal";
  }

  if (bmi < 30) {
    return "Overweight";
  }

  return "Obese";
}

async function getMyProfile(req, res) {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      // A profile is intentionally absent during first-time onboarding.
      // Treat that as an application state, not an HTTP error.
      return res.json({
        success: true,
        data: null,
      });
    }

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function createOrUpdateProfile(req, res) {
  try {
    const { name, gender, age, height, weight } = req.body;

    if (age === undefined || height === undefined || weight === undefined) {
      return res.status(400).json({
        success: false,
        message: "Age, height and weight are required",
      });
    }

    if (age < 1 || age > 120) {
      return res.status(400).json({
        success: false,
        message: "Invalid age",
      });
    }

    if (height <= 0 || weight <= 0) {
      return res.status(400).json({
        success: false,
        message: "Height and weight must be greater than 0",
      });
    }

    const bmi = calculateBMI(weight, height);
    const bmiStatus = getBMIStatus(bmi);

    if (name !== undefined && String(name).trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    const profile = await prisma.profile.upsert({
      where: {
        userId: req.user.userId,
      },
      update: {
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        bmi: Number(bmi.toFixed(2)),
        bmiStatus,
        ...(gender !== undefined && { gender: String(gender) }),
      },
      create: {
        userId: req.user.userId,
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        bmi: Number(bmi.toFixed(2)),
        bmiStatus,
        ...(gender !== undefined && { gender: String(gender) }),
      },
    });

    if (name !== undefined) {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { name: String(name).trim() },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Save profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  getMyProfile,
  createOrUpdateProfile,
};
