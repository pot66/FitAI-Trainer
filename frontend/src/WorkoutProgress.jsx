import { useEffect, useMemo, useState } from "react";
import api from "./services/api";

function WorkoutProgress({ onBack }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/workouts");
      setWorkouts(response.data?.data || []);
    } catch (err) {
      console.error("Load workout progress error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "ไม่สามารถโหลดข้อมูล Workout ได้"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) {
      return "00:00";
    }
    const totalSeconds = Math.max(0, Number(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(remainingSeconds).padStart(2, "0");
    return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "-";
    }
  };

  const statistics = useMemo(() => {
    if (!workouts.length) {
      return {
        totalWorkouts: 0,
        totalRepetitions: 0,
        totalDuration: 0,
        averageScore: 0,
        bestScore: 0,
        favoriteExercise: "-",
      };
    }

    const totalWorkouts = workouts.length;
    const totalRepetitions = workouts.reduce(
      (total, w) => total + Number(w.repetitions || 0),
      0
    );
    const totalDuration = workouts.reduce(
      (total, w) => total + Number(w.duration || 0),
      0
    );

    const scores = workouts
      .map((w) => Number(w.score))
      .filter((s) => !Number.isNaN(s));

    const averageScore = scores.length
      ? scores.reduce((total, s) => total + s, 0) / scores.length
      : 0;

    const bestScore = scores.length ? Math.max(...scores) : 0;

    const exerciseCount = {};
    workouts.forEach((w) => {
      const name = w.exercise?.name || "Workout";
      exerciseCount[name] = (exerciseCount[name] || 0) + 1;
    });

    let favoriteExercise = "-";
    Object.entries(exerciseCount).forEach(([name, count]) => {
      if (
        favoriteExercise === "-" ||
        count > (exerciseCount[favoriteExercise] || 0)
      ) {
        favoriteExercise = name;
      }
    });

    return {
      totalWorkouts,
      totalRepetitions,
      totalDuration,
      averageScore,
      bestScore,
      favoriteExercise,
    };
  }, [workouts]);

  const recentWorkouts = useMemo(() => {
    return [...workouts]
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(0, 8);
  }, [workouts]);

  const chartWorkouts = useMemo(() => {
    return [...workouts]
      .filter((w) => w.score !== null && w.score !== undefined)
      .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt))
      .slice(-7);
  }, [workouts]);

  const maxScore = Math.max(
    100,
    ...chartWorkouts.map((w) => Number(w.score) || 0)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#3b99e2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-sm text-[#64748b] font-medium">กำลังโหลดข้อมูลความก้าวหน้า...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-[#9bb0c4] bg-[#abbed2] sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-1.5 bg-white hover:bg-slate-50 text-[#1e293b] border border-white/60 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>←</span>
            <span>กลับ</span>
          </button>
          <span className="text-sm font-bold text-[#1e293b] tracking-wide">Workout Progress</span>
          <span className="px-3 py-1 bg-white/50 border border-white/60 rounded-full text-xs font-semibold text-[#1e293b] shadow-sm">
            AI Analytics
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider text-[#1e293b] bg-white border border-slate-200/80 rounded-full mb-2 uppercase shadow-sm">
            FITAI PROGRESS
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight flex items-center gap-2">
            <span>📈</span>
            <span>Workout Progress</span>
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            สถิติการออกกำลังกายและพัฒนาการของคุณ
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Statistics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">เซสชันทั้งหมด</span>
            <strong className="text-2xl font-black text-[#1e293b]">{statistics.totalWorkouts}</strong>
            <small className="text-[11px] text-[#64748b]">ครั้ง (Workouts)</small>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">จำนวนครั้งรวม</span>
            <strong className="text-2xl font-black text-[#1e293b]">{statistics.totalRepetitions}</strong>
            <small className="text-[11px] text-[#64748b]">ครั้ง (Reps)</small>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">เวลาฝึกซ้อมรวม</span>
            <strong className="text-2xl font-black text-[#1e293b]">{formatTime(statistics.totalDuration)}</strong>
            <small className="text-[11px] text-[#64748b]">นาที : วินาที</small>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">คะแนนเฉลี่ย</span>
            <strong className="text-2xl font-black text-[#3b99e2]">{statistics.averageScore.toFixed(1)}</strong>
            <small className="text-[11px] text-[#64748b]">/ 100 คะแนน</small>
          </div>
        </section>

        {/* Highlight Grid (Best Score & Favorite Exercise) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 flex flex-col gap-1 shadow-sm">
            <span className="text-xs font-bold text-[#3b99e2] uppercase tracking-wider">🏆 Best Score</span>
            <strong className="text-3xl font-black text-[#3b99e2] mt-1">
              {statistics.bestScore} <span className="text-sm font-medium text-[#64748b]">/ 100</span>
            </strong>
            <p className="text-xs text-[#64748b] mt-1">คะแนนฟอร์มที่ดีที่สุดที่คุณเคยทำได้</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 flex flex-col gap-1 shadow-sm">
            <span className="text-xs font-bold text-[#3b99e2] uppercase tracking-wider">🔥 Favorite Exercise</span>
            <strong className="text-2xl font-bold text-[#1e293b] truncate mt-1">
              {statistics.favoriteExercise}
            </strong>
            <p className="text-xs text-[#64748b] mt-1">ท่าออกกำลังกายที่คุณฝึกบ่อยที่สุด</p>
          </div>
        </section>

        {/* Score Progress Chart */}
        <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col gap-5 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-[#1e293b] flex items-center gap-2">
              <span>📊</span>
              <span>Score Progress (7 เซสชันล่าสุด)</span>
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">กราฟแสดงคะแนนความถูกต้องของท่าทางในการฝึกแต่ละครั้ง</p>
          </div>

          {chartWorkouts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-[#64748b] gap-2">
              <span className="text-3xl">📉</span>
              <p className="text-sm">ยังไม่มีข้อมูลคะแนน เริ่มฝึกซ้อมเพื่อบันทึกสถิติแรกของคุณ</p>
            </div>
          ) : (
            <div className="h-56 flex items-end gap-3 sm:gap-6 pt-8 pb-4 px-2 border-b border-slate-100">
              {chartWorkouts.map((workout) => {
                const score = Number(workout.score) || 0;
                const heightPercent = Math.max(8, (score / maxScore) * 100);
                return (
                  <div key={workout.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-bold text-[#64748b] group-hover:text-[#3b99e2] transition-colors">
                      {score}
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-[#3b99e2] to-[#60a5fa] group-hover:from-[#288ad4] group-hover:to-[#3b99e2] transition-all rounded-t-xl shadow-sm"
                      />
                    </div>
                    <span className="text-[10px] text-[#64748b] font-medium truncate w-full text-center">
                      {formatDate(workout.startedAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Workout History */}
        <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col gap-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-[#1e293b] flex items-center gap-2">
              <span>🏋️‍♂️</span>
              <span>ประวัติการฝึกซ้อมล่าสุด</span>
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">รายการเซสชันการออกกำลังกายที่เสร็จสิ้น</p>
          </div>

          {recentWorkouts.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center text-[#64748b] gap-2">
              <span className="text-3xl">🧘</span>
              <p className="text-sm">ยังไม่มีประวัติการฝึกซ้อม ออกกำลังกายเซสชันแรกของคุณเลย!</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {recentWorkouts.map((workout) => (
                <div key={workout.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#c4d7e6] border border-slate-300 flex items-center justify-center text-lg">
                      🏋️
                    </div>
                    <div>
                      <strong className="block text-sm font-bold text-[#1e293b]">
                        {workout.exercise?.name || "Workout"}
                      </strong>
                      <span className="text-xs text-[#64748b]">{formatDate(workout.startedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 text-right">
                    <div>
                      <span className="block text-xs text-[#1e293b] font-bold">
                        {workout.repetitions ?? "-"}
                      </span>
                      <small className="text-[10px] text-[#64748b]">ครั้ง</small>
                    </div>
                    <div>
                      <span className="block text-xs text-[#1e293b] font-bold">
                        {formatTime(workout.duration)}
                      </span>
                      <small className="text-[10px] text-[#64748b]">เวลา</small>
                    </div>
                    <div className="min-w-[50px]">
                      <span className="inline-block px-2.5 py-1 rounded-xl text-xs font-bold bg-[#c4d7e6] text-[#1e293b] border border-slate-300">
                        {workout.score !== null && workout.score !== undefined ? `${workout.score}` : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default WorkoutProgress;
