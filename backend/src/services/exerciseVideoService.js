const prisma = require('./prisma');

// Supplemental verified YouTube tutorials for exercises that might not have a record in the DB table
const SUPPLEMENTAL_VIDEOS = [
  {
    exerciseName: 'Crunch',
    title: 'Crunch - วิดีโอสอน',
    url: 'https://youtu.be/Xyd_fa5zoEU',
    videoId: 'Xyd_fa5zoEU',
    category: 'Core',
    targetMuscle: 'Abdominals, Core',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Bird Dog',
    title: 'Bird Dog - วิดีโอสอน',
    url: 'https://youtu.be/wiFNA3sqjCA',
    videoId: 'wiFNA3sqjCA',
    category: 'Core',
    targetMuscle: 'Core, Back',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Dead Bug',
    title: 'Dead Bug - วิดีโอสอน',
    url: 'https://youtu.be/g_BYB0R-4Ws',
    videoId: 'g_BYB0R-4Ws',
    category: 'Core',
    targetMuscle: 'Core',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Wall Push Up',
    title: 'Wall Push Up - วิดีโอสอน',
    url: 'https://youtu.be/a6YHbXD2XlU',
    videoId: 'a6YHbXD2XlU',
    category: 'Strength',
    targetMuscle: 'Chest, Shoulders, Triceps',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Chair Squat',
    title: 'Chair Squat - วิดีโอสอน',
    url: 'https://youtu.be/XX9_T4Y_Kew',
    videoId: 'XX9_T4Y_Kew',
    category: 'Strength',
    targetMuscle: 'Quadriceps, Glutes',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Cat Cow',
    title: 'Cat Cow Stretch - วิดีโอสอน',
    url: 'https://youtu.be/vdyM_G1iZ18',
    videoId: 'vdyM_G1iZ18',
    category: 'Mobility',
    targetMuscle: 'Back, Spine',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Arm Circles',
    title: 'Arm Circles - วิดีโอสอน',
    url: 'https://youtu.be/140RTNMdQ4U',
    videoId: '140RTNMdQ4U',
    category: 'Mobility',
    targetMuscle: 'Shoulders',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Side Plank',
    title: 'Side Plank - วิดีโอสอน',
    url: 'https://youtu.be/K2VljzCC16g',
    videoId: 'K2VljzCC16g',
    category: 'Core',
    targetMuscle: 'Core, Obliques',
    difficulty: 'Intermediate',
  },
  {
    exerciseName: 'March In Place',
    title: 'March In Place - วิดีโอสอน',
    url: 'https://youtu.be/c3A2N2Z-rQY',
    videoId: 'c3A2N2Z-rQY',
    category: 'Cardio',
    targetMuscle: 'Full Body',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Calf Raise',
    title: 'Calf Raise - วิดีโอสอน',
    url: 'https://youtu.be/gwLzBJYoWlI',
    videoId: 'gwLzBJYoWlI',
    category: 'Strength',
    targetMuscle: 'Calves',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Step Up',
    title: 'Step Up - วิดีโอสอน',
    url: 'https://youtu.be/dQqApCGd5Ss',
    videoId: 'dQqApCGd5Ss',
    category: 'Strength',
    targetMuscle: 'Quadriceps, Glutes',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Bodyweight Row',
    title: 'Bodyweight Row - วิดีโอสอน',
    url: 'https://youtu.be/rloXYB8M3vU',
    videoId: 'rloXYB8M3vU',
    category: 'Strength',
    targetMuscle: 'Back, Biceps',
    difficulty: 'Intermediate',
  },
  {
    exerciseName: 'Romanian Deadlift',
    title: 'Romanian Deadlift - วิดีโอสอน',
    url: 'https://youtu.be/JCXUYuzwNrM',
    videoId: 'JCXUYuzwNrM',
    category: 'Strength',
    targetMuscle: 'Hamstrings, Glutes',
    difficulty: 'Intermediate',
  },
  {
    exerciseName: 'Sumo Squat',
    title: 'Sumo Squat - วิดีโอสอน',
    url: 'https://youtu.be/9ZuXKqRbT9k',
    videoId: '9ZuXKqRbT9k',
    category: 'Strength',
    targetMuscle: 'Glutes, Adductors, Quads',
    difficulty: 'Beginner',
  },
  {
    exerciseName: 'Jumping Jack',
    title: 'Jumping Jacks - วิดีโอสอน',
    url: 'https://youtu.be/c4DAnQ6DtF8',
    videoId: 'c4DAnQ6DtF8',
    category: 'Cardio',
    targetMuscle: 'Full Body',
    difficulty: 'Beginner',
  },
];

let cachedVideoMap = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

function normalizeKey(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]/g, '')
    .trim();
}

/**
 * Loads and caches all exercise videos from DB + supplements.
 */
async function loadAllVideos() {
  const now = Date.now();
  if (cachedVideoMap && now - cacheTime < CACHE_TTL_MS) {
    return cachedVideoMap;
  }

  const map = new Map();

  // 1. Supplemental videos
  for (const item of SUPPLEMENTAL_VIDEOS) {
    const key = normalizeKey(item.exerciseName);
    map.set(key, {
      exerciseName: item.exerciseName,
      title: item.title,
      url: item.url,
      videoId: item.videoId,
      category: item.category,
      targetMuscle: item.targetMuscle,
      difficulty: item.difficulty,
    });
  }

  // 2. Query DB
  try {
    const dbVideos = await prisma.exerciseVideo.findMany({
      where: { isActive: true },
      include: { exercise: true },
      orderBy: { priority: 'desc' },
    });

    for (const v of dbVideos) {
      const exerciseName = v.exercise?.name || v.title.split('-')[0].trim();
      const key = normalizeKey(exerciseName);
      let cleanTitle = String(v.title || '').trim();
      if (cleanTitle.includes('?') || !cleanTitle) {
        cleanTitle = `${exerciseName} - วิดีโอสอน`;
      }
      map.set(key, {
        exerciseName,
        title: cleanTitle,
        url: v.url,
        videoId: v.videoId,
        category: v.exercise?.category || v.goal || 'General',
        targetMuscle: v.exercise?.targetMuscle || '',
        difficulty: v.difficulty || v.exercise?.difficulty || 'Beginner',
      });

      // Variations
      if (exerciseName.includes('-') || exerciseName.includes(' ')) {
        map.set(normalizeKey(exerciseName.replace(/[- ]/g, '')), map.get(key));
      }
    }
  } catch (error) {
    console.warn('Could not load exercise videos from DB:', error.message);
  }

  // Synonyms and common aliases
  const aliases = [
    ['pushup', 'push-up'],
    ['pushups', 'push-up'],
    ['วิดพื้น', 'push-up'],
    ['สควอต', 'squat'],
    ['สควัต', 'squat'],
    ['แพลงก์', 'plank'],
    ['แพลงค์', 'plank'],
    ['ลันจ์', 'lunges'],
    ['บริดจ์', 'glute bridge'],
    ['กระโดดตบ', 'jumping jack'],
    ['เบอร์ปี', 'burpee'],
    ['ซิทอัพ', 'sit-up'],
    ['เดินเร็ว', 'walking'],
    ['วิ่ง', 'jogging'],
    ['ปั่นจักรยาน', 'cycling'],
    ['กระโดดเชือก', 'jump rope'],
    ['ว่ายน้ำ', 'swimming'],
  ];

  for (const [alias, canonical] of aliases) {
    const canonicalKey = normalizeKey(canonical);
    if (map.has(canonicalKey)) {
      map.set(normalizeKey(alias), map.get(canonicalKey));
    }
  }

  cachedVideoMap = map;
  cacheTime = now;
  return cachedVideoMap;
}

/**
 * Finds video info for a specific exercise name.
 */
async function getVideoForExercise(exerciseName) {
  const map = await loadAllVideos();
  const key = normalizeKey(exerciseName);
  if (map.has(key)) return map.get(key);

  // Partial search
  for (const [k, v] of map.entries()) {
    if (k.length >= 4 && (k.includes(key) || key.includes(k))) {
      return v;
    }
  }

  return null;
}

/**
 * Returns a compact catalog string of exercises with their YouTube links for Ollama system prompt.
 */
async function getPromptCatalog() {
  const map = await loadAllVideos();
  const lines = [];
  const seen = new Set();

  for (const item of map.values()) {
    if (!seen.has(item.exerciseName)) {
      seen.add(item.exerciseName);
      lines.push(`• ${item.exerciseName}: [${item.title}](${item.url})`);
    }
  }

  return lines.slice(0, 45).join('\n');
}

/**
 * Enriches any text response (from Ollama or Fallback) by ensuring every mentioned exercise
 * has its verified YouTube video link attached!
 */
async function enrichResponseWithVideos(text = '', userQuery = '') {
  if (!text || typeof text !== 'string') return text;

  // Do NOT attach exercise videos if user or response is primarily about food/nutrition, calories, or greetings
  const combinedContext = (String(userQuery || '') + ' ' + text).toLowerCase();
  const isFoodOrDiet = /(อาหาร|เมนู|กิน|ทาน|แคล|calorie|โปรตีน|คาร์บ|ไขมัน|ข้าว|มื้อ|diet|food|น้ำหนักเกิน|ลดความอ้วน|nutrition)/i.test(userQuery || '');
  const hasExerciseIntent = /(ท่า|ออกกำลัง|workout|exercise|ซ้อม|ฝึก|บริหาร|สควอท|วิดพื้น|แพลงก์|squat|push.?up|lunge)/i.test(userQuery || '');
  
  if (isFoodOrDiet && !hasExerciseIntent) {
    return text;
  }

  const map = await loadAllVideos();
  const lines = text.split('\n');
  const mentionedVideos = new Map();
  let modified = false;

  const allItems = [...map.values()].sort((a, b) => b.exerciseName.length - a.exerciseName.length);

  // Process line by line
  const processedLines = lines.map((line) => {
    const hasYtLink = /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(line);
    const hasFakeOrPlaceholder = /example|placeholder|61u92jG4d5U|dummy|test_video/i.test(line);

    // Look for matching exercise in this line
    let matchedItem = null;
    for (const item of allItems) {
      const name = item.exerciseName;
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRegex = new RegExp(`(^|[\\s*•\\-–—(])${escaped}(?:s|es)?([\\s*•\\-–—),:]|$)`, 'i');
      if (nameRegex.test(line)) {
        matchedItem = item;
        break;
      }
    }

    if (matchedItem) {
      mentionedVideos.set(matchedItem.exerciseName, matchedItem);

      // If line has a fake or placeholder YouTube link, replace it with the verified one
      if (hasFakeOrPlaceholder && hasYtLink) {
        modified = true;
        return line
          .replace(/\[([^\]]*)\]\(https?:\/\/[^\)]+\)/gi, `[วิดีโอสอน: ${matchedItem.title}](${matchedItem.url})`)
          .replace(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\S+/gi, matchedItem.url);
      }

      // If line does not have any YouTube link and is an exercise bullet/item
      if (!hasYtLink && /^\s*(?:[-*•–—]|\d+\.)\s+/i.test(line)) {
        modified = true;
        return `${line.trimEnd()}  ▶️ [วิดีโอสอน: ${matchedItem.title}](${matchedItem.url})`;
      }
    }

    return line;
  });

  // If we enriched lines inline, return joined lines
  if (modified) {
    return processedLines.join('\n');
  }

  // If exercises were mentioned in text paragraphs without individual bullets and without links,
  // append a clean video reference section at the end!
  const unlinked = [];
  const seenExerciseNames = new Set();
  const seenUrls = new Set();

  for (const item of allItems) {
    if (seenExerciseNames.has(item.exerciseName) || seenUrls.has(item.url)) {
      continue;
    }

    const escaped = item.exerciseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[\\s*•\\-–—(])${escaped}(?:s|es)?([\\s*•\\-–—),:]|$)`, 'i');

    if (regex.test(text)) {
      if (!text.includes(item.url)) {
        // Ensure this isn't just a substring of another already-added exercise (e.g. Plank inside Side Plank)
        const isSubstring = [...seenExerciseNames].some((existing) => existing.includes(item.exerciseName));
        if (!isSubstring) {
          unlinked.push(item);
          seenExerciseNames.add(item.exerciseName);
          seenUrls.add(item.url);
        }
      }
    }
  }

  if (unlinked.length > 0) {
    const videoSection = [
      '',
      '---',
      '🎥 **วิดีโอสาธิตท่าออกกำลังกายจาก YouTube:**',
      ...unlinked.map((item) => {
      const cleanTitle = (item.title || `${item.exerciseName} - วิดีโอสอน`).replace(/\?+/g, '').trim();
      return `• **${item.exerciseName}**: [${cleanTitle}](${item.url})`;
    }),
    ].join('\n');

    return `${text.trimEnd()}\n${videoSection}`;
  }

  return text;
}

module.exports = {
  loadAllVideos,
  getVideoForExercise,
  getPromptCatalog,
  enrichResponseWithVideos,
};
