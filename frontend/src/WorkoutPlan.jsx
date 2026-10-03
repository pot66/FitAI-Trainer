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
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-1.5 bg-white hover:bg-slate-50 text-[#1e293b] border border-white/60 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>←</span>
            <span>กลับหน้าแชต</span>
          </button>
          <span className="text-sm font-bold text-[#1e293b] tracking-wide">Weekly Workout Plan</span>
          <span className="px-3.5 py-1 bg-white/70 border border-white/80 rounded-full text-xs font-bold text-[#1e293b] shadow-sm">
            AI WEEKLY PLAN
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider text-[#1e293b] bg-white border border-slate-200/80 rounded-full mb-2 uppercase shadow-sm">
            FITAI SCHEDULE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
            ตารางออกกำลังกายของคุณ
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1">
            AI จัดท่าฝึกให้ตลอดสัปดาห์ คุณปรับตามเวลาหรือความพร้อมได้เสมอ
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Today's Focus Card */}
        {today && (
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#3b99e2] uppercase tracking-wider">
                เป้าหมายวันนี้ • {today.label}
              </span>
              <h2 className="text-2xl font-black text-[#1e293b]">
                {today.exerciseName === "Rest"
                  ? "วันนี้เป็นวันพักผ่อนและฟื้นฟูร่างกาย"
                  : `${today.exerciseName} • ${today.focus}`}
              </h2>
              <p className="text-sm text-[#64748b]">
                {today.exerciseName === "Rest"
                  ? "ดื่มน้ำให้เพียงพอ ยืดเหยียดเบาๆ และนอนหลับพักผ่อนให้เต็มที่"
                  : `${today.sets} เซ็ต • ${today.repetitions}`}
              </p>
            </div>
            {today.exerciseName !== "Rest" && (
              <button
                type="button"
                onClick={startToday}
                className="px-6 py-3.5 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/25 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>🚀</span>
                <span>เริ่มฝึกท่านี้เลย</span>
              </button>
            )}
          </section>
        )}

        {/* AI Recommendation Summary */}
        {recommendation && (
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 shadow-sm text-[#1e293b] flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#3b99e2] uppercase tracking-wider">
                คำแนะนำเฉพาะบุคคล
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
              <p className="text-xs text-[#64748b]">คุณสามารถปรับเปลี่ยนท่าออกกำลังกายหรือจำนวนเซ็ตได้ตามสะดวก</p>
            </div>
            <button
              type="button"
              onClick={regeneratePlan}
              className="px-4 py-2 bg-[#edf1f4] hover:bg-[#e2e8f0] text-[#1e293b] border border-slate-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
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
                  className={`rounded-[22px] p-4 flex flex-col gap-3 border transition-all ${
                    isToday
                      ? "bg-white border-2 border-[#3b99e2] shadow-md shadow-[#3b99e2]/15"
                      : "bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1e293b]">
                      {day.label}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#3b99e2] text-white uppercase shadow-sm">
                        วันนี้
                      </span>
                    )}
                  </div>

                  <strong className="text-xs text-[#3b99e2] font-bold truncate">
                    {day.focus}
                  </strong>

                  <div className="w-full bg-[#c4d7e6] border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#1e293b] flex items-center justify-between">
                    <span className="font-bold text-[#1e293b]">
                      {day.exerciseName === "Rest" ? "พักผ่อน / ฟื้นฟู" : day.exerciseName}
                    </span>
                    <span className="text-[10px] font-bold text-[#1e293b] bg-white/70 px-2 py-0.5 rounded-full border border-white/80">
                      AI แนะนำ
                    </span>
                  </div>

                  {day.exerciseName !== "Rest" && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 flex items-center bg-[#edf1f4] border border-slate-200 rounded-xl px-2 py-1.5">
                        <input
                          aria-label={`จำนวนเซ็ตของ ${day.label}`}
                          value={day.sets}
                          onChange={(e) => updateDay(day.key, "sets", e.target.value)}
                          className="w-full bg-transparent text-xs text-center text-[#1e293b] font-bold focus:outline-none"
                        />
                        <span className="text-[10px] text-[#64748b] font-medium ml-1">เซ็ต</span>
                      </div>
                      <div className="flex-1 flex items-center bg-[#edf1f4] border border-slate-200 rounded-xl px-2 py-1.5">
                        <input
                          aria-label={`จำนวนครั้งของ ${day.label}`}
                          value={day.repetitions}
                          onChange={(e) => updateDay(day.key, "repetitions", e.target.value)}
                          className="w-full bg-transparent text-xs text-center text-[#1e293b] font-bold focus:outline-none"
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
