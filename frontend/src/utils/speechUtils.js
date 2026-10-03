/**
 * speechUtils.js
 * AI Japanese Anime Mentor / Professional Fitness Coach Voice Engine
 * 
 * Voice Character & Personality:
 * - Adult Male (ผู้ชายวัยผู้ใหญ่)
 * - Deep, smooth, resonant & warm tone (เสียงทุ้ม นุ่ม ลึก และอบอุ่น)
 * - Calm, composed, confident (สุขุม เยือกเย็น มั่นใจ)
 * - Experienced Master / Mentor weight (มีน้ำหนักเสียงแบบผู้ฝึกสอนหรืออาจารย์)
 * - Moderate-to-measured tempo, never rushed (จังหวะการพูดปานกลางค่อนไปทางช้า)
 * - Clear, natural Thai pronunciation with fitness phonetic clarity
 * - Original Anime Sensei vibe without exaggerated caricature
 */

// ==========================================
// 1. Anime Mentor Voice Acoustic Profiles
// ==========================================
export const ANIME_MENTOR_VOICE_CONFIG = {
  // Default tone: deep, calm, confident, warm mentor (ทุ้ม นุ่ม ลึก สุขุม)
  default: { pitch: 0.84, rate: 0.92, description: "เสียงทุ้ม นุ่ม ลึก สุขุม มั่นใจ" },

  // Start workout: slightly more energetic and motivating (มีพลังเพิ่มขึ้นเล็กน้อย มั่นใจ)
  start: { pitch: 0.88, rate: 0.95, description: "มีพลัง มั่นใจ เริ่มต้นการฝึก" },

  // Form correction / warning: polite but firm and clear (เตือนอย่างสุภาพแต่จริงจัง ชัดเจน)
  form_warning: { pitch: 0.83, rate: 0.90, description: "สุภาพแต่จริงจัง เน้นความถูกต้องของฟอร์ม" },

  // Form praise: confident and warm praise (ชมด้วยน้ำเสียงมั่นใจและอบอุ่น)
  form_praise: { pitch: 0.85, rate: 0.92, description: "มั่นใจและอบอุ่น ให้กำลังใจอย่างจริงใจ" },

  // Counting reps: clear, steady, rhythmic cadence (พูดชัดเจนและมีจังหวะ)
  rep_count: { pitch: 0.84, rate: 0.92, description: "ชัดเจน มีจังหวะ มั่นคง" },

  // Rest period: relaxing, soothing, calm tone (น้ำเสียงผ่อนคลาย สบายๆ)
  rest: { pitch: 0.82, rate: 0.88, description: "ผ่อนคลาย ใจเย็น ให้ฟื้นฟูร่างกาย" },

  // Next set transition: steady, ready, disciplined (พร้อมและมั่นคง)
  next_set: { pitch: 0.86, rate: 0.93, description: "พร้อมและมั่นคง เตรียมเริ่มเซ็ตต่อไป" },

  // End workout: proud, encouraging mentor (ภูมิใจและให้กำลังใจอย่างจริงใจ)
  finish: { pitch: 0.85, rate: 0.90, description: "ภูมิใจ ให้กำลังใจ สรุปผลอย่างทรงคุณค่า" },
};

// ==========================================
// 2. Anime Mentor Authentic Dialogue Library
// ==========================================
export const ANIME_MENTOR_PHRASES = {
  // เริ่ม Workout
  start: [
    "เอาล่ะ เริ่มกันเลยครับ",
    "พร้อมแล้วนะครับ เข้าประจำตำแหน่งแล้วเริ่มได้เลยครับ",
  ],

  // เมื่อผู้ใช้ทำท่าผิด - เตือนอย่างสุภาพแต่จริงจัง
  form_warning: {
    back: "รักษาหลังให้ตรงครับ",
    lower: "ค่อย ๆ ย่อตัวลงครับ",
    breathe: "ค่อย ๆ หายใจ อย่ารีบครับ",
    knees: "ระวังอย่าให้หัวเข่าเลยปลายเท้านะครับ",
    core: "เกร็งหน้าท้องไว้ครับ ลำตัวนิ่งเข้าไว้",
    head: "มองตรงไปข้างหน้าครับ อย่าก้มคอ",
    elbows: "คุมข้อศอกให้ชิดลำตัวไว้ครับ",
    general: "รักษาหลังให้ตรงครับ",
  },

  // เมื่อผู้ใช้ทำท่าถูกต้อง - ชมด้วยน้ำเสียงมั่นใจและอบอุ่น
  form_praise: [
    "ดีครับ รักษาฟอร์มแบบนั้นไว้",
    "ดีมากครับ ทำต่อไป",
    "โฟกัสที่กล้ามเนื้อ คุมจังหวะได้ดีมากครับ",
    "นิ่งและมั่นคงมากครับ ลุยต่อเลย",
  ],

  // จังหวะการพูดระหว่างเซ็ต / ให้กำลังใจขณะกำลังฝึก
  idle_cues: [
    "ค่อย ๆ หายใจ อย่ารีบครับ",
    "รักษาฟอร์มและโฟกัสไว้ครับ คุณทำได้ดีแล้ว",
    "ควบคุมลมหายใจให้สม่ำเสมอครับ",
    "ดีครับ ตั้งสมาธิไว้แล้วไปต่อ",
  ],

  // ตอนพัก - ผ่อนคลาย
  rest: [
    "พักได้ครับ คุณทำได้ดีมาก",
    "ค่อย ๆ หายใจ ผ่อนคลายกล้ามเนื้อสักครู่ครับ",
    "พักดื่มน้ำให้สดชื่น แล้วค่อยเตรียมตัวสำหรับเซ็ตต่อไปครับ",
  ],

  // เซ็ตต่อไป
  next_set: [
    "พร้อมแล้วนะครับ เซ็ตต่อไปเริ่มได้เลย",
    "ลุยเซ็ตต่อไปกันครับ ตั้งสมาธิให้ดี",
  ],

  // ตอนจบ Workout - ภูมิใจและให้กำลังใจ
  finish: (reps = 0) =>
    `พักได้ครับ คุณทำได้ดีมาก วันนี้ฝึกไปทั้งหมด ${reps} ครั้ง การฝึกฝนอย่างมีวินัยคือหัวใจสำคัญ พักผ่อนให้เต็มที่แล้วพบกันใหม่ครับ`,

  // ตอนนับจำนวนครั้ง - ชัดเจนและมีจังหวะตามตัวอย่าง
  getRepCue: (currentReps, targetReps = 10) => {
    if (currentReps === 1) {
      return "เอาล่ะ เริ่มต้นได้ดีครับ คุมจังหวะไว้";
    }
    const remaining = targetReps - currentReps;
    if (remaining === 5) {
      return "เหลืออีกห้าครั้งครับ";
    }
    if (currentReps === Math.floor(targetReps / 2)) {
      return "ครึ่งทางแล้วครับ รักษาฟอร์มแบบนั้นไว้";
    }
    if (remaining === 2) {
      return "อีกสองครั้งครับ คุมฟอร์มไว้";
    }
    if (remaining === 1) {
      return "ครั้งสุดท้ายแล้วครับ ตั้งสมาธิไว้";
    }
    if (currentReps >= targetReps) {
      return "ดีมากครับ ครบตามเป้าหมายแล้ว พักได้ครับ";
    }
    return currentReps % 2 === 0
      ? "ดีครับ รักษาฟอร์มแบบนั้นไว้"
      : "ดีมากครับ ทำต่อไป";
  },
};

// ==========================================
// 3. Fitness & Nutrition Phonetics Dictionary
// ==========================================
export const FITNESS_THAI_PHONETICS = {
  // Brand & Coach
  "fitai": "ฟิต เอ ไอ",
  "trainer": "เทรนเนอร์",
  "ai": "เอ ไอ",
  "coach": "โค้ช",
  "dashboard": "แดชบอร์ด",
  "workout": "เวิร์กเอาต์",

  // Exercises
  "squat": "สควอต",
  "squats": "สควอต",
  "push-up": "พุชอัป",
  "push-ups": "พุชอัป",
  "pushup": "พุชอัป",
  "pushups": "พุชอัป",
  "pull-up": "พูลอัป",
  "pull-ups": "พูลอัป",
  "pullup": "พูลอัป",
  "pullups": "พูลอัป",
  "chin-up": "ชินอัป",
  "chin-ups": "ชินอัป",
  "plank": "แพลงก์",
  "planks": "แพลงก์",
  "side plank": "ไซด์แพลงก์",
  "lunge": "ลันจ์",
  "lunges": "ลันจ์",
  "reverse lunge": "รีเวิร์สลันจ์",
  "bird dog": "เบิร์ดด็อก",
  "knee push up": "นีพุชอัป",
  "walking lunge": "วอล์กกิ้งลันจ์",
  "burpee": "เบอร์ปี",
  "burpees": "เบอร์ปี",
  "glute bridge": "กลูทบริดจ์",
  "glute bridges": "กลูทบริดจ์",
  "jumping jack": "จัมปิ้งแจ็ค",
  "jumping jacks": "จัมปิ้งแจ็ค",
  "deadlift": "เดดลิฟต์",
  "deadlifts": "เดดลิฟต์",
  "romanian deadlift": "โรมาเนียนเดดลิฟต์",
  "bench press": "เบนช์เพรส",
  "incline bench press": "อินไคลน์เบนช์เพรส",
  "shoulder press": "โชว์เดอร์เพรส",
  "overhead press": "โอเวอร์เฮดเพรส",
  "bicep curl": "ไบเซปเคิร์ล",
  "bicep curls": "ไบเซปเคิร์ล",
  "hammer curl": "แฮมเมอร์เคิร์ล",
  "tricep dip": "ไตรเซปดิป",
  "tricep dips": "ไตรเซปดิป",
  "tricep extension": "ไตรเซปเอ็กซ์เทนชัน",
  "lat pulldown": "แล็ทดึงลง",
  "seated row": "ซีทเต็ดโรว์",
  "cable row": "เคเบิลโรว์",
  "barbell row": "บาร์เบลโรว์",
  "dumbbell row": "ดัมเบลล์โรว์",
  "leg press": "เลกเพรส",
  "leg curl": "เลกเคิร์ล",
  "leg extension": "เลกเอ็กซ์เทนชัน",
  "calf raise": "คาล์ฟเรส",
  "calf raises": "คาล์ฟเรส",
  "high knees": "ไฮนีส์",
  "mountain climber": "เมาน์เทนไคลม์เบอร์",
  "mountain climbers": "เมาน์เทนไคลม์เบอร์",
  "russian twist": "รัสเชียนทวิสต์",
  "russian twists": "รัสเชียนทวิสต์",
  "crunch": "ครันช์",
  "crunches": "ครันช์",
  "sit-up": "ซิทอัป",
  "sit-ups": "ซิทอัป",
  "situp": "ซิทอัป",
  "situps": "ซิทอัป",
  "bicycle crunch": "ไบซิเคิลครันช์",
  "bicycle crunches": "ไบซิเคิลครันช์",
  "kettlebell swing": "เคตเทิลเบลล์สวิง",
  "kettlebell swings": "เคตเทิลเบลล์สวิง",

  // Workout Terms & Anatomy
  "cardio": "คาร์ดิโอ",
  "aerobic": "แอโรบิก",
  "anaerobic": "แอนแอโรบิก",
  "hiit": "ฮิต",
  "tabata": "ทาบาตะ",
  "warm-up": "วอร์มอัป",
  "warm up": "วอร์มอัป",
  "cool-down": "คูลดาวน์",
  "cool down": "คูลดาวน์",
  "stretching": "การยืดเหยียด",
  "form": "ฟอร์ม",
  "posture": "ท่าทาง",
  "core": "แกนกลางลำตัว",
  "abs": "หน้าท้อง",
  "glutes": "กล้ามเนื้อสะโพก",
  "hamstrings": "กล้ามเนื้อหลังต้นขา",
  "quads": "กล้ามเนื้อหน้าขา",
  "quadriceps": "กล้ามเนื้อหน้าขา",
  "chest": "หน้าอก",
  "back": "หลัง",
  "shoulders": "หัวไหล่",
  "biceps": "กล้ามเนื้อต้นแขนด้านหน้า",
  "triceps": "กล้ามเนื้อต้นแขนด้านหลัง",
  "tempo": "จังหวะ",
  "range of motion": "ช่วงการเคลื่อนไหว",

  // Nutrition & Body Metrics
  "bmi": "บี เอ็ม ไอ",
  "bmr": "บี เอ็ม อาร์",
  "tdee": "ที ดี อี อี",
  "calorie": "แคลอรี่",
  "calories": "แคลอรี่",
  "protein": "โปรตีน",
  "carb": "คาร์บ",
  "carbs": "คาร์บ",
  "carbohydrate": "คาร์โบไฮเดรต",
  "carbohydrates": "คาร์โบไฮเดรต",
  "fat": "ไขมัน",
  "fats": "ไขมัน",
  "fiber": "ไฟเบอร์",
  "sodium": "โซเดียม",
  "sugar": "น้ำตาล",
  "deficit": "เดฟิซิต",
  "calorie deficit": "แคลอรี่เดฟิซิต",
  "surplus": "เซอร์พลัส",
  "calorie surplus": "แคลอรี่เซอร์พลัส",
  "bulk": "บัล์ก",
  "bulking": "บัล์ก",
  "cut": "คัต",
  "cutting": "คัต",
  "whey": "เวย์",
  "whey protein": "เวย์โปรตีน",
  "creatine": "ครีเอทีน",
  "metabolism": "การเผาผลาญ"
};

// Sorted keys for longest-first matching
const SORTED_PHONETIC_KEYS = Object.keys(FITNESS_THAI_PHONETICS).sort(
  (a, b) => b.length - a.length
);

// ==========================================
// 4. Text Normalization & Cleaning
// ==========================================
export function cleanTextForSpeech(rawText) {
  if (!rawText || typeof rawText !== "string") return "";

  let text = rawText;

  // 1. Remove action tags like [LOG_FOOD_ACTION: ...]
  text = text.replace(/\[LOG_FOOD_ACTION:[\s\S]*?\]/gi, "");

  // 2. Remove markdown code blocks and inline code
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`([^`]+)`/g, "$1");

  // 3. Remove image tags ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "");

  // 4. Convert markdown links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 5. Remove raw URLs
  text = text.replace(/https?:\/\/[^\s)]+/gi, "");

  // 6. Remove HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // 7. Remove headings (#, ##, ###), blockquotes (>), bold/italic (*, **, _, ~~)
  text = text.replace(/^[#\s=->]+ /gm, "");
  text = text.replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1");
  text = text.replace(/[*_~#]/g, "");

  // 8. Remove bullet points and divider lines
  text = text.replace(/^[-*•]\s+/gm, "");
  text = text.replace(/^[-=_*]{3,}\s*$/gm, "");

  // 9. Expand common units and abbreviations
  text = text.replace(/(\d+(?:\.\d+)?)\s*(?:kcal|แคลอรี่|cal)\b/gi, "$1 กิโลแคลอรี่");
  text = text.replace(/(\d+(?:\.\d+)?)\s*kg\b/gi, "$1 กิโลกรัม");
  text = text.replace(/(\d+(?:\.\d+)?)\s*g\b/gi, "$1 กรัม");
  text = text.replace(/(\d+(?:\.\d+)?)\s*mg\b/gi, "$1 มิลลิกรัม");
  text = text.replace(/(\d+(?:\.\d+)?)\s*cm\b/gi, "$1 เซนติเมตร");
  text = text.replace(/(\d+(?:\.\d+)?)\s*m\b/gi, "$1 เมตร");
  text = text.replace(/(\d+(?:\s*-\s*\d+)?)\s*reps?\b/gi, "$1 ครั้ง");
  text = text.replace(/(\d+(?:\s*-\s*\d+)?)\s*sets?\b/gi, "$1 เซ็ต");
  text = text.replace(/(\d+(?:\.\d+)?)\s*(?:mins?|min)\b/gi, "$1 นาที");
  text = text.replace(/(\d+(?:\.\d+)?)\s*(?:secs?|sec|s)\b/gi, "$1 วินาที");

  // 10. Phoneticize English fitness loanwords when context is Thai
  const hasThai = /[\u0E00-\u0E7F]/.test(text);
  if (hasThai) {
    for (const englishTerm of SORTED_PHONETIC_KEYS) {
      const thaiPhonetic = FITNESS_THAI_PHONETICS[englishTerm];
      const regex = new RegExp(`\\b${englishTerm}\\b`, "gi");
      text = text.replace(regex, thaiPhonetic);
    }

    // Smooth "ค่อย ๆ" and Maiyamok
    text = text.replace(/ค่อย\s*ๆ/g, "ค่อย ค่อย");
  }

  // 11. Remove stray brackets & symbols that TTS engines read out literally
  text = text.replace(/[\[\]{}()\\\/<>&|~^%#@+=_]/g, " ");

  // 12. Remove emojis that can cause stutter
  text = text.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    ""
  );

  // 13. Collapse multiple spaces and excess newlines
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n\s*\n+/g, "\n");

  return text.trim();
}

// ==========================================
// 5. Sentence Chunking & Language Routing
// ==========================================
export function splitIntoSpeechChunks(text) {
  if (!text) return [];

  // Normalize list numbers (e.g., "1. ") to "ข้อ 1 " for natural cadence
  const normalizedText = text.replace(/^(\d+)\.\s+/gm, "ข้อ $1 ");

  const lines = normalizedText.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const chunks = [];

  for (const line of lines) {
    const hasThai = /[\u0E00-\u0E7F]/.test(line);
    const hasEnglishSentence =
      /(?:[A-Z][a-zA-Z\s]{4,}[.!?])|(?:[A-Z][a-z]+(?:\s+[A-Za-z]+){2,})/.test(line);

    if (hasThai && hasEnglishSentence) {
      const sentences = line.split(/(?<=[.!?])\s+/).filter(Boolean);
      for (const s of sentences) {
        if (s.trim()) chunks.push(s.trim());
      }
    } else if (line.length > 140) {
      // Split long lines by punctuation or natural mentor pauses (ครับ, นะครับ, อย่ารีบครับ)
      const subParts = line.split(/(?<=[,;])\s+|(?<=(?:ครับ|นะครับ|นะ|เลย|อย่ารีบครับ))\s+/).filter(Boolean);
      for (const part of subParts) {
        if (part.trim()) chunks.push(part.trim());
      }
    } else {
      chunks.push(line);
    }
  }

  return chunks.map((chunk) => {
    const hasThai = /[\u0E00-\u0E7F]/.test(chunk);
    return {
      text: chunk,
      lang: hasThai ? "th-TH" : "en-US",
    };
  });
}

// ==========================================
// 6. Voice Discovery & Adult Male Priority Engine
// ==========================================
let cachedVoices = [];

export function getAvailableVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices;
}

// Listen to voiceschanged event
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
  cachedVoices = window.speechSynthesis.getVoices();
}

/**
 * Filter helpers to strictly select adult male mentor voices and avoid high-pitch/female voices
 */
function isFemaleVoice(name = "") {
  const lower = name.toLowerCase();
  return (
    lower.includes("premwadee") ||
    lower.includes("achara") ||
    lower.includes("jenny") ||
    lower.includes("aria") ||
    lower.includes("zira") ||
    lower.includes("samantha") ||
    lower.includes("victoria") ||
    lower.includes("karen") ||
    lower.includes("moira") ||
    lower.includes("fiona") ||
    lower.includes("veena") ||
    lower.includes("female") ||
    lower.includes("woman") ||
    lower.includes("girl")
  );
}

function isMaleVoice(name = "") {
  const lower = name.toLowerCase();
  return (
    lower.includes("niwat") ||
    lower.includes("pattara") ||
    lower.includes("guy") ||
    lower.includes("christopher") ||
    lower.includes("david") ||
    lower.includes("mark") ||
    lower.includes("george") ||
    lower.includes("keita") ||
    lower.includes("daichi") ||
    lower.includes("takumi") ||
    lower.includes("naoki") ||
    lower.includes("male") ||
    lower.includes("man")
  );
}

/**
 * Select the highest quality Adult Male Anime Mentor voice
 */
export function getBestVoice(targetLang = "th-TH") {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const isThai = targetLang.toLowerCase().startsWith("th");

  if (isThai) {
    // 1. Edge/Windows Natural Online Male Voice (Microsoft Niwat Online - Studio Quality)
    const niwatVoice = voices.find(
      (v) =>
        (v.name.includes("Niwat") || (isMaleVoice(v.name) && v.lang.toLowerCase().startsWith("th"))) &&
        (v.name.includes("Natural") || v.name.includes("Online"))
    );
    if (niwatVoice) return niwatVoice;

    // 2. Any local/installed Male Thai voice
    const localMaleThai = voices.find(
      (v) => v.lang.toLowerCase().startsWith("th") && isMaleVoice(v.name)
    );
    if (localMaleThai) return localMaleThai;

    // 3. Chrome Google ภาษาไทย (modulated with pitch 0.84 to give resonant deep adult male tone)
    const googleThai = voices.find(
      (v) =>
        v.name.toLowerCase().includes("google") &&
        (v.lang.toLowerCase().includes("th") || v.name.includes("ภาษาไทย"))
    );
    if (googleThai) return googleThai;

    // 4. Any Thai voice that is not explicitly marked female
    const nonFemaleThai = voices.find(
      (v) => v.lang.toLowerCase().startsWith("th") && !isFemaleVoice(v.name)
    );
    if (nonFemaleThai) return nonFemaleThai;

    // 5. Ultimate Thai fallback
    const anyThai = voices.find((v) => v.lang.toLowerCase().startsWith("th"));
    if (anyThai) return anyThai;
  } else {
    // English chunks: Deep resonant adult male narrators (Microsoft Guy / Christopher / David)
    const maleEnNatural = voices.find(
      (v) =>
        (v.name.includes("Natural") || v.name.includes("Online")) &&
        v.lang.toLowerCase().startsWith("en") &&
        (v.name.includes("Guy") || v.name.includes("Christopher") || isMaleVoice(v.name)) &&
        !isFemaleVoice(v.name)
    );
    if (maleEnNatural) return maleEnNatural;

    const localMaleEn = voices.find(
      (v) => v.lang.toLowerCase().startsWith("en") && isMaleVoice(v.name) && !isFemaleVoice(v.name)
    );
    if (localMaleEn) return localMaleEn;

    const googleEn = voices.find(
      (v) =>
        v.name.toLowerCase().includes("google") &&
        v.lang.toLowerCase().startsWith("en") &&
        !isFemaleVoice(v.name)
    );
    if (googleEn) return googleEn;

    const nonFemaleEn = voices.find(
      (v) => v.lang.toLowerCase().startsWith("en") && !isFemaleVoice(v.name)
    );
    if (nonFemaleEn) return nonFemaleEn;

    const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    if (anyEn) return anyEn;
  }

  return voices.find((v) => v.lang.toLowerCase().startsWith(targetLang.slice(0, 2))) || null;
}

// ==========================================
// 7. Speech Queue & Playback Controller
// ==========================================
let currentSpeechQueue = [];
let currentQueueIndex = 0;
let isSpeakingActive = false;
let keepAliveTimer = null;
let currentCallbacks = null;

function startKeepAlive() {
  stopKeepAlive();
  keepAliveTimer = setInterval(() => {
    if (
      typeof window !== "undefined" &&
      window.speechSynthesis &&
      window.speechSynthesis.speaking
    ) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      stopKeepAlive();
    }
  }, 9000);
}

function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

/**
 * Stop any ongoing speech immediately and clear queue
 */
export function stopSpeech() {
  isSpeakingActive = false;
  currentSpeechQueue = [];
  currentQueueIndex = 0;
  stopKeepAlive();

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("speechSynthesis cancel error:", e);
    }
  }

  if (currentCallbacks && typeof currentCallbacks.onEnd === "function") {
    currentCallbacks.onEnd();
  }
  currentCallbacks = null;
}

export function isSpeakingNow() {
  return isSpeakingActive;
}

/**
 * Speak text with high clarity, adult male anime mentor persona, and Chrome cutoff prevention.
 * @param {string} rawText - Raw text or workout cheer
 * @param {object} options - Configuration options
 */
export function speakText(rawText, options = {}) {
  const {
    context = "default",
    rate: customRate,
    pitch: customPitch,
    lang: forceLang = null,
    onStart = null,
    onEnd = null,
    onError = null,
    force = false, // if true, ignore localStorage check
  } = options;

  // Check if voice is disabled in user preferences
  if (!force && typeof window !== "undefined") {
    const enabled = localStorage.getItem("fitai-ai-voice-enabled");
    if (enabled === "false") {
      return false;
    }
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Browser does not support SpeechSynthesis.");
    if (onError) onError(new Error("SpeechSynthesis not supported"));
    return false;
  }

  // Cancel any prior speech
  stopSpeech();

  // Clean raw text
  const cleanedText = cleanTextForSpeech(rawText);
  if (!cleanedText) return false;

  // Split into manageable chunks
  const chunks = splitIntoSpeechChunks(cleanedText);
  if (chunks.length === 0) return false;

  // Get anime mentor preset for given context
  const mentorProfile = ANIME_MENTOR_VOICE_CONFIG[context] || ANIME_MENTOR_VOICE_CONFIG.default;

  // Pitch: Deep, resonant adult male (0.84 default)
  const speechPitch = typeof customPitch === "number" ? customPitch : mentorProfile.pitch;

  // Rate: Measured, composed mentor cadence (0.92 default)
  let speechRate = customRate;
  if (typeof speechRate !== "number") {
    const savedRate = parseFloat(localStorage.getItem("fitai-speech-rate") || "");
    speechRate = !isNaN(savedRate) && savedRate > 0 ? savedRate : mentorProfile.rate;
  }

  currentSpeechQueue = chunks;
  currentQueueIndex = 0;
  isSpeakingActive = true;
  currentCallbacks = { onStart, onEnd, onError };

  if (onStart) onStart();
  startKeepAlive();

  function playNextChunk() {
    if (!isSpeakingActive || currentQueueIndex >= currentSpeechQueue.length) {
      isSpeakingActive = false;
      stopKeepAlive();
      if (currentCallbacks && typeof currentCallbacks.onEnd === "function") {
        currentCallbacks.onEnd();
      }
      currentCallbacks = null;
      return;
    }

    const chunk = currentSpeechQueue[currentQueueIndex];
    const chunkLang = forceLang || chunk.lang || "th-TH";
    const utterance = new SpeechSynthesisUtterance(chunk.text);

    utterance.lang = chunkLang;
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    // Pick best Adult Male Voice
    const bestVoice = getBestVoice(chunkLang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onend = () => {
      currentQueueIndex++;
      playNextChunk();
    };

    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") {
        return;
      }
      console.warn("Utterance error:", event);
      currentQueueIndex++;
      playNextChunk();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("SpeechSynthesis.speak failed:", err);
      if (currentCallbacks && typeof currentCallbacks.onError === "function") {
        currentCallbacks.onError(err);
      }
      stopSpeech();
    }
  }

  playNextChunk();
  return true;
}

/**
 * Specialized high-level trigger for Anime Mentor Workout Cues
 */
export function speakAnimeMentorCue(cueType, params = {}, options = {}) {
  let phrase = "";
  let context = cueType;

  if (cueType === "start") {
    phrase = ANIME_MENTOR_PHRASES.start[0]; // "เอาล่ะ เริ่มกันเลยครับ"
    context = "start";
  } else if (cueType === "rep") {
    const rep = params.rep || 1;
    const target = params.target || 10;
    phrase = params.phrase || ANIME_MENTOR_PHRASES.getRepCue(rep, target);
    context = (target - rep <= 5) ? "rep_count" : "form_praise";
  } else if (cueType === "warning") {
    const key = params.key || "general";
    phrase = params.phrase || ANIME_MENTOR_PHRASES.form_warning[key] || "รักษาหลังให้ตรงครับ";
    context = "form_warning";
  } else if (cueType === "praise") {
    const list = ANIME_MENTOR_PHRASES.form_praise;
    phrase = params.phrase || list[Math.floor(Math.random() * list.length)];
    context = "form_praise";
  } else if (cueType === "idle") {
    const list = ANIME_MENTOR_PHRASES.idle_cues;
    phrase = list[Math.floor(Math.random() * list.length)];
    context = "form_praise";
  } else if (cueType === "rest") {
    phrase = params.phrase || ANIME_MENTOR_PHRASES.rest[0]; // "พักได้ครับ คุณทำได้ดีมาก"
    context = "rest";
  } else if (cueType === "next_set") {
    phrase = params.phrase || ANIME_MENTOR_PHRASES.next_set[0]; // "พร้อมแล้วนะครับ เซ็ตต่อไปเริ่มได้เลย"
    context = "next_set";
  } else if (cueType === "finish") {
    phrase = params.phrase || ANIME_MENTOR_PHRASES.finish(params.reps || 0);
    context = "finish";
  } else if (typeof params === "string") {
    phrase = params;
  }

  const profile = ANIME_MENTOR_VOICE_CONFIG[context] || ANIME_MENTOR_VOICE_CONFIG.default;

  return speakText(phrase, {
    context,
    pitch: options.pitch ?? profile.pitch,
    rate: options.rate ?? profile.rate,
    force: options.force ?? true,
    ...options,
  });
}

export default {
  speakText,
  speakAnimeMentorCue,
  stopSpeech,
  isSpeakingNow,
  cleanTextForSpeech,
  splitIntoSpeechChunks,
  getAvailableVoices,
  getBestVoice,
  FITNESS_THAI_PHONETICS,
  ANIME_MENTOR_VOICE_CONFIG,
  ANIME_MENTOR_PHRASES,
};
