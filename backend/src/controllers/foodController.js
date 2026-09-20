const prisma = require("../services/prisma");
const { analyzeFoodImage } = require("../services/foodAiService");
const {
  calculateTotalNutrition,
  getNutrition,
  searchFoodDatabase,
} = require("../services/nutritionService");

function getAutoMealType() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "BREAKFAST";
  if (hour >= 11 && hour < 16) return "LUNCH";
  if (hour >= 16 && hour < 22) return "DINNER";
  return "SNACK";
}

function calculateBMRAndTDEE(profile) {
  if (!profile || !profile.weight || !profile.height || !profile.age) {
    return { bmr: 1600, tdee: 2100 };
  }

  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const age = Number(profile.age);
  const gender = String(profile.gender || "").toLowerCase();

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "male" || gender === "ชาย") {
    bmr += 5;
  } else if (gender === "female" || gender === "หญิง") {
    bmr -= 161;
  } else {
    bmr -= 78;
  }

  // TDEE multiplier based on training goal or sessions
  let multiplier = 1.35; // moderately active
  const sessions = Number(profile.sessionsPerWeek) || 3;
  if (sessions <= 1) multiplier = 1.2;
  else if (sessions <= 3) multiplier = 1.375;
  else if (sessions <= 5) multiplier = 1.55;
  else multiplier = 1.725;

  const tdee = Math.round(bmr * multiplier);
  return { bmr: Math.round(bmr), tdee };
}

/**
 * POST /api/food/analyze
 * Accepts multipart/form-data with `image` file OR json body with `imageBase64`.
 */
async function analyzeFood(req, res) {
  try {
    let base64Image = null;

    if (req.file) {
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "ไฟล์ภาพไม่ถูกต้อง รองรับเฉพาะ JPG, PNG, WEBP เท่านั้น",
        });
      }
      base64Image = req.file.buffer.toString("base64");
    } else if (req.body && req.body.imageBase64) {
      base64Image = req.body.imageBase64;
    } else if (req.body && req.body.image) {
      base64Image = req.body.image;
    }

    if (!base64Image) {
      return res.status(400).json({
        success: false,
        message: "กรุณาอัปโหลดรูปภาพอาหารหรือส่ง base64 image",
      });
    }

    // Determine mealType
    const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
    let mealType = String(req.body?.mealType || "").toUpperCase();
    if (!validMealTypes.includes(mealType)) {
      mealType = getAutoMealType();
    }

    // Call AI vision detection
    const aiResult = await analyzeFoodImage(base64Image, req.body?.confidence);
    const rawFoods = aiResult.foods || [];

    if (rawFoods.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          mealType,
          items: [],
          total: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          warning: "ไม่พบรายการอาหารในรูปภาพอย่างชัดเจน กรุณากรอกชื่ออาหารด้วยตนเอง",
        },
      });
    }

    // Calculate calories & nutrition from Nutrition Database
    const { items, total } = calculateTotalNutrition(rawFoods);

    const minConfidence = items.reduce(
      (min, item) => Math.min(min, item.confidence || 1),
      1
    );

    const needsVerification = minConfidence < 0.60;
    const warning = needsVerification
      ? "AI is not confident about this food. Please verify the food item manually."
      : null;

    return res.status(200).json({
      success: true,
      data: {
        mealType,
        items,
        total,
        needsVerification,
        warning,
        source: aiResult.source,
      },
    });
  } catch (error) {
    console.error("Analyze food error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถวิเคราะห์รูปอาหารได้ กรุณาลองถ่ายรูปใหม่",
      error: error.message,
    });
  }
}

/**
 * POST /api/food/calculate
 * Calculate nutrition breakdown from food items.
 */
async function calculateNutrition(req, res) {
  try {
    const { items, name, quantity, unit } = req.body || {};

    if (Array.isArray(items) && items.length > 0) {
      const result = calculateTotalNutrition(items);
      return res.json({ success: true, data: result });
    }

    if (name) {
      const single = getNutrition({ name, quantity, unit });
      return res.json({
        success: true,
        data: {
          items: [single],
          total: {
            calories: single.calories,
            protein: single.protein,
            carbs: single.carbs,
            fat: single.fat,
          },
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: "กรุณาระบุ items หรือ name ของอาหาร",
    });
  } catch (error) {
    console.error("Calculate nutrition error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถคำนวณโภชนาการได้",
    });
  }
}

/**
 * POST /api/food/logs
 * Confirm and save user's food log to database.
 */
async function createFoodLog(req, res) {
  try {
    const userId = req.user.userId;
    const { mealType, items, imageUrl, note, loggedAt } = req.body || {};

    const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
    const cleanMealType = String(mealType || "").toUpperCase();
    if (!validMealTypes.includes(cleanMealType)) {
      return res.status(400).json({
        success: false,
        message: "mealType ต้องเป็น BREAKFAST, LUNCH, DINNER หรือ SNACK",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรายการอาหารอย่างน้อย 1 รายการ",
      });
    }

    // Verify and calculate authoritative totals
    const { items: enrichedItems, total } = calculateTotalNutrition(items);

    const log = await prisma.foodLog.create({
      data: {
        userId,
        mealType: cleanMealType,
        imageUrl: imageUrl ? String(imageUrl).slice(0, 5000) : null,
        note: note ? String(note).slice(0, 255) : null,
        totalCalories: total.calories,
        totalProtein: total.protein,
        totalCarbs: total.carbs,
        totalFat: total.fat,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        items: {
          create: enrichedItems.map((item) => ({
            name: String(item.name || "อาหาร").trim(),
            quantity: Number(item.quantity) || 1,
            unit: String(item.unit || "จาน").trim(),
            calories: Number(item.calories) || 0,
            protein: Number(item.protein) || 0,
            carbs: Number(item.carbs) || 0,
            fat: Number(item.fat) || 0,
            confidence: item.confidence !== undefined ? Number(item.confidence) : null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "บันทึกประวัติอาหารเรียบร้อยแล้ว",
      data: log,
    });
  } catch (error) {
    console.error("Create food log error:", error);
    return res.status(500).json({
      success: false,
      message: "บันทึกข้อมูลอาหารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    });
  }
}

/**
 * GET /api/food/logs
 * Retrieve food log history for authenticated user.
 */
async function getMyFoodLogs(req, res) {
  try {
    const userId = req.user.userId;
    const { date, limit = 20, page = 1 } = req.query;

    const where = { userId };
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      where.loggedAt = { gte: dayStart, lte: dayEnd };
    }

    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;

    const [logs, totalCount] = await Promise.all([
      prisma.foodLog.findMany({
        where,
        include: { items: true },
        orderBy: { loggedAt: "desc" },
        take,
        skip,
      }),
      prisma.foodLog.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total: totalCount,
          page: Number(page) || 1,
          limit: take,
          totalPages: Math.ceil(totalCount / take),
        },
      },
    });
  } catch (error) {
    console.error("Get food logs error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงประวัติอาหารได้",
    });
  }
}

/**
 * GET /api/food/logs/today
 * Retrieve today's calories, macro totals, and meal breakdown compared with user's TDEE target.
 */
async function getTodayFoodSummary(req, res) {
  try {
    const userId = req.user.userId;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [logs, profile] = await Promise.all([
      prisma.foodLog.findMany({
        where: {
          userId,
          loggedAt: { gte: todayStart, lte: todayEnd },
        },
        include: { items: true },
        orderBy: { loggedAt: "asc" },
      }),
      prisma.profile.findUnique({ where: { userId } }),
    ]);

    const consumed = logs.reduce(
      (acc, log) => ({
        calories: Math.round((acc.calories + log.totalCalories) * 10) / 10,
        protein: Math.round((acc.protein + log.totalProtein) * 10) / 10,
        carbs: Math.round((acc.carbs + log.totalCarbs) * 10) / 10,
        fat: Math.round((acc.fat + log.totalFat) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const mealBreakdown = {
      BREAKFAST: { calories: 0, logs: [] },
      LUNCH: { calories: 0, logs: [] },
      DINNER: { calories: 0, logs: [] },
      SNACK: { calories: 0, logs: [] },
    };

    for (const log of logs) {
      const type = log.mealType || "SNACK";
      if (mealBreakdown[type]) {
        mealBreakdown[type].calories =
          Math.round((mealBreakdown[type].calories + log.totalCalories) * 10) / 10;
        mealBreakdown[type].logs.push(log);
      }
    }

    const { bmr, tdee } = calculateBMRAndTDEE(profile);
    const targetCalories = tdee;
    const remainingCalories = Math.max(0, targetCalories - consumed.calories);

    return res.json({
      success: true,
      data: {
        date: new Date().toISOString().slice(0, 10),
        consumed,
        target: {
          calories: targetCalories,
          bmr,
          tdee,
        },
        remainingCalories,
        mealBreakdown,
        logs,
      },
    });
  } catch (error) {
    console.error("Get today food summary error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงข้อมูลแคลอรีประจำวันได้",
    });
  }
}

/**
 * GET /api/food/logs/:id
 */
async function getFoodLogById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const log = await prisma.foodLog.findFirst({
      where: { id, userId: req.user.userId },
      include: { items: true },
    });

    if (!log) {
      return res.status(404).json({ success: false, message: "Food log not found" });
    }

    return res.json({ success: true, data: log });
  } catch (error) {
    console.error("Get food log by ID error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * DELETE /api/food/logs/:id
 */
async function deleteFoodLog(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const log = await prisma.foodLog.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!log) {
      return res.status(404).json({ success: false, message: "Food log not found" });
    }

    await prisma.foodLog.delete({ where: { id } });

    return res.json({
      success: true,
      message: "ลบรายการอาหารสำเร็จ",
    });
  } catch (error) {
    console.error("Delete food log error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * GET /api/food/search?q=...
 */
async function searchFoods(req, res) {
  try {
    const query = req.query.q || "";
    const results = searchFoodDatabase(query, 12);
    return res.json({ success: true, data: results });
  } catch (error) {
    console.error("Search foods error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  analyzeFood,
  calculateNutrition,
  createFoodLog,
  getMyFoodLogs,
  getTodayFoodSummary,
  getFoodLogById,
  deleteFoodLog,
  searchFoods,
};