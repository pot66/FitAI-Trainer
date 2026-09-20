const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "../data/nutritionDatabase.json");

let cachedDatabase = null;

function loadDatabase() {
  if (cachedDatabase) return cachedDatabase;
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    cachedDatabase = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load nutritionDatabase.json:", err.message);
    cachedDatabase = [];
  }
  return cachedDatabase;
}

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Find the closest matching food entry from the database.
 */
function findFoodEntry(query = "") {
  const db = loadDatabase();
  const normalized = normalizeText(query);
  if (!normalized) return null;

  // 1. Exact match on id, name, or aliases
  for (const item of db) {
    if (normalizeText(item.name) === normalized) return item;
    if (normalizeText(item.nameEn) === normalized) return item;
    if (item.aliases.some((alias) => normalizeText(alias) === normalized)) {
      return item;
    }
  }

  // 2. Substring match (longest match priority)
  let bestMatch = null;
  let maxScore = 0;

  for (const item of db) {
    let itemScore = 0;
    const allAliases = [item.name, item.nameEn, ...item.aliases];

    for (const alias of allAliases) {
      const normAlias = normalizeText(alias);
      if (normalized.includes(normAlias)) {
        const score = normAlias.length * 2;
        if (score > itemScore) itemScore = score;
      } else if (normAlias.includes(normalized)) {
        const score = normalized.length;
        if (score > itemScore) itemScore = score;
      }
    }

    if (itemScore > maxScore) {
      maxScore = itemScore;
      bestMatch = item;
    }
  }

  return maxScore >= 4 ? bestMatch : null;
}

/**
 * Calculate nutrition for a single item.
 */
function getNutrition({ name, quantity = 1, unit = "จาน", confidence = 0.9 }) {
  const numQty = Number(quantity) > 0 ? Number(quantity) : 1;
  const cleanUnit = String(unit || "จาน").trim().toLowerCase();
  const entry = findFoodEntry(name);

  if (entry) {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    // Unit calculation
    if (cleanUnit === "g" || cleanUnit === "กรัม") {
      const ratio = numQty / 100;
      calories = entry.per100g.calories * ratio;
      protein = entry.per100g.protein * ratio;
      carbs = entry.per100g.carbs * ratio;
      fat = entry.per100g.fat * ratio;
    } else if (cleanUnit === "kg" || cleanUnit === "กิโลกรัม") {
      const ratio = (numQty * 1000) / 100;
      calories = entry.per100g.calories * ratio;
      protein = entry.per100g.protein * ratio;
      carbs = entry.per100g.carbs * ratio;
      fat = entry.per100g.fat * ratio;
    } else {
      // Per serving (plate / bowl / piece / egg / cup)
      calories = entry.serving.calories * numQty;
      protein = entry.serving.protein * numQty;
      carbs = entry.serving.carbs * numQty;
      fat = entry.serving.fat * numQty;
    }

    return {
      name: entry.name,
      matchedId: entry.id,
      quantity: numQty,
      unit: entry.serving.unit || cleanUnit,
      calories: Math.round(calories * 10) / 10,
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      confidence: typeof confidence === "number" ? Math.min(1, Math.max(0.1, confidence)) : 0.88,
      isCustom: false,
    };
  }

  // Fallback for custom/unrecognized food item:
  // Estimate moderate baseline meal (approx 350 kcal / plate)
  const defaultCalories = 350 * numQty;
  const defaultProtein = 15 * numQty;
  const defaultCarbs = 45 * numQty;
  const defaultFat = 12 * numQty;

  return {
    name: String(name || "อาหารทั่วไป").trim(),
    matchedId: null,
    quantity: numQty,
    unit: cleanUnit || "จาน",
    calories: Math.round(defaultCalories * 10) / 10,
    protein: Math.round(defaultProtein * 10) / 10,
    carbs: Math.round(defaultCarbs * 10) / 10,
    fat: Math.round(defaultFat * 10) / 10,
    confidence: typeof confidence === "number" ? Math.min(1, Math.max(0.1, confidence)) : 0.5,
    isCustom: true,
  };
}

/**
 * Calculate totals for an array of items.
 */
function calculateTotalNutrition(items = []) {
  if (!Array.isArray(items)) items = [];

  const enrichedItems = items.map((item) => {
    // If calories/protein/carbs/fat already given and custom edited, keep them scaled
    if (
      typeof item.calories === "number" &&
      typeof item.protein === "number" &&
      typeof item.carbs === "number" &&
      typeof item.fat === "number" &&
      item.isCustomEdited
    ) {
      return {
        ...item,
        quantity: Number(item.quantity) || 1,
        calories: Math.round(Number(item.calories) * 10) / 10,
        protein: Math.round(Number(item.protein) * 10) / 10,
        carbs: Math.round(Number(item.carbs) * 10) / 10,
        fat: Math.round(Number(item.fat) * 10) / 10,
      };
    }
    return getNutrition(item);
  });

  const total = enrichedItems.reduce(
    (acc, curr) => ({
      calories: Math.round((acc.calories + curr.calories) * 10) / 10,
      protein: Math.round((acc.protein + curr.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + curr.carbs) * 10) / 10,
      fat: Math.round((acc.fat + curr.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { items: enrichedItems, total };
}

/**
 * Search database for autocomplete / manual entry
 */
function searchFoodDatabase(keyword = "", limit = 10) {
  const db = loadDatabase();
  const norm = normalizeText(keyword);
  if (!norm) return db.slice(0, limit);

  const results = [];
  for (const item of db) {
    const allAliases = [item.name, item.nameEn, ...item.aliases];
    const matched = allAliases.some((a) => normalizeText(a).includes(norm));
    if (matched) {
      results.push({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn,
        category: item.category,
        serving: item.serving,
        per100g: item.per100g,
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}

module.exports = {
  findFoodEntry,
  getNutrition,
  calculateTotalNutrition,
  searchFoodDatabase,
};