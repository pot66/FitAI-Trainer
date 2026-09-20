import { stopSpeech } from "./utils/speechUtils";
﻿import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";

function ProfileEditor({ onBack }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    age: "",
    height: "",
    weight: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(
    () => localStorage.getItem("fitai-ai-voice-enabled") !== "false"
  );

  const toggleAiVoice = () => {
    const next = !aiVoiceEnabled;
    setAiVoiceEnabled(next);
    localStorage.setItem("fitai-ai-voice-enabled", String(next));
    if (!next) stopSpeech();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/dashboard");
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/profile/me");
      const profile = response.data?.data;
      if (profile) {
        setForm({
          age: profile.age ?? "",
          height: profile.height ?? "",
          weight: profile.weight ?? "",
        });
      }
    } catch (err) {
      console.error("Load Profile Error:", err);
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || "ไม่สามารถโหลดข้อมูล Profile ได้");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const calculateBMI = () => {
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const heightInMeters = h / 100;
    const bmi = w / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return { text: "รอข้อมูล", color: "text-zinc-500 bg-zinc-800/60" };
    if (bmi < 18.5) return { text: "น้ำหนักน้อยกว่าเกณฑ์", color: "text-sky-400 bg-sky-950/40 border border-sky-800/40" };
    if (bmi < 25) return { text: "น้ำหนักปกติ / สมส่วน", color: "text-emerald-400 bg-emerald-950/40 border border-emerald-800/40" };
    if (bmi < 30) return { text: "น้ำหนักเกินเกณฑ์", color: "text-amber-400 bg-amber-950/40 border border-amber-800/40" };
    return { text: "โรคอ้วน", color: "text-red-400 bg-red-950/40 border border-red-800/40" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const age = Number(form.age);
    const height = Number(form.height);
    const weight = Number(form.weight);

    if (!age || !height || !weight) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (age < 1 || age > 120 || height <= 0 || weight <= 0) {
      setError("กรุณากรอกข้อมูลที่ถูกต้อง");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await api.put("/profile/me", { age, height, weight });
      setSuccess("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
      localStorage.removeItem("fitai-plan-signature");
      localStorage.removeItem("fitai-weekly-plan");
    } catch (err) {
      console.error("Save Profile Error:", err);
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  const bmi = calculateBMI();
  const bmiStatus = getBMIStatus(bmi);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-sm text-zinc-400">กำลังโหลดข้อมูล Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>←</span>
            <span>กลับหน้าหลัก</span>
          </button>
          <span className="text-sm font-semibold text-zinc-300">My Profile</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Banner Title */}
        <div>
          <div className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full mb-2 uppercase">
            FITAI TRAINER
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>👤</span>
            <span>My Profile</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            ข้อมูลส่วนตัวและการคำนวณดัชนีมวลกายสำหรับวิเคราะห์การออกกำลังกาย
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-sm flex items-center gap-2">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* Profile Grid: Form & BMI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edit Form */}
          <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <span className="text-2xl">📝</span>
              <div>
                <h2 className="text-base font-bold text-white">แก้ไขข้อมูลร่างกาย</h2>
                <p className="text-xs text-zinc-400">อัปเดตข้อมูลเพื่อให้ AI วิเคราะห์แม่นยำขึ้น</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Age */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="age" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  อายุ
                </label>
                <div className="relative flex items-center">
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="25"
                    required
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                  <span className="absolute right-3 text-xs text-zinc-500 font-medium pointer-events-none">ปี</span>
                </div>
              </div>

              {/* Height */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="height" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  ส่วนสูง
                </label>
                <div className="relative flex items-center">
                  <input
                    id="height"
                    name="height"
                    type="number"
                    min="1"
                    step="0.1"
                    value={form.height}
                    onChange={handleChange}
                    placeholder="170"
                    required
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                  <span className="absolute right-3 text-xs text-zinc-500 font-medium pointer-events-none">cm</span>
                </div>
              </div>

              {/* Weight */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="weight" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  น้ำหนัก
                </label>
                <div className="relative flex items-center">
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    min="1"
                    step="0.1"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="65"
                    required
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                  <span className="absolute right-3 text-xs text-zinc-500 font-medium pointer-events-none">kg</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? "กำลังบันทึกข้อมูล..." : "💾 บันทึกข้อมูลส่วนตัว"}
              </button>
            </form>
          </section>

          {/* BMI Card */}
          <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <span className="text-2xl">📊</span>
              <div>
                <h2 className="text-base font-bold text-white">ดัชนีมวลกาย (BMI)</h2>
                <p className="text-xs text-zinc-400">คำนวณตามสัดส่วนความสูงและน้ำหนัก</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
              <span className="text-5xl font-black text-red-500 tracking-tight">
                {bmi !== null ? bmi : "--"}
              </span>
              <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${bmiStatus.color}`}>
                {bmiStatus.text}
              </div>
            </div>

            {/* Scale Legend */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="block font-bold text-sky-400">&lt;18.5</span>
                <span className="text-zinc-500">ผอม</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="block font-bold text-emerald-400">18.5-24.9</span>
                <span className="text-zinc-500">ปกติ</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="block font-bold text-amber-400">25-29.9</span>
                <span className="text-zinc-500">ท้วม</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="block font-bold text-red-400">&ge;30</span>
                <span className="text-zinc-500">อ้วน</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              💡 ค่า BMI จะถูกนำไปใช้ปรับแต่งความเข้มข้นของตาราง Workout และคำแนะนำทางโภชนาการ
            </p>
          </section>
        </div>

        {/* AI Voice Toggle Card */}
        <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">การตั้งค่า</div>
            <h2 className="text-base font-bold text-white">เปิด/ปิด เสียง AI (Text-to-Speech)</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              เมื่อเปิดใช้งาน FitAI จะอ่านออกเสียงคำแนะนำในห้องแชทและช่วงออกกำลังกายให้อัตโนมัติ
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={aiVoiceEnabled}
            onClick={toggleAiVoice}
            className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
              aiVoiceEnabled ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </section>
      </main>
    </div>
  );
}

export default ProfileEditor;