const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "../data/nutritionDatabase.json");

let cachedDatabase = null;

/**
 * Load and normalize the nutrition database.
 * Auto-corrects 0-calorie entries using the Atwater formula (4P + 4C + 9F).
 */
function loadDatabase() {
  if (cachedDatabase) return cachedDatabase;
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);

    // Normalize and fix zero-calorie entries
    for (const item of parsed) {
      if (!item.serving) item.serving = {};
      if (!item.per100g) item.per100g = {};

      const sPro = Number(item.serving.protein) || 0;
      const sCarb = Number(item.serving.carbs) || 0;
      const sFat = Number(item.serving.fat) || 0;
      let sCal = Number(item.serving.calories) || 0;

      if (sCal <= 0) {
        sCal = Math.round(sPro * 4 + sCarb * 4 + sFat * 9);
        if (sCal <= 0) sCal = 150; // Fallback sensible default
        item.serving.calories = sCal;
      }

      const pPro = Number(item.per100g.protein) || 0;
      const pCarb = Number(item.per100g.carbs) || 0;
      const pFat = Number(item.per100g.fat) || 0;
      let pCal = Number(item.per100g.calories) || 0;

      if (pCal <= 0) {
        pCal = Math.round(pPro * 4 + pCarb * 4 + pFat * 9);
        if (pCal <= 0) pCal = Math.round(sCal / 3);
        item.per100g.calories = pCal;
      }
    }

    cachedDatabase = parsed;
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
 * Extract culinary concepts (proteins, cooking styles, dishes) from text.
 * Guarded against Thai subword false positives.
 */
function extractConcepts(text = "", category = "") {
  const norm = normalizeText(text);
  const proteins = [];
  const styles = [];

  // Proteins
  if (/ไก่|เป็ด|นก|ห่าน|\bchicken\b|\bduck\b|\bpoultry\b/i.test(norm)) proteins.push('chicken');
  if (/หมู|เบคอน|กุนเชียง|หมูกรอบ|หมูแดง|หมูสับ|แคบหมู|\bpork\b|\bbeacon\b/i.test(norm)) proteins.push('pork');
  if (/เนื้อ|วัว|สเต็กเนื้อ|\bbeef\b/i.test(norm)) proteins.push('beef');
  if (/ปลา|กุ้ง|ปลาหมึก|หมึก|หอย|ปู|แซลมอน|ทูน่า|ซีฟู้ด|ทะเล|\bfish\b|\bshrimp\b|\bprawn\b|\bsquid\b|\bcrab\b|\bsalmon\b|\btuna\b|\bseafood\b/i.test(norm)) proteins.push('seafood');

  // Guard egg vs boba pearls (ไข่มุก)
  if (/ไข่/i.test(norm) && !/ไข่มุก/i.test(norm)) proteins.push('egg');
  if (/เต้าหู้|ถั่ว|เห็ด|ธัญพืช|งา|\btofu\b|\bsoy\b|\bbean\b|\bmushroom\b/i.test(norm)) proteins.push('plant');

  // Clean special compounds to avoid false positives
  const cleanNoChashu = norm.replace(/ชาชู/g, '').replace(/ชาบู/g, '');
  const cleanNoKhanom = cleanNoChashu.replace(/ขนมจีน/g, '').replace(/ขนม/g, '');

  const isSweetSnack = /เค้ก|พุดดิ้ง|ไอศกรีม|ไอติม|บิงซู|บัวลอย|ทองหยอด|ฝอยทอง|คุกกี้|เบเกอรี่|\bcake\b|\bcookie\b|\bdessert\b/i.test(cleanNoKhanom) || (/ขนม/i.test(norm) && !/ขนมจีน|ขนมจีบ|ขนมผักกาด/i.test(norm));

  // Cooking styles & special categories
  if (/แกงส้ม/i.test(norm)) styles.push('gaeng_som');
  if (/ต้มยำ/i.test(norm)) styles.push('tom_yum');
  if (/กะเพรา|กระเพรา/i.test(norm)) styles.push('krapow');
  if (/ต้ม|แกง|ซุป|ตุ๋น|ต้มจืด|เกาเหลา|\bsoup\b|\bcurry\b/i.test(norm)) styles.push('soup_curry');
  if (/ผัด|ทอด|คั่ว|\bstir-fry\b|\bfried\b/i.test(norm)) styles.push('stir_fry');
  if (/ย่าง|ปิ้ง|อบ|เผา|\bgrilled\b|\broasted\b|\bbbq\b/i.test(norm)) styles.push('grill_roast');
  if (/นึ่ง|ลวก/i.test(norm)) styles.push('steam_boil');
  if (/ยำ|สลัด|ส้มตำ|ลาบ|น้ำตก|พล่า|\bsalad\b/i.test(norm)) styles.push('salad_yum');
  if (/ข้าว|ข้าวผัด|ข้าวมัน|ข้าวต้ม|ข้าวหน้า|ข้าวเหนียว|โจ๊ก|\brice\b/i.test(norm)) styles.push('rice');
  if (/ก๋วยเตี๋ยว|บะหมี่|เส้น|ผัดไทย|ผัดซีอิ๊ว|ราดหน้า|สปาเก็ตตี้|มักกะโรนี|วุ้นเส้น|ขนมจีน|ราเมง|อูด้ง|พาสต้า|\bnoodle\b|\bpasta\b/i.test(norm)) styles.push('noodle');
  if ((/สเต็ก|เบอร์เกอร์|แซนด์วิช/i.test(norm) || /\b(steak|burger|sandwich)\b/i.test(norm)) && !isSweetSnack) styles.push('western');

  // Beverage (Drinks, teas, coffees, shakes)
  const isBev = category === 'beverage' ||
    /กาแฟ|ชาเขียว|ชาไทย|ชาดำ|ชาจีน|ชาอู่หลง|ชานม|ชาเย็น|อเมริกาโน|ลาเต้|เอสเปรสโซ|สมูทตี้|น้ำผลไม้|น้ำเต้าหู้|นมสด|เวย์โปรตีน/i.test(norm) ||
    /\b(coffee|tea|latte|smoothie|drink|juice|shake|espresso)\b/i.test(norm) ||
    (/นม/i.test(cleanNoKhanom) && !/ข้าวมัน|กะทิ/i.test(norm)) ||
    (/ชา/i.test(cleanNoChashu) && !/ชาบู|มัทฉะ/i.test(norm));
  if (isBev) styles.push('beverage');

  // Dessert
  const isDess = isSweetSnack || /ไข่มุก/i.test(norm) || /บัวลอย|ลอดช่อง|ทองหยอด|ฝอยทอง|น้ำกะทิ|วุ้น/i.test(norm);
  if (isDess) styles.push('dessert');

  return { norm, proteins, styles, isSweetSnack };
}

/**
 * Find the closest matching food entry from the database.
 * Strict on name length ratio to avoid over-matching ingredient substrings.
 */
function findFoodEntry(query = "") {
  const db = loadDatabase();
  const normalized = normalizeText(query);
  if (!normalized) return null;

  // 1. Exact match on id, name, or aliases
  for (const item of db) {
    if (normalizeText(item.name) === normalized) return item;
    if (normalizeText(item.nameEn) === normalized) return item;
    if (item.aliases && item.aliases.some((alias) => normalizeText(alias) === normalized)) {
      return item;
    }
  }

  // 2. High-confidence match (must cover >= 75% of query length)
  let bestMatch = null;
  let maxScore = 0;

  for (const item of db) {
    let itemScore = 0;
    const allAliases = [item.name, item.nameEn, ...(item.aliases || [])];

    for (const alias of allAliases) {
      const normAlias = normalizeText(alias);
      if (normalized === normAlias) {
        return item;
      }
      if (normalized.includes(normAlias) && normAlias.length >= 3) {
        const ratio = normAlias.length / normalized.length;
        if (ratio >= 0.75) {
          const score = normAlias.length * 2;
          if (score > itemScore) itemScore = score;
        }
      } else if (normAlias.includes(normalized) && normalized.length >= 3) {
        const ratio = normalized.length / normAlias.length;
        if (ratio >= 0.75) {
          const score = normalized.length * 2;
          if (score > itemScore) itemScore = score;
        }
      }
    }

    if (itemScore > maxScore) {
      maxScore = itemScore;
      bestMatch = item;
    }
  }

  return maxScore >= 8 ? bestMatch : null;
}

/**
 * Intelligent food similarity and substitute recommendation engine.
 * When a user asks or searches for an unknown dish (or substitute menu),
 * this function finds the closest related entries with explanation reasons.
 */
function findSimilarFoodEntries(query = "", limit = 4, excludeId = null, excludeName = null) {
  const db = loadDatabase();
  const q = extractConcepts(query);
  const normQ = q.norm;
  if (!normQ) return [];

  const scored = [];
  const normExclude = excludeName ? normalizeText(excludeName) : null;

  for (const item of db) {
    if (excludeId && item.id === excludeId) continue;
    const itemNameNorm = normalizeText(item.name);
    if (itemNameNorm === normQ) continue;
    if (normExclude && itemNameNorm === normExclude) continue;

    const allAliases = [item.name, item.nameEn || '', ...(item.aliases || [])].map(normalizeText);
    const it = extractConcepts(item.name + ' ' + (item.aliases || []).join(' '), item.category);

    // Cross-category exclusion guards
    if (q.styles.includes('beverage') && !it.styles.includes('beverage') && item.category !== 'beverage') continue;
    if (!q.isSweetSnack && !q.styles.includes('dessert') && !q.styles.includes('beverage') && (it.isSweetSnack || it.styles.includes('dessert') || item.category === 'beverage')) continue;

    let score = 0;
    const reasons = [];

    // 0. Base dish match (e.g. "ข้าวมันไก่กรอบ" contains "ข้าวมันไก่")
    if (normQ.includes(itemNameNorm) && itemNameNorm.length >= 3) {
      score += 55;
      reasons.push('เมนูหลักตระกูลเดียวกัน รสชาติและสัมผัสใกล้เคียง');
    } else if (itemNameNorm.includes(normQ) && normQ.length >= 3) {
      score += 50;
      reasons.push('เมนูหลักตระกูลเดียวกัน รสชาติและสัมผัสใกล้เคียง');
    }

    // 1. Exact sub-style match
    if (q.styles.includes('gaeng_som') && it.styles.includes('gaeng_som')) {
      score += 65;
      reasons.push('เมนูตระกูลแกงส้ม รสชาติเปรี้ยวเผ็ดสไตล์เดียวกัน');
    }
    if (q.styles.includes('tom_yum') && it.styles.includes('tom_yum')) {
      score += 65;
      reasons.push('เมนูตระกูลต้มยำ รสชาติจัดจ้านสไตล์เดียวกัน');
    }
    if (q.styles.includes('krapow') && it.styles.includes('krapow')) {
      score += 65;
      reasons.push('เมนูกะเพรารสชาติจัดจ้าน ทดแทนกันได้ลงตัว');
    }
    if (q.styles.includes('western') && it.styles.includes('western')) {
      score += 55;
      reasons.push('เมนูอาหารสไตล์ตะวันตก/สเต็กคล้ายคลึงกัน');
    }

    // 2. Beverage / Drink match
    if (q.styles.includes('beverage') && (it.styles.includes('beverage') || item.category === 'beverage')) {
      score += 50;
      if (item.category === 'beverage') score += 50;
      if (/ชา/i.test(normQ) && /ชา/i.test(itemNameNorm)) {
        score += 30;
        reasons.push('เครื่องดื่มตระกูลชาเพื่อสุขภาพ สดชื่นคลายร้อน');
      } else if (/นม/i.test(normQ) && (/(?:นมสด|นมจืด|นมวัว|นมถั่ว|นมอัลมอนด์|ชานม|นมเปรี้ยว)/i.test(itemNameNorm) || item.name.startsWith('นม'))) {
        score += 30;
        reasons.push('เครื่องดื่มตระกูลนม มีโปรตีนและแคลเซียมทดแทนได้');
      } else {
        reasons.push('เครื่องดื่มเพื่อสุขภาพทางเลือก น้ำตาลต่ำ สดชื่นคลายร้อน');
      }
    }

    // 3. Protein source match
    const sharedProteins = q.proteins.filter(p => it.proteins.includes(p));
    if (sharedProteins.length > 0) {
      score += 35;
      const pMap = { chicken: 'ไก่', pork: 'หมู', beef: 'เนื้อวัว', seafood: 'อาหารทะเล/ปลา', egg: 'ไข่', plant: 'โปรตีนพืช' };
      reasons.push('มีแหล่งโปรตีนหลักจาก' + (pMap[sharedProteins[0]] || 'เนื้อสัตว์') + 'เหมือนกัน');
    }

    // 4. Style match
    const sharedStyles = q.styles.filter(s => it.styles.includes(s) && !['gaeng_som', 'tom_yum', 'krapow', 'western', 'beverage'].includes(s));
    if (sharedStyles.length > 0) {
      score += 30;
      const sMap = { soup_curry: 'ต้ม/แกง', stir_fry: 'ผัด', grill_roast: 'ย่าง/อบ', steam_boil: 'นึ่ง/ลวก', salad_yum: 'ยำ/สลัด', rice: 'จานข้าว', noodle: 'เส้น/ก๋วยเตี๋ยว', dessert: 'ของหวาน' };
      reasons.push('เป็นเมนูประเภท' + (sMap[sharedStyles[0]] || 'อาหาร') + 'คล้ายคลึงกัน');
    }

    // 5. Query token containment
    const qTokens = normQ.split(' ').filter(t => t.length >= 2);
    for (const t of qTokens) {
      if (allAliases.some(a => a.includes(t))) {
        score += 20;
      }
    }

    // 6. Healthy / Low Calorie Substitute bonus
    if ((normQ.includes('ทอด') || normQ.includes('กรอบ') || normQ.includes('มัน')) && (it.styles.includes('steam_boil') || it.styles.includes('grill_roast'))) {
      score += 25;
      reasons.push('ทางเลือกแคลอรี่ต่ำกว่า ไขมันน้อย ดีต่อสุขภาพ');
    }

    if (score >= 35) {
      scored.push({
        item,
        score,
        reason: reasons[0] || 'คุณค่าทางโภชนาการและรูปแบบเมนูใกล้เคียงกัน',
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const results = [];
  const seen = new Set();
  for (const s of scored) {
    const key = s.item.name.replace(/\s+/g, '').slice(0, 6);
    if (!seen.has(key)) {
      seen.add(key);
      results.push({
        id: s.item.id,
        name: s.item.name,
        nameEn: s.item.nameEn,
        category: s.item.category,
        serving: s.item.serving,
        per100g: s.item.per100g,
        score: s.score,
        reason: s.reason,
        isAlternative: true,
      });
    }
    if (results.length >= limit) break;
  }

  // Fallback for beverage or healthy dishes if 0 results
  if (results.length === 0) {
    if (q.styles.includes('beverage')) {
      const bevItems = db.filter(d => d.category === 'beverage');
      bevItems.slice(0, limit).forEach(b => {
        results.push({
          id: b.id,
          name: b.name,
          nameEn: b.nameEn,
          category: b.category,
          serving: b.serving,
          per100g: b.per100g,
          score: 25,
          reason: 'เครื่องดื่มเพื่อสุขภาพทางเลือก น้ำตาลต่ำ สดชื่นคลายร้อน',
          isAlternative: true,
        });
      });
    } else {
      const staples = ['ข้าวกะเพราอกไก่', 'ต้มยำกุ้ง', 'แกงจืดเต้าหู้หมูสับ', 'สลัดอกไก่', 'ไข่ต้ม'];
      for (const st of staples) {
        const found = db.find(d => d.name === st);
        if (found && results.length < limit) {
          results.push({
            id: found.id,
            name: found.name,
            nameEn: found.nameEn,
            category: found.category,
            serving: found.serving,
            per100g: found.per100g,
            score: 20,
            reason: 'เมนูสุขภาพยอดนิยมคุณค่าทางโภชนาการสมดุล',
            isAlternative: true,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Calculate nutrition for a single item.
 * If unrecognized, estimates nutrition intelligently and attaches similar dish suggestions.
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
      confidence: typeof confidence === "number" ? Math.min(1, Math.max(0.1, confidence)) : 0.92,
      isCustom: false,
    };
  }

  // Fallback for custom/unrecognized food item:
  // Estimate baseline meal based on concept extraction (soup vs stir-fry vs drink vs meal)
  const concepts = extractConcepts(name);
  let baseCal = 350;
  let basePro = 18;
  let baseCarb = 45;
  let baseFat = 12;

  if (concepts.styles.includes('soup_curry')) {
    baseCal = 220; basePro = 16; baseCarb = 15; baseFat = 8;
  } else if (concepts.styles.includes('salad_yum')) {
    baseCal = 180; basePro = 14; baseCarb = 18; baseFat = 6;
  } else if (concepts.styles.includes('noodle')) {
    baseCal = 340; basePro = 16; baseCarb = 48; baseFat = 9;
  } else if (concepts.styles.includes('beverage')) {
    baseCal = 140; basePro = 2; baseCarb = 26; baseFat = 3;
  } else if (concepts.styles.includes('dessert')) {
    baseCal = 280; basePro = 4; baseCarb = 48; baseFat = 10;
  } else if (concepts.styles.includes('stir_fry') && (name.includes('ทอด') || name.includes('กรอบ'))) {
    baseCal = 520; basePro = 22; baseCarb = 55; baseFat = 24;
  }

  const defaultCalories = baseCal * numQty;
  const defaultProtein = basePro * numQty;
  const defaultCarbs = baseCarb * numQty;
  const defaultFat = baseFat * numQty;

  const suggestions = findSimilarFoodEntries(name, 3);

  return {
    name: String(name || "อาหารทั่วไป").trim(),
    matchedId: null,
    quantity: numQty,
    unit: cleanUnit || (concepts.styles.includes('beverage') ? "แก้ว" : (concepts.styles.includes('soup_curry') || concepts.styles.includes('noodle') ? "ชาม" : "จาน")),
    calories: Math.round(defaultCalories * 10) / 10,
    protein: Math.round(defaultProtein * 10) / 10,
    carbs: Math.round(defaultCarbs * 10) / 10,
    fat: Math.round(defaultFat * 10) / 10,
    confidence: typeof confidence === "number" ? Math.min(1, Math.max(0.1, confidence)) : 0.5,
    isCustom: true,
    suggestedAlternatives: suggestions,
  };
}

/**
 * Calculate totals for an array of items.
 */
function calculateTotalNutrition(items = []) {
  if (!Array.isArray(items)) items = [];

  const enrichedItems = items.map((item) => {
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
 * Search database for autocomplete / manual entry.
 * If 0 or very few direct matches found, attaches intelligent similar food suggestions.
 */
function searchFoodDatabase(keyword = "", limit = 10) {
  const db = loadDatabase();
  const norm = normalizeText(keyword);
  if (!norm) return db.slice(0, limit);

  const results = [];
  for (const item of db) {
    const allAliases = [item.name, item.nameEn || '', ...(item.aliases || [])];
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

  // If few or no direct matches, attach recommendations
  const suggestions = results.length < 3 ? findSimilarFoodEntries(keyword, 4) : [];
  results.suggestions = suggestions;

  return results;
}

/**
 * Enhanced search endpoint helper with explicit structured response
 */
function searchFoodsWithSuggestions(keyword = "", limit = 10) {
  const directMatches = searchFoodDatabase(keyword, limit);
  const suggestions = findSimilarFoodEntries(keyword, 4);

  return {
    data: directMatches,
    notFound: directMatches.length === 0,
    suggestions: directMatches.length < 3 ? suggestions : [],
  };
}

module.exports = {
  loadDatabase,
  findFoodEntry,
  findSimilarFoodEntries,
  getNutrition,
  calculateTotalNutrition,
  searchFoodDatabase,
  searchFoodsWithSuggestions,
  extractConcepts,
};
