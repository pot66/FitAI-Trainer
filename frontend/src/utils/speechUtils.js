/**
 * speechUtils.js
 * High-definition, crystal-clear bilingual (Thai & English) Text-to-Speech Engine
 * for FitAI Trainer Chatbot & Workout Audio Assistant.
 */

// ==========================================
// 1. Fitness & Nutrition Phonetics Dictionary
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
// 2. Text Normalization & Cleaning
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
  // kcal / cal
  text = text.replace(/(\d+(?:\.\d+)?)\s*(?:kcal|แคลอรี่|cal)\b/gi, "$1 กิโลแคลอรี่");
  // kg / g / mg
  text = text.replace(/(\d+(?:\.\d+)?)\s*kg\b/gi, "$1 กิโลกรัม");
  text = text.replace(/(\d+(?:\.\d+)?)\s*g\b/gi, "$1 กรัม");
  text = text.replace(/(\d+(?:\.\d+)?)\s*mg\b/gi, "$1 มิลลิกรัม");
  // cm / m
  text = text.replace(/(\d+(?:\.\d+)?)\s*cm\b/gi, "$1 เซนติเมตร");
  text = text.replace(/(\d+(?:\.\d+)?)\s*m\b/gi, "$1 เมตร");
  // reps / sets
  text = text.replace(/(\d+(?:\s*-\s*\d+)?)\s*reps?\b/gi, "$1 ครั้ง");
  text = text.replace(/(\d+(?:\s*-\s*\d+)?)\s*sets?\b/gi, "$1 เซ็ต");
  // min / sec
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
// 3. Sentence Chunking & Language Routing
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
      // Split on sentence boundaries between Thai and English
      const sentences = line.split(/(?<=[.!?])\s+/).filter(Boolean);
      for (const s of sentences) {
        if (s.trim()) chunks.push(s.trim());
      }
    } else if (line.length > 160) {
      // Split long lines by commas or conversational pauses
      const subParts = line.split(/(?<=[,;])\s+|(?<=(?:ครับ|ค่ะ|นะ|เลย))\s+/).filter(Boolean);
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
// 4. Voice Discovery & Selection Engine
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
  // Initial prime
  cachedVoices = window.speechSynthesis.getVoices();
}

/**
 * Select the highest quality, clearest voice available on the user's OS/browser
 */
export function getBestVoice(targetLang = "th-TH") {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const isThai = targetLang.toLowerCase().startsWith("th");

  if (isThai) {
    // 1. Edge/Windows Natural Online Thai Voices (Studio quality)
    const naturalThai = voices.find(
      (v) =>
        (v.name.includes("Natural") || v.name.includes("Online")) &&
        (v.lang.toLowerCase().includes("th") || v.name.includes("Thai") || v.name.includes("Niwat") || v.name.includes("Premwadee"))
    );
    if (naturalThai) return naturalThai;

    // 2. Chrome Google ภาษาไทย
    const googleThai = voices.find(
      (v) =>
        v.name.toLowerCase().includes("google") &&
        (v.lang.toLowerCase().includes("th") || v.name.includes("ภาษาไทย"))
    );
    if (googleThai) return googleThai;

    // 3. Local OS Thai Voices (e.g. Microsoft Pattara)
    const localThai = voices.find((v) => v.lang.toLowerCase().startsWith("th"));
    if (localThai) return localThai;
  } else {
    // 1. Edge/Windows Natural Online English Voices (Studio quality)
    const naturalEn = voices.find(
      (v) =>
        (v.name.includes("Natural") || v.name.includes("Online")) &&
        (v.lang.toLowerCase().startsWith("en") || v.name.includes("Jenny") || v.name.includes("Guy") || v.name.includes("Aria"))
    );
    if (naturalEn) return naturalEn;

    // 2. Google US English
    const googleEn = voices.find(
      (v) =>
        v.name.toLowerCase().includes("google") &&
        v.lang.toLowerCase().startsWith("en")
    );
    if (googleEn) return googleEn;

    // 3. Local OS English Voices (e.g. Microsoft David, Zira, Mark)
    const localEn = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    if (localEn) return localEn;
  }

  // Fallback to any voice matching prefix
  return voices.find((v) => v.lang.toLowerCase().startsWith(targetLang.slice(0, 2))) || null;
}

// ==========================================
// 5. Speech Queue & Playback Controller
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
 * Speak text with high clarity, bilingual pronunciation, and Chrome cutoff prevention.
 * @param {string} rawText - Raw response text or workout cheer
 * @param {object} options - Configuration options
 */
export function speakText(rawText, options = {}) {
  const {
    rate: customRate,
    pitch = 1.0,
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

  // Get user preferred speech rate from localStorage or option
  let speechRate = customRate;
  if (typeof speechRate !== "number") {
    const savedRate = parseFloat(localStorage.getItem("fitai-speech-rate") || "1.0");
    speechRate = isNaN(savedRate) ? 1.0 : savedRate;
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
    utterance.pitch = pitch;

    // Pick best voice
    const bestVoice = getBestVoice(chunkLang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onend = () => {
      currentQueueIndex++;
      playNextChunk();
    };

    utterance.onerror = (event) => {
      // Ignore 'canceled' error when interrupted by user
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

export default {
  speakText,
  stopSpeech,
  isSpeakingNow,
  cleanTextForSpeech,
  splitIntoSpeechChunks,
  getAvailableVoices,
  getBestVoice,
  FITNESS_THAI_PHONETICS,
};
