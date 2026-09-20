import { useEffect, useMemo, useState } from "react";
import api from "./services/api";
import { createPersonalizedWeeklyPlan } from "./ai/recommendationEngine";

const DAYS = [
  { key: "monday", label: "วันจันทร์", focus: "กล้ามเนื้ออก" },
  { key: "tuesday", label: "วันอังคาร", focus: "กล้ามเนื้อหลัง" },
  { key: "wednesday", label: "วันพุธ", focus: "แกนกลางลำตัว" },
  { key: "thursday", label: "วันพฤหัสบดี", focus: "ช่วงล่าง/ขา" },
  { key: "friday", label: "วันศุกร์", focus: "กล้ามเนื้อแขน" },
  { key: "saturday", label: "วันเสาร์", focus: "คาร์ดิโอ/ฟื้นฟู" },
  { key: "sunday", label: "วันอาทิตย์", focus: "พักผ่อนเต็มวัน" },
];

function WorkoutPlan({ onBack, onStartCamera }) {
  const [exercises, setExercises] = useState([]);
  const [plan, setPlan] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/exercises"), api.get("/profile/me")])
      .then(([exerciseResponse, profileResponse]) => {
        const items = exerciseResponse.data?.data || [];
        const generated = createPersonalizedWeeklyPlan(profileResponse.data?.data || {}, items);
        setExercises(items);
        setRecommendation(generated);
        const saved = localStorage.getItem("fitai-weekly-plan");
        setPlan(saved ? JSON.parse(saved) : generated.plan);
      })
      .catch((requestError) =>
        setError(requestError.response?.data?.message || "ไม่สามารถดึงข้อมูลตารางฝึกได้")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (plan.length) localStorage.setItem("fitai-weekly-plan", JSON.stringify(plan));
  }, [plan]);

  const todayKey = useMemo(
    () =>
      ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][
        new Date().getDay()
      ],
    []
  );
  const today = plan.find((item) => item.key === todayKey);

  const updateDay = (key, field, value) => {
    setPlan((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const regeneratePlan = () => {
    if (!recommendation) return;
    setPlan(recommendation.plan);
  };

  const startToday = () => {
    if (!today || today.exerciseName === "Rest") return;
    sessionStorage.setItem("fitai-active-plan", JSON.stringify(today));
    onStartCamera();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-sm text-zinc-400">กำลังจัดตารางด้วย AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>←</span>
            <span>กลับหน้าหลัก</span>
          </button>
          <span className="text-sm font-semibold text-zinc-300">Weekly Workout Plan</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full mb-2 uppercase">
            AI WEEKLY PLAN
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>📅</span>
            <span>ตารางฝึกออกกำลังกาย</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            แผนฝึกประจำสัปดาห์ที่ปรับแต่งโดย AI ตามระดับสมรรถภาพและเป้าหมายของคุณ
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Today's Focus Card */}
        {today && (
          <section className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950/30 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                เป้าหมายวันนี้ • {today.label}
              </span>
              <h2 className="text-2xl font-black text-white">
                {today.exerciseName === "Rest"
                  ? "วันนี้เป็นวันพักผ่อนและฟื้นฟูร่างกาย"
                  : `${today.exerciseName} • ${today.focus}`}
              </h2>
              <p className="text-sm text-zinc-400">
                {today.exerciseName === "Rest"
                  ? "ดื่มน้ำให้เพียงพอ ยืดเหยียดเบาๆ และนอนหลับพักผ่อนให้เต็มที่"
                  : `${today.sets} เซ็ต • ${today.repetitions}`}
              </p>
            </div>
            {today.exerciseName !== "Rest" && (
              <button
                type="button"
                onClick={startToday}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>🚀</span>
                <span>เริ่มฝึกท่านี้เลย</span>
              </button>
            )}
          </section>
        )}

        {/* AI Recommendation Summary */}
        {recommendation && (
          <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                คำแนะนำเฉพาะบุคคล
              </span>
              <strong className="text-base text-zinc-100 font-bold">{recommendation.summary}</strong>
              <p className="text-xs text-zinc-400">{recommendation.training.genderNote}</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-3 border-t border-zinc-800/80">
              {recommendation.training.notes.map((note) => (
                <li key={note} className="text-xs text-zinc-300 flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 7-Day Plan Grid */}
        <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-white">ตารางฝึก 7 วัน</h2>
              <p className="text-xs text-zinc-400">คุณสามารถปรับเปลี่ยนท่าออกกำลังกายหรือจำนวนเซ็ตได้ตามสะดวก</p>
            </div>
            <button
              type="button"
              onClick={regeneratePlan}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>🔄</span>
              <span>รีเซ็ตตาม AI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plan.map((day) => {
              const isToday = day.key === todayKey;
              return (
                <article
                  key={day.key}
                  className={`rounded-2xl p-4 flex flex-col gap-3 border transition-all ${
                    isToday
                      ? "bg-red-950/20 border-red-500/50 shadow-md shadow-red-500/5"
                      : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">
                      {day.label}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white uppercase">
                        วันนี้
                      </span>
                    )}
                  </div>

                  <strong className="text-xs text-red-400 font-semibold truncate">
                    {day.focus}
                  </strong>

                  <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">
                      {day.exerciseName === "Rest" ? "พักผ่อน / ฟื้นฟู" : day.exerciseName}
                    </span>
                    <span className="text-[10px] font-medium text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/30">
                      AI แนะนำ
                    </span>
                  </div>

                  {day.exerciseName !== "Rest" && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                        <input
                          aria-label={`จำนวนเซ็ตของ ${day.label}`}
                          value={day.sets}
                          onChange={(e) => updateDay(day.key, "sets", e.target.value)}
                          className="w-full bg-transparent text-xs text-center text-zinc-100 focus:outline-none"
                        />
                        <span className="text-[10px] text-zinc-500 ml-1">เซ็ต</span>
                      </div>
                      <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                        <input
                          aria-label={`จำนวนครั้งของ ${day.label}`}
                          value={day.repetitions}
                          onChange={(e) => updateDay(day.key, "repetitions", e.target.value)}
                          className="w-full bg-transparent text-xs text-center text-zinc-100 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default WorkoutPlan;