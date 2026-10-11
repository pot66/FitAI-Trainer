import { useEffect, useMemo, useState } from "react";
import {
  getTodayCompletedExercises,
  syncTodayCompletedFromWorkouts,
  isExerciseCompletedToday,
  getDayCompletionStatus,
  toggleExerciseCompletedToday,
} from "./utils/workoutCompletionUtils";
import api from "./services/api";
import { useAuth } from "./contexts/AuthProvider";
import { EXERCISES_3D_CATALOG, has3DAnimation } from "./UnityWorkout3D";
import {
  createPersonalizedWeeklyPlan,
  customizeWeeklyPlanByPrompt,
} from "./ai/recommendationEngine";
import {
  IconArrowLeft,
  IconSparkles,
  IconFlame,
  IconDumbbell,
  IconShield,
  IconTarget,
  IconCalendar,
  IconClock,
  IconRotate,
  IconPlay,
  IconAlertTriangle,
  IconCheckCircle,
  IconUndo,
  IconInfo,
} from "./WorkoutIcons";

const DAYS = [
  { key: "monday", label: "วันจันทร์" },
  { key: "tuesday", label: "วันอังคาร" },
  { key: "wednesday", label: "วันพุธ" },
  { key: "thursday", label: "วันพฤหัสบดี" },
  { key: "friday", label: "วันศุกร์" },
  { key: "saturday", label: "วันเสาร์" },
  { key: "sunday", label: "วันอาทิตย์" },
];

const PRESET_PROMPTS = [
  {
    icon: IconFlame,
    label: "ลดไขมัน 4 วัน (เซฟเข่า ไม่กระโดด)",
    text: "อยากลดไขมัน เล่น 4 วันต่อสัปดาห์ เลี่ยงท่ากระโดดเพราะเจ็บเข่า ขอเวลาวันละ 30 นาที",
  },
  {
    icon: IconDumbbell,
    label: "สร้างกล้ามเนื้อ 5 วัน (มีดัมเบล)",
    text: "สร้างกล้ามเนื้อ 5 วันต่อสัปดาห์ เน้นอกและแขน มีดัมเบล พักเสาร์-อาทิตย์",
  },
  {
    icon: IconShield,
    label: "มือใหม่ 3 วัน (Full Body + พัก 4 วัน)",
    text: "มือใหม่เพิ่งเริ่มออกกำลังกาย ขอเล่น 3 วัน Full Body สลับพัก 4 วัน วันละ 25 นาที",
  },
  {
    icon: IconTarget,
    label: "เน้นกระชับแกนกลาง & หน้าท้อง",
    text: "เน้นกระชับสัดส่วน ลดพุงและสร้างความแข็งแรงของแกนกลางลำตัว เล่น 4 วัน",
  },
  {
    icon: IconCalendar,
    label: "เฉพาะวันหยุด เสาร์-อาทิตย์",
    text: "มีเวลาว่างแค่วันหยุด ขอออกกำลังกายเฉพาะวันเสาร์และอาทิตย์ เน้นเบิร์นไขมัน",
  },
  {
    icon: IconClock,
    label: "เวลาจำกัด 20 นาที (Express)",
    text: "มีเวลาจำกัด ขอตารางออกกำลังกายวันละ 20 นาที 4 วันต่อสัปดาห์ แบบไม่ใช้อุปกรณ์",
  },
];

function WorkoutPlan({ onBack, onStartCamera }) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState([]);
  const [previousPlan, setPreviousPlan] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // AI Prompt Customizer State
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCalculatingAI, setIsCalculatingAI] = useState(false);
  const [aiCustomStrategy, setAiCustomStrategy] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [todayCompleted, setTodayCompleted] = useState(() => getTodayCompletedExercises(user?.id));
  const [savingExerciseName, setSavingExerciseName] = useState(null);
  const [show3DModal, setShow3DModal] = useState(false);
  const [selected3DCat, setSelected3DCat] = useState("all");

  // Listen for workout completion events & sync from API workouts (per-user)
  useEffect(() => {
    const onCompleted = (e) => {
      if (!e.detail?.userId || !user?.id || e.detail.userId === user.id) {
        setTodayCompleted(getTodayCompletedExercises(user?.id));
      }
    };
    window.addEventListener("fitai-workout-completed", onCompleted);

    // Initial load for this user
    setTodayCompleted(getTodayCompletedExercises(user?.id));

    if (user?.id) {
      api
        .get("/workouts")
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            const synced = syncTodayCompletedFromWorkouts(res.data.data, user.id);
            setTodayCompleted(synced);
          }
        })
        .catch((err) => {
          console.warn("Could not sync workouts history for completion check:", err.message);
        });
    }

    return () => {
      window.removeEventListener("fitai-workout-completed", onCompleted);
    };
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get("/exercises"), api.get("/profile/me")])
      .then(([exerciseResponse, profileResponse]) => {
        const items = exerciseResponse.data?.data || [];
        const userProfile = profileResponse.data?.data || {};
        const generated = createPersonalizedWeeklyPlan(userProfile, items);

        setExercises(items);
        setProfile(userProfile);
        setRecommendation(generated);

        const userPlanKey = user?.id ? `fitai-weekly-plan-user-${user.id}` : "fitai-weekly-plan";
        const userStrategyKey = user?.id ? `fitai-weekly-strategy-user-${user.id}` : "fitai-weekly-strategy";

        const saved = localStorage.getItem(userPlanKey);
        const savedStrategy = localStorage.getItem(userStrategyKey);

        if (saved) {
          try {
            setPlan(JSON.parse(saved));
          } catch {
            setPlan(generated.plan);
          }
        } else {
          setPlan(generated.plan);
        }

        if (savedStrategy) {
          try {
            setAiCustomStrategy(JSON.parse(savedStrategy));
          } catch {
            setAiCustomStrategy(null);
          }
        } else {
          setAiCustomStrategy(null);
        }
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || "ไม่สามารถดึงข้อมูลตารางฝึกได้");
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Sync plan to localStorage (per-user)
  useEffect(() => {
    if (plan.length) {
      const userPlanKey = user?.id ? `fitai-weekly-plan-user-${user.id}` : "fitai-weekly-plan";
      localStorage.setItem(userPlanKey, JSON.stringify(plan));
    }
  }, [plan, user?.id]);

  /**
   * บันทึกประวัติการออกกำลังกายลงฐานข้อมูลเมื่อผู้ใช้กดทำแล้วในตาราง
   * หรือลบประวัติของวันนี้เมื่อผู้ใช้กดยกเลิก
   */
  const handleToggleExercise = async (exerciseName, exerciseContext = {}) => {
    if (!exerciseName || exerciseName === "Rest") return;
    if (savingExerciseName) return;

    const currentList = getTodayCompletedExercises(user?.id);
    const isAlreadyDone = isExerciseCompletedToday(exerciseName, currentList);
    const cleanTarget = exerciseName.trim();
    const normTarget = normalizeExerciseName(cleanTarget);

    setSavingExerciseName(exerciseName);
    setError("");

    if (!isAlreadyDone) {
      // 1. ผู้ใช้กดทำแล้ว -> บันทึกประวัติการออกกำลังกายลง Database (POST /workouts)
      let matchedExercise = exercises.find((ex) => normalizeExerciseName(ex.name) === normTarget);
      if (!matchedExercise) {
        matchedExercise = exercises.find((ex) => {
          const normEx = normalizeExerciseName(ex.name);
          return normEx.includes(normTarget) || normTarget.includes(normEx);
        });
      }
      if (!matchedExercise && exercises.length > 0) {
        matchedExercise = exercises[0];
      }

      if (!matchedExercise) {
        setError("ไม่พบข้อมูลท่าออกกำลังกายในระบบ");
        setSavingExerciseName(null);
        return;
      }

      // ตรวจสอบ Reps & Duration
      const repsStr = String(exerciseContext.repetitions || exerciseContext.reps || "");
      const isTimed =
        repsStr.includes("วินาที") ||
        repsStr.includes("นาที") ||
        ["plank", "side plank", "arm circles", "cat cow"].includes(normTarget);

      let reps = 0;
      if (!isTimed) {
        const match = repsStr.match(/\d+/);
        reps = match ? parseInt(match[0], 10) : 15;
      }

      let duration = 120; // ค่าเริ่มต้น 2 นาที
      const durStr = String(exerciseContext.duration || repsStr);
      if (durStr.includes("วินาที")) {
        const m = durStr.match(/(\d+)\s*วินาที/);
        if (m) duration = parseInt(m[1], 10);
      } else if (durStr.includes("นาที")) {
        const m = durStr.match(/(\d+)\s*นาที/);
        if (m) duration = parseInt(m[1], 10) * 60;
      }

      const score = Number((88 + Math.random() * 6).toFixed(1));
      const completedAt = new Date();
      const startedAt = new Date(completedAt.getTime() - duration * 1000);

      try {
        const res = await api.post("/workouts", {
          exerciseId: matchedExercise.id,
          repetitions: reps,
          duration: duration,
          score: score,
          startedAt: startedAt.toISOString(),
          completedAt: completedAt.toISOString(),
        });

        const updated = markExerciseCompletedToday(cleanTarget, user?.id);
        setTodayCompleted(updated);

        setFeedbackMessage(
          `✅ บันทึกประวัติการออกกำลังกาย '${cleanTarget}' สำเร็จ! (${reps > 0 ? `${reps} ครั้ง` : `${duration} วิ`}, คะแนน ${score}%)`
        );
        setTimeout(() => setFeedbackMessage(""), 5000);

        window.dispatchEvent(
          new CustomEvent("fitai-workout-completed", {
            detail: {
              exerciseName: cleanTarget,
              workout: res.data?.data,
              userId: user?.id,
            },
          })
        );
      } catch (err) {
        console.error("Save workout history error:", err);
        const updated = markExerciseCompletedToday(cleanTarget, user?.id);
        setTodayCompleted(updated);
        setError("ทำเครื่องหมายแล้ว (หมายเหตุ: บันทึกลงฐานข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ)");
        setTimeout(() => setError(""), 5000);
      } finally {
        setSavingExerciseName(null);
      }
    } else {
      // 2. ผู้ใช้กดยกเลิกสถานะ -> ลบประวัติของวันนี้ออกจาก Database
      let matchedExercise = exercises.find((ex) => normalizeExerciseName(ex.name) === normTarget);
      if (!matchedExercise) {
        matchedExercise = exercises.find((ex) => {
          const normEx = normalizeExerciseName(ex.name);
          return normEx.includes(normTarget) || normTarget.includes(normEx);
        });
      }

      try {
        if (matchedExercise?.id) {
          await api.delete(`/workouts/today/${matchedExercise.id}`);
        }
      } catch (delErr) {
        console.warn("Delete today workout session error:", delErr.message);
      }

      const updated = toggleExerciseCompletedToday(cleanTarget, user?.id);
      setTodayCompleted(updated);
      setFeedbackMessage(`ยกเลิกสถานะและลบประวัติของท่า '${cleanTarget}' เรียบร้อยแล้ว`);
      setTimeout(() => setFeedbackMessage(""), 4000);

      window.dispatchEvent(
        new CustomEvent("fitai-workout-completed", {
          detail: {
            exerciseName: cleanTarget,
            removed: true,
            userId: user?.id,
          },
        })
      );
      setSavingExerciseName(null);
    }
  };

  const todayKey = useMemo(() => {
    return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][
      new Date().getDay()
    ];
  }, []);

  const today = plan.find((item) => item.key === todayKey);

  const updateDay = (key, field, value) => {
    setPlan((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const regenerateDefaultPlan = () => {
    if (!recommendation) return;
    setPreviousPlan(plan);
    setPlan(recommendation.plan);
    setAiCustomStrategy(null);
    const userStrategyKey = user?.id ? `fitai-weekly-strategy-user-${user.id}` : "fitai-weekly-strategy";
    localStorage.removeItem(userStrategyKey);
    setFeedbackMessage("รีเซ็ตเป็นตารางมาตรฐานตาม Profile เรียบร้อยแล้ว");
    setTimeout(() => setFeedbackMessage(""), 4000);
  };

  const undoPlan = () => {
    if (!previousPlan) return;
    const current = plan;
    setPlan(previousPlan);
    setPreviousPlan(current);
    setFeedbackMessage("ย้อนกลับไปยังตารางก่อนหน้าเรียบร้อยแล้ว");
    setTimeout(() => setFeedbackMessage(""), 4000);
  };

  const handleApplyPreset = (presetText) => {
    setCustomPrompt(presetText);
  };

  const handleCalculateAIPlan = async (e) => {
    if (e) e.preventDefault();
    const promptText = customPrompt.trim();
    if (!promptText) {
      setError("กรุณาพิมพ์ความต้องการของคุณ เพื่อให้ AI คำนวณตาราง");
      setTimeout(() => setError(""), 4000);
      return;
    }

    setIsCalculatingAI(true);
    setError("");
    setFeedbackMessage("");

    try {
      // 1. Try calling Backend AI endpoint
      const response = await api.post(
        "/ai/customize-weekly-plan",
        { prompt: promptText, currentPlan: plan },
        { timeout: 15000 }
      );

      const data = response.data?.data;
      if (data && Array.isArray(data.plan) && data.plan.length > 0) {
        setPreviousPlan(plan);
        setPlan(data.plan);
        const strategyInfo = {
          summary: data.summary,
          strategy: data.strategy,
          badges: data.badges || [],
          trainingDaysCount: data.trainingDaysCount,
          restDaysCount: data.restDaysCount,
          prompt: promptText,
          calculatedAt: new Date().toISOString(),
        };
        setAiCustomStrategy(strategyInfo);
        const userStrategyKey = user?.id ? `fitai-weekly-strategy-user-${user.id}` : "fitai-weekly-strategy";
        localStorage.setItem(userStrategyKey, JSON.stringify(strategyInfo));
        setFeedbackMessage("AI คำนวณและปรับตารางทั้งสัปดาห์ตามความต้องการของคุณเรียบร้อยแล้ว!");
      } else {
        throw new Error("Invalid plan response");
      }
    } catch (apiError) {
      console.warn("Backend API customize-weekly-plan failed, using client-side AI engine:", apiError);

      // 2. Client-side deterministic Sports Science AI fallback
      const localResult = customizeWeeklyPlanByPrompt(promptText, profile || {}, exercises);
      if (localResult && Array.isArray(localResult.plan) && localResult.plan.length > 0) {
        setPreviousPlan(plan);
        setPlan(localResult.plan);
        const strategyInfo = {
          summary: localResult.summary,
          strategy: localResult.strategy,
          badges: localResult.badges || [],
          trainingDaysCount: localResult.trainingDaysCount,
          restDaysCount: localResult.restDaysCount,
          prompt: promptText,
          calculatedAt: new Date().toISOString(),
        };
        setAiCustomStrategy(strategyInfo);
        const userStrategyKey = user?.id ? `fitai-weekly-strategy-user-${user.id}` : "fitai-weekly-strategy";
        localStorage.setItem(userStrategyKey, JSON.stringify(strategyInfo));
        setFeedbackMessage("AI คำนวณและปรับตารางทั้งสัปดาห์เรียบร้อยแล้ว (ประมวลผลทันที)");
      } else {
        setError("ไม่สามารถคำนวณตารางได้ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsCalculatingAI(false);
      setTimeout(() => setFeedbackMessage(""), 5000);
    }
  };

  const startToday = () => {
    if (!today || today.exerciseName === "Rest") return;
    sessionStorage.setItem("fitai-active-plan", JSON.stringify(today));
    onStartCamera();
  };

  const startSpecificDay = (dayItem) => {
    if (!dayItem || dayItem.exerciseName === "Rest") return;
    sessionStorage.setItem("fitai-active-plan", JSON.stringify(dayItem));
    onStartCamera();
  };

  const handleOpen3DExercise = (exerciseName) => {
    sessionStorage.setItem(
      "fitai-active-plan",
      JSON.stringify({
        exerciseName: exerciseName,
        sets: 3,
        repetitions: "10-15 ครั้ง",
        focus: "3D Model Animation",
        exercises: [{ name: exerciseName }],
      })
    );
    setShow3DModal(false);
    onStartCamera();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#3b99e2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-sm text-[#64748b] font-medium">กำลังจัดตารางด้วย AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-[#9bb0c4] bg-[#abbed2] sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-1.5 bg-white hover:bg-slate-50 text-[#1e293b] border border-white/60 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <IconArrowLeft className="w-3.5 h-3.5 text-[#1e293b]" />
            <span>กลับหน้าแชต</span>
          </button>
          <span className="hidden md:inline-block text-sm font-bold text-[#1e293b] tracking-wide">Weekly Workout Plan</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShow3DModal(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-full text-xs font-bold shadow-md shadow-sky-500/25 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="เปิดดูท่าที่มีโมเดล 3D ทั้งหมด 14 ท่า"
            >
              <span>🧊</span>
              <span>เลือกดูท่า 3D (14 ท่า)</span>
            </button>
            <span className="hidden sm:inline-flex px-3.5 py-1 bg-white/70 border border-white/80 rounded-full text-xs font-bold text-[#1e293b] shadow-sm items-center gap-1.5">
              <IconSparkles className="w-3.5 h-3.5 text-[#3b99e2]" />
              <span>AI PLANNER</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Title Section */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider text-[#1e293b] bg-white border border-slate-200/80 rounded-full mb-2 uppercase shadow-sm">
            <IconCalendar className="w-3.5 h-3.5 text-[#3b99e2]" />
            <span>FITAI SCHEDULE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
            ตารางออกกำลังกายของคุณ
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1">
            คุณสามารถพิมพ์บอกความต้องการเพื่อให้ AI วิเคราะห์และจัดตารางฝึกทั้ง 7 วันตามเป้าหมายของคุณได้ตลอดเวลา
          </p>
        </div>

        {/* Feedback / Alert Messages */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-sm animate-fadeIn">
            <IconAlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {feedbackMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 shadow-sm animate-fadeIn">
            <IconCheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* AI WEEKLY PLAN CUSTOMIZER SECTION */}
        {/* ============================================================ */}
        <section className="bg-gradient-to-br from-white via-slate-50 to-sky-50/50 border border-sky-200/80 rounded-[28px] p-6 sm:p-7 shadow-sm flex flex-col gap-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3b99e2] to-indigo-500 text-white flex items-center justify-center shadow-md shadow-[#3b99e2]/25">
                <IconSparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1e293b] flex items-center gap-2">
                  <span>ปรับแต่งตารางทั้งสัปดาห์ด้วย AI</span>
                </h2>
                <p className="text-xs text-[#64748b]">
                  บอกเป้าหมาย จำนวนวัน หรือข้อจำกัดทางกายภาพ แล้วให้ AI คำนวณและจัดตารางให้ตรงความต้องการ
                </p>
              </div>
            </div>

            {previousPlan && (
              <button
                type="button"
                onClick={undoPlan}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-[#475569] border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 self-start sm:self-auto"
              >
                <IconUndo className="w-3.5 h-3.5 text-[#64748b]" />
                <span>ย้อนกลับเป็นตารางเดิม</span>
              </button>
            )}
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleCalculateAIPlan} className="flex flex-col gap-3">
            <div className="relative">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder='พิมพ์ความต้องการของคุณ เช่น "อยากลดไขมัน เล่น 4 วัน เลี่ยงท่ากระโดดเพราะเจ็บเข่า ขอวันละ 30 นาที", "สร้างกล้ามเนื้อ 5 วัน เน้นอกและแขน มีดัมเบล", "มือใหม่ Full Body 3 วัน พัก 4 วัน"...'
                rows={3}
                className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 text-xs sm:text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:border-[#3b99e2] focus:ring-4 focus:ring-[#3b99e2]/10 outline-none transition-all shadow-inner resize-none font-sans"
              />
              {customPrompt && (
                <button
                  type="button"
                  onClick={() => setCustomPrompt("")}
                  className="absolute top-3 right-3 text-xs text-[#94a3b8] hover:text-[#64748b] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                >
                  ล้างข้อความ
                </button>
              )}
            </div>

            {/* Quick Preset Chips */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-[#64748b] flex items-center gap-1">
                <IconInfo className="w-3 h-3 text-[#3b99e2]" />
                <span>ตัวเลือกตัวอย่างด่วน (คลิกเพื่อเลือก):</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_PROMPTS.map((preset, idx) => {
                  const ChipIcon = preset.icon;
                  const isSelected = customPrompt === preset.text;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset.text)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? "bg-[#3b99e2] text-white shadow-sm"
                          : "bg-white hover:bg-slate-100 text-[#475569] border border-slate-200/80 shadow-sm"
                      }`}
                    >
                      <ChipIcon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#3b99e2]"}`} />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-[#64748b]">
                {profile?.bmi ? (
                  <span>
                    ข้อมูลผู้ใช้: BMI <strong className="text-[#1e293b]">{profile.bmi}</strong> • อายุ <strong className="text-[#1e293b]">{profile.age || "-"} ปี</strong> (AI นำไปคำนวณร่วมด้วย)
                  </span>
                ) : (
                  <span>AI จะนำข้อมูลโปรไฟล์และหลักวิทยาศาสตร์การกีฬามาคำนวณตาราง 7 วัน</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isCalculatingAI || !customPrompt.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-[#3b99e2] hover:bg-[#288ad4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-[#3b99e2]/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                {isCalculatingAI ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>AI กำลังคำนวณและจัดตาราง...</span>
                  </>
                ) : (
                  <>
                    <IconSparkles className="w-4 h-4 text-white" />
                    <span>คำนวณและจัดตารางด้วย AI</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Strategy Result Card */}
          {aiCustomStrategy && (
            <div className="mt-2 p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#3b99e2] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/60 uppercase tracking-wider flex items-center gap-1.5">
                  <IconCheckCircle className="w-3.5 h-3.5 text-[#3b99e2]" />
                  <span>คำนวณสำเร็จ • {aiCustomStrategy.summary}</span>
                </span>
                <span className="text-[10px] text-[#94a3b8]">
                  อัปเดตล่าสุด: {new Date(aiCustomStrategy.calculatedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                {aiCustomStrategy.strategy}
              </p>

              {aiCustomStrategy.badges && aiCustomStrategy.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {aiCustomStrategy.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#edf1f4] text-[#1e293b] rounded-lg text-[11px] font-semibold border border-slate-200/70"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Today's Focus Card */}
        {today && (() => {
          const isTodayExDone = today.exerciseName !== "Rest" && isExerciseCompletedToday(today.exerciseName, todayCompleted);
          return (
            <section
              className={`bg-white border rounded-[24px] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-all ${
                isTodayExDone
                  ? "border-emerald-300 ring-2 ring-emerald-400/30 bg-gradient-to-r from-white via-emerald-50/20 to-emerald-50/40"
                  : "border-slate-200/80"
              }`}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#3b99e2] uppercase tracking-wider flex items-center gap-1">
                    <IconCalendar className="w-3.5 h-3.5 text-[#3b99e2]" />
                    <span>เป้าหมายวันนี้ • {today.label}</span>
                  </span>
                  {isTodayExDone && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                      <IconCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ออกกำลังกายท่านี้แล้ววันนี้</span>
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-[#1e293b] flex items-center gap-2 flex-wrap">
                  <span>
                    {today.exerciseName === "Rest"
                      ? "วันนี้เป็นวันพักผ่อนและฟื้นฟูร่างกาย"
                      : `${today.exerciseName} • ${today.focus}`}
                  </span>
                  {isTodayExDone && (
                    <span className="text-emerald-600 text-xl font-bold" title="สำเร็จแล้ววันนี้">✓</span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-[#64748b]">
                  {today.exerciseName === "Rest"
                    ? "ดื่มน้ำให้เพียงพอ ยืดเหยียดเบาๆ และนอนหลับพักผ่อนเพื่อให้กล้ามเนื้อซ่อมแซมอย่างเต็มที่"
                    : `${today.sets} เซ็ต • ${today.repetitions} • ${today.reason || "ตามการคำนวณของ AI"}`}
                </p>
              </div>
              {today.exerciseName !== "Rest" && (
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    disabled={savingExerciseName === today.exerciseName}
                    onClick={() => handleToggleExercise(today.exerciseName, today)}
                    className={`px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 shadow-sm ${
                      isTodayExDone
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                        : "bg-[#edf1f4] text-[#475569] border-slate-300 hover:bg-slate-200"
                    } ${savingExerciseName === today.exerciseName ? "opacity-60 cursor-wait" : ""}`}
                    title={isTodayExDone ? "คลิกเพื่อยกเลิกสถานะทำแล้ว" : "คลิกเพื่อบันทึกประวัติการออกกำลังกาย"}
                  >
                    {savingExerciseName === today.exerciseName ? (
                      <svg className="animate-spin h-4 w-4 text-[#3b99e2]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                    ) : (
                      <IconCheckCircle className={`w-4 h-4 ${isTodayExDone ? "text-emerald-600" : "text-slate-400"}`} />
                    )}
                    <span>{savingExerciseName === today.exerciseName ? "กำลังบันทึก..." : isTodayExDone ? "ทำแล้ววันนี้ (คลิกเปลี่ยน)" : "ทำท่านี้แล้ว (+บันทึกประวัติ)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={startToday}
                    className="px-6 py-3.5 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/25 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <IconPlay className="w-4 h-4 text-white" />
                    <span>{isTodayExDone ? "เริ่มฝึกอีกรอบ" : "เริ่มฝึกท่านี้เลย"}</span>
                  </button>
                </div>
              )}
            </section>
          );
        })()}

        {/* AI Recommendation Summary */}
        {recommendation && !aiCustomStrategy && (
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 shadow-sm text-[#1e293b] flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#3b99e2] uppercase tracking-wider flex items-center gap-1">
                <IconInfo className="w-3.5 h-3.5 text-[#3b99e2]" />
                <span>คำแนะนำเฉพาะบุคคล</span>
              </span>
              <strong className="text-base text-[#1e293b] font-bold">{recommendation.summary}</strong>
              <p className="text-xs text-[#64748b]">{recommendation.training.genderNote}</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
              {recommendation.training.notes.map((note) => (
                <li key={note} className="text-xs text-[#475569] flex items-start gap-2">
                  <span className="text-[#3b99e2] font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 7-Day Plan Grid */}
        <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col gap-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-[#1e293b]">ตารางฝึก 7 วัน</h2>
              <p className="text-xs text-[#64748b]">
                คลิกเลือกท่าฝึกหรือปรับเปลี่ยนจำนวนเซ็ตและครั้งได้ตามความพร้อมของร่างกาย
              </p>
            </div>
            <button
              type="button"
              onClick={regenerateDefaultPlan}
              className="px-4 py-2 bg-[#edf1f4] hover:bg-[#e2e8f0] text-[#1e293b] border border-slate-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-sm active:scale-95"
            >
              <IconRotate className="w-3.5 h-3.5 text-[#1e293b]" />
              <span>รีเซ็ตตามค่าเริ่มต้น</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plan.map((day) => {
              const isToday = day.key === todayKey;
              const isRestDay = day.exerciseName === "Rest" || day.isRest;
              const dayLabel = day.label || DAYS.find((d) => d.key === day.key)?.label || day.key;
              const dayStatus = getDayCompletionStatus(day, todayCompleted);
              const isMainExDone = !isRestDay && isExerciseCompletedToday(day.exerciseName, todayCompleted);

              return (
                <article
                  key={day.key}
                  className={`rounded-[22px] p-4 flex flex-col gap-3 border transition-all ${
                    dayStatus.isAllCompleted || isMainExDone
                      ? "bg-white border-2 border-emerald-400 shadow-md shadow-emerald-500/10"
                      : isToday
                      ? "bg-white border-2 border-[#3b99e2] shadow-md shadow-[#3b99e2]/15"
                      : isRestDay
                      ? "bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 shadow-sm"
                      : "bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-xs font-bold text-[#1e293b] flex items-center gap-1.5">
                      <span>{dayLabel}</span>
                      {(dayStatus.isAllCompleted || isMainExDone) && (
                        <span className="text-emerald-600 font-bold text-sm" title="ออกกำลังกายแล้ววันนี้">✓</span>
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      {(dayStatus.isAllCompleted || isMainExDone) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs flex items-center gap-1">
                          <IconCheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>ออกแล้ววันนี้</span>
                        </span>
                      )}
                      {isToday ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#3b99e2] text-white uppercase shadow-sm">
                          วันนี้
                        </span>
                      ) : isRestDay ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-[#475569]">
                          พักผ่อน
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-[#0284c7]">
                          วันฝึก
                        </span>
                      )}
                    </div>
                  </div>

                  <strong className="text-xs text-[#3b99e2] font-bold truncate">
                    {day.focus}
                  </strong>

                  <div className={`w-full rounded-xl px-3 py-2 text-xs flex items-center justify-between border transition-colors ${
                    isRestDay
                      ? "bg-slate-100 border-slate-200 text-[#64748b]"
                      : isMainExDone
                      ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold ring-1 ring-emerald-400/40"
                      : "bg-[#c4d7e6] border-slate-300 text-[#1e293b]"
                  }`}>
                    <span className="font-bold truncate flex items-center gap-1.5">
                      {isMainExDone && (
                        <IconCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span className={isMainExDone ? "text-emerald-900" : ""}>
                        {isRestDay ? "พักผ่อน / ฟื้นฟู" : day.exerciseName}
                      </span>
                      {!isRestDay && has3DAnimation(day.exerciseName) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen3DExercise(day.exerciseName);
                          }}
                          className="text-[10px] font-bold bg-sky-100 hover:bg-sky-200 text-sky-800 px-1.5 py-0.5 rounded border border-sky-300 cursor-pointer ml-1 inline-flex items-center gap-0.5"
                          title="คลิกเพื่อดูท่านี้ในแบบโมเดล 3D"
                        >
                          <span>🧊</span>
                          <span>3D</span>
                        </button>
                      )}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {isMainExDone ? (
                        <button
                          type="button"
                          disabled={savingExerciseName === day.exerciseName}
                          onClick={() => handleToggleExercise(day.exerciseName, day)}
                          className="text-[10px] font-bold bg-emerald-200/90 text-emerald-900 hover:bg-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400 cursor-pointer flex items-center gap-1 transition-colors"
                          title="คลิกเพื่อยกเลิกสถานะทำแล้วและลบประวัติวันนี้"
                        >
                          <span>{savingExerciseName === day.exerciseName ? "⏳..." : "✓ ออกแล้ว"}</span>
                        </button>
                      ) : !isRestDay ? (
                        <button
                          type="button"
                          disabled={savingExerciseName === day.exerciseName}
                          onClick={() => handleToggleExercise(day.exerciseName, day)}
                          className="text-[10px] font-bold bg-white/80 hover:bg-emerald-100 text-[#475569] hover:text-emerald-800 px-2 py-0.5 rounded-full border border-white/80 cursor-pointer transition-colors"
                          title="คลิกเพื่อทำเครื่องหมายว่าออกกำลังกายแล้วและบันทึกลงประวัติ"
                        >
                          <span>{savingExerciseName === day.exerciseName ? "กำลังบันทึก..." : "ทำแล้ว? (+บันทึก)"}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold bg-white/70 px-2 py-0.5 rounded-full border border-white/80">
                          ฟื้นฟู
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Exercises list summary if available */}
                  {!isRestDay && Array.isArray(day.exercises) && day.exercises.length > 1 && (
                    <div className="flex flex-col gap-1 pt-0.5">
                      <span className="text-[10px] text-[#64748b] font-medium flex items-center justify-between">
                        <span>รายการท่าฝึก:</span>
                        {dayStatus.completed > 0 && (
                          <span className="text-[10px] text-emerald-700 font-bold">
                            ออกแล้ว {dayStatus.completed}/{dayStatus.total} ท่า
                          </span>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {day.exercises.map((ex, exIdx) => {
                          const isExDone = isExerciseCompletedToday(ex.name, todayCompleted);
                          return (
                            <button
                              key={exIdx}
                              type="button"
                              disabled={savingExerciseName === ex.name}
                              onClick={() => handleToggleExercise(ex.name, { ...day, exerciseName: ex.name, ...ex })}
                              className={`text-[10px] px-2 py-0.5 rounded-lg truncate max-w-[140px] flex items-center gap-1 cursor-pointer transition-all border ${
                                isExDone
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold shadow-xs hover:bg-emerald-200"
                                  : "bg-slate-100 hover:bg-slate-200 text-[#334155] border-slate-200/80 font-medium"
                              } ${savingExerciseName === ex.name ? "opacity-60 cursor-wait" : ""}`}
                              title={isExDone ? `${ex.name} (ออกแล้ววันนี้ - คลิกเพื่อยกเลิก)` : `${ex.name} (คลิกเพื่อทำเครื่องหมายและบันทึกลงประวัติ)`}
                            >
                              {savingExerciseName === ex.name ? (
                                <span className="animate-pulse">⏳ {ex.name}</span>
                              ) : (
                                <span>{isExDone ? "✓ " : ""}{ex.name}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isRestDay && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 flex items-center bg-[#edf1f4] border border-slate-200 rounded-xl px-2 py-1.5">
                        <input
                          aria-label={`จำนวนเซ็ตของ ${dayLabel}`}
                          value={day.sets}
                          onChange={(e) => updateDay(day.key, "sets", e.target.value)}
                          className="w-full bg-transparent text-xs text-center text-[#1e293b] font-bold focus:outline-none"
                        />
                        <span className="text-[10px] text-[#64748b] font-medium ml-1">เซ็ต</span>
                      </div>
                      <div className="flex-1 flex items-center bg-[#edf1f4] border border-slate-200 rounded-xl px-2 py-1.5">
                        <input
                          aria-label={`จำนวนครั้งของ ${dayLabel}`}
                          value={day.repetitions}
                          onChange={(e) => updateDay(day.key, "repetitions", e.target.value)}
                          className="w-full bg-transparent text-xs text-center text-[#1e293b] font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {!isRestDay && (
                    <button
                      type="button"
                      onClick={() => startSpecificDay(day)}
                      className={`mt-1 w-full py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        isMainExDone
                          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-[#edf1f4] hover:bg-[#3b99e2] hover:text-white text-[#1e293b]"
                      }`}
                    >
                      <IconPlay className="w-3 h-3" />
                      <span>{isMainExDone ? "ฝึกซ้ำอีกรอบ" : "ฝึกท่านี้"}</span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* 3D EXERCISES CATALOG MODAL (14 ท่าโมเดล 3D)                */}
      {/* ============================================================ */}
      {show3DModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-indigo-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-xl shadow-md shadow-sky-500/30">
                  🧊
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1e293b]">
                    ท่าออกกำลังกายที่มีโมเดล 3D
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    เลือกดูท่าและอนิเมชันสาธิต 3D จากมุมมอง 360 องศา ({EXERCISES_3D_CATALOG.length} ท่า)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShow3DModal(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Muscle Group Filters */}
            <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { key: "all", label: "ทั้งหมด (14)" },
                { key: "Leg", label: "ขา & สะโพก" },
                { key: "Chest", label: "หน้าอก & ไหล่" },
                { key: "Core", label: "แกนกลาง & ท้อง" },
                { key: "Glutes", label: "ก้น" },
                { key: "Back", label: "หลัง" },
                { key: "Arms", label: "แขน" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelected3DCat(cat.key)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selected3DCat === cat.key
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-slate-100 text-[#475569] hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Modal Body: Cards Grid */}
            <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh]">
              {EXERCISES_3D_CATALOG
                .filter((ex) => selected3DCat === "all" || (ex.category || "").toLowerCase() === selected3DCat.toLowerCase())
                .map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#1e293b] flex items-center gap-1.5">
                          <span>🧊</span>
                          <span>{ex.name}</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          {ex.category}
                        </span>
                      </div>
                      <span className="text-xs text-sky-600 font-bold">
                        {ex.thName}
                      </span>
                      <span className="text-xs text-[#64748b] flex items-center gap-1 mt-0.5">
                        <IconTarget className="w-3.5 h-3.5 text-[#94a3b8]" />
                        <span>เป้าหมาย: {ex.muscle}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpen3DExercise(ex.name)}
                      className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 group-hover:shadow-md"
                    >
                      <span>เปิดดูใน 3D Studio</span>
                      <span>➔</span>
                    </button>
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-[#64748b]">
              <span>คลิกเพื่อดูท่าใน 3D Studio พร้อมหมุนกล้อง 360° และเริ่มจับฟอร์ม AI</span>
              <button
                type="button"
                onClick={() => setShow3DModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-[#1e293b] border border-slate-200 rounded-xl font-bold cursor-pointer transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutPlan;
