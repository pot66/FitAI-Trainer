import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { createPersonalizedWeeklyPlan } from "../ai/recommendationEngine";

const DAYS = [
  { key: "monday", label: "จันทร์", focus: "ช่วงล่าง" },
  { key: "tuesday", label: "อังคาร", focus: "ช่วงบน" },
  { key: "wednesday", label: "พุธ", focus: "แกนกลางลำตัว" },
  { key: "thursday", label: "พฤหัสบดี", focus: "คาร์ดิโอ" },
  { key: "friday", label: "ศุกร์", focus: "ทั้งร่างกาย" },
  { key: "saturday", label: "เสาร์", focus: "ฟื้นฟูร่างกาย" },
  { key: "sunday", label: "อาทิตย์", focus: "พักผ่อน" },
];

const preferredExercises = ["Squat", "Push Up", "Plank", "Jumping Jack", "Lunges", "Rest"];

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
      .catch((requestError) => setError(requestError.response?.data?.message || "ไม่สามารถโหลดตารางออกกำลังกายได้"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (plan.length) localStorage.setItem("fitai-weekly-plan", JSON.stringify(plan));
  }, [plan]);

  const todayKey = useMemo(() => ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()], []);
  const today = plan.find((item) => item.key === todayKey);

  const updateDay = (key, field, value) => {
    setPlan((current) => current.map((item) => item.key === key ? { ...item, [field]: value } : item));
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

  if (loading) return <div className="workout-plan-page"><div className="workout-plan-loading">กำลังสร้างตาราง AI…</div></div>;

  return (
    <div className="workout-plan-page">
      <header className="workout-plan-header">
        <button className="back-button" type="button" onClick={onBack}>← กลับหน้าแชต</button>
        <div><div className="badge">AI WEEKLY PLAN</div><h1>ตารางออกกำลังกายของคุณ</h1><p>AI จัดท่าฝึกให้ตลอดสัปดาห์ คุณปรับตามเวลาหรือความพร้อมได้เสมอ</p></div>
      </header>

      <main className="workout-plan-container">
        {error && <div className="workout-message error">{error}</div>}
        {today && <section className="today-plan-card">
          <div><span>แผนของวันนี้ · {today.label}</span><h2>{today.exerciseName === "Rest" ? "วันนี้พักและฟื้นฟูร่างกาย" : `${today.exerciseName} · ${today.focus}`}</h2><p>{today.exerciseName === "Rest" ? "ยืดเหยียดเบา ๆ ดื่มน้ำ และเตรียมพร้อมสำหรับวันถัดไป" : `${today.sets} เซ็ต · ${today.repetitions}`}</p></div>
          {today.exerciseName !== "Rest" && <button className="primary-button" type="button" onClick={startToday}>เปิดโหมดกล้อง</button>}
        </section>}

        {recommendation && <section className="plan-recommendation-card">
          <div><span>คำแนะนำเฉพาะคุณ</span><strong>{recommendation.summary}</strong><p>{recommendation.training.genderNote}</p></div>
          <ul>{recommendation.training.notes.map((note) => <li key={note}>{note}</li>)}</ul>
        </section>}

        <section className="weekly-plan-card">
          <div className="weekly-plan-heading"><div><h2>แผนทั้งสัปดาห์</h2><p>เลือกท่าหรือจำนวนเซ็ตใหม่ได้ ระบบจะบันทึกการปรับของคุณไว้</p></div><button type="button" className="secondary-button" onClick={regeneratePlan}>สร้างแผน AI ใหม่</button></div>
          <div className="weekly-plan-grid">
            {plan.map((day) => <article className={day.key === todayKey ? "plan-day-card today" : "plan-day-card"} key={day.key}>
              <span>{day.label}{day.key === todayKey ? " · วันนี้" : ""}</span><strong>{day.focus}</strong>
              <select value={day.exerciseName} onChange={(event) => updateDay(day.key, "exerciseName", event.target.value)}>
                <option value="Rest">พัก / ฟื้นฟู</option>{exercises.map((exercise) => <option key={exercise.id} value={exercise.name}>{exercise.name}</option>)}
              </select>
              {day.exerciseName !== "Rest" && <div className="plan-volume"><input aria-label={`จำนวนเซ็ตวัน${day.label}`} value={day.sets} onChange={(event) => updateDay(day.key, "sets", event.target.value)} /><span>เซ็ต</span><input aria-label={`จำนวนครั้งวัน${day.label}`} value={day.repetitions} onChange={(event) => updateDay(day.key, "repetitions", event.target.value)} /></div>}
            </article>)}
          </div>
        </section>
      </main>
    </div>
  );
}

export default WorkoutPlan;
