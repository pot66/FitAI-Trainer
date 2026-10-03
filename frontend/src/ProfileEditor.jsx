import { stopSpeech } from "./utils/speechUtils";
import { useEffect, useState } from "react";
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
    if (!bmi) return { text: "รอข้อมูล", color: "text-slate-500 bg-slate-100 border border-slate-200" };
    if (bmi < 18.5) return { text: "น้ำหนักน้อยกว่าเกณฑ์", color: "text-sky-700 bg-sky-50 border border-sky-200" };
    if (bmi < 25) return { text: "น้ำหนักปกติ / สมส่วน", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };
    if (bmi < 30) return { text: "น้ำหนักเกินเกณฑ์", color: "text-amber-800 bg-amber-50 border border-amber-200" };
    return { text: "โรคอ้วน", color: "text-rose-700 bg-rose-50 border border-rose-200" };
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
    if (age < 1 || age > 120 || height < 50 || height > 280 || weight < 10 || weight > 400) {
      setError("ข้อมูลส่วนสูง น้ำหนัก หรืออายุไม่อยู่ในช่วงที่ถูกต้อง");
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
      <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#3b99e2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-sm text-[#64748b] font-medium">กำลังโหลดข้อมูล Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-[#9bb0c4] bg-[#abbed2] sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-1.5 bg-white hover:bg-slate-50 text-[#1e293b] border border-white/60 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>←</span>
            <span>กลับ</span>
          </button>
          <span className="text-sm font-bold text-[#1e293b] tracking-wide">My Profile</span>
          <span className="px-3 py-1 bg-white/50 border border-white/60 rounded-full text-xs font-semibold text-[#1e293b] shadow-sm">
            AI Profile
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Banner Title */}
        <div>
          <div className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider text-[#1e293b] bg-white border border-slate-200/80 rounded-full mb-2 uppercase shadow-sm">
            FITAI TRAINER
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight flex items-center gap-2">
            <span>👤</span>
            <span>My Profile</span>
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            ข้อมูลส่วนตัวและการคำนวณดัชนีมวลกายสำหรับวิเคราะห์การออกกำลังกาย
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2 shadow-sm">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Form Card */}
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col gap-5 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <span className="text-2xl">📝</span>
              <div>
                <h2 className="text-base font-bold text-[#1e293b]">แก้ไขข้อมูลร่างกาย</h2>
                <p className="text-xs text-[#64748b]">อัปเดตข้อมูลเพื่อให้ AI วิเคราะห์แม่นยำขึ้น</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Age */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="age" className="text-xs font-bold text-[#475569] uppercase tracking-wider">
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
                    className="w-full bg-[#c4d7e6] border border-slate-300/80 rounded-xl pl-4 pr-10 py-3 text-sm text-[#1e293b] placeholder-[#64748b] font-medium focus:outline-none focus:ring-2 focus:ring-[#3b99e2] focus:border-[#3b99e2] transition-all"
                  />
                  <span className="absolute right-3 text-xs text-[#475569] font-semibold pointer-events-none">ปี</span>
                </div>
              </div>

              {/* Height */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="height" className="text-xs font-bold text-[#475569] uppercase tracking-wider">
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
                    className="w-full bg-[#c4d7e6] border border-slate-300/80 rounded-xl pl-4 pr-10 py-3 text-sm text-[#1e293b] placeholder-[#64748b] font-medium focus:outline-none focus:ring-2 focus:ring-[#3b99e2] focus:border-[#3b99e2] transition-all"
                  />
                  <span className="absolute right-3 text-xs text-[#475569] font-semibold pointer-events-none">cm</span>
                </div>
              </div>

              {/* Weight */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="weight" className="text-xs font-bold text-[#475569] uppercase tracking-wider">
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
                    className="w-full bg-[#c4d7e6] border border-slate-300/80 rounded-xl pl-4 pr-10 py-3 text-sm text-[#1e293b] placeholder-[#64748b] font-medium focus:outline-none focus:ring-2 focus:ring-[#3b99e2] focus:border-[#3b99e2] transition-all"
                  />
                  <span className="absolute right-3 text-xs text-[#475569] font-semibold pointer-events-none">kg</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 py-3.5 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/25 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? "กำลังบันทึกข้อมูล..." : "💾 บันทึกข้อมูลส่วนตัว"}
              </button>
            </form>
          </section>

          {/* BMI Card */}
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col justify-between gap-5 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <span className="text-2xl">📊</span>
              <div>
                <h2 className="text-base font-bold text-[#1e293b]">ดัชนีมวลกาย (BMI)</h2>
                <p className="text-xs text-[#64748b]">คำนวณตามสัดส่วนความสูงและน้ำหนัก</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-6 bg-[#f8fafc] rounded-2xl border border-slate-200/80">
              <span className="text-5xl font-black text-[#3b99e2] tracking-tight">
                {bmi !== null ? bmi : "--"}
              </span>
              <div className={`mt-3 px-3.5 py-1 rounded-full text-xs font-bold ${bmiStatus.color} shadow-sm`}>
                {bmiStatus.text}
              </div>
            </div>

            {/* Scale Legend */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
              <div className="p-2 rounded-xl bg-[#f8fafc] border border-slate-200">
                <span className="block font-bold text-sky-600">&lt;18.5</span>
                <span className="text-[#64748b]">ผอม</span>
              </div>
              <div className="p-2 rounded-xl bg-[#f8fafc] border border-slate-200">
                <span className="block font-bold text-emerald-600">18.5-24.9</span>
                <span className="text-[#64748b]">ปกติ</span>
              </div>
              <div className="p-2 rounded-xl bg-[#f8fafc] border border-slate-200">
                <span className="block font-bold text-amber-700">25-29.9</span>
                <span className="text-[#64748b]">ท้วม</span>
              </div>
              <div className="p-2 rounded-xl bg-[#f8fafc] border border-slate-200">
                <span className="block font-bold text-rose-600">&ge;30</span>
                <span className="text-[#64748b]">อ้วน</span>
              </div>
            </div>

            <p className="text-xs text-[#64748b] leading-relaxed">
              💡 ค่า BMI จะถูกนำไปใช้ปรับแต่งความเข้มข้นของตาราง Workout และคำแนะนำทางโภชนาการ
            </p>
          </section>
        </div>

        {/* AI Voice Toggle Card */}
        <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#3b99e2] uppercase tracking-wider mb-1">การตั้งค่า</div>
            <h2 className="text-base font-bold text-[#1e293b]">เปิด/ปิด เสียง AI (Text-to-Speech)</h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              เมื่อเปิดใช้งาน FitAI จะอ่านออกเสียงคำแนะนำในห้องแชทและช่วงออกกำลังกายให้อัตโนมัติ
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={aiVoiceEnabled}
            onClick={toggleAiVoice}
            className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center shrink-0 ${
              aiVoiceEnabled ? "bg-[#3b99e2] justify-end" : "bg-slate-300 justify-start"
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
