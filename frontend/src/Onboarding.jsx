import { useState } from "react";
import { useAuth } from "./contexts/AuthProvider";
import api from "./services/api";

function Onboarding({ onComplete }) {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    gender: "",
    age: "",
    height: "",
    weight: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const age = Number(form.age);
    const height = Number(form.height);
    const weight = Number(form.weight);

    if (!name || !form.gender || !age || !height || !weight) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (age < 1 || age > 120 || height <= 0 || weight <= 0) {
      setError("กรุณากรอกอายุ ส่วนสูง และน้ำหนักให้ถูกต้อง");
      return;
    }

    try {
      setSaving(true);
      const response = await api.post("/profile/me", {
        name,
        gender: form.gender,
        age,
        height,
        weight,
      });

      localStorage.removeItem("fitai-plan-signature");
      localStorage.removeItem("fitai-weekly-plan");
      const updatedUser = { ...user, name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      if (onComplete) {
        onComplete(response.data?.data || null);
      }
    } catch (err) {
      console.error("Onboarding Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf1f4] flex items-center justify-center p-4">
      {/* Outer Shell Card */}
      <div className="w-full max-w-[350px] sm:max-w-[370px] bg-[#abbed2] rounded-[32px] pt-6 pb-4 px-3.5 shadow-2xl flex flex-col items-center relative border border-white/20">
        
        {/* Top Header Section */}
        <div className="text-[11px] font-bold tracking-[0.2em] text-[#1d6092] uppercase mb-1">
          AI TRAINER
        </div>

        <h1 className="text-2xl font-bold text-[#1e293b] mb-1.5 text-center">
          เริ่มต้นให้ AI รู้จักคุณ
        </h1>

        <p className="text-xs text-[#475569] text-center max-w-[270px] leading-relaxed mb-3.5">
          ข้อมูลนี้ช่วยให้ FitAI แนะนำการออกกำลังกายได้เหมาะกับคุณมากขึ้น
        </p>

        {/* AI Robot Logo */}
        <div className="w-[88px] h-[88px] rounded-2xl bg-[#0e1e38] shadow-md overflow-hidden flex items-center justify-center mb-4 p-0.5 border border-white/20">
          <img
            src="/ai-trainer-logo.png"
            alt="AI Trainer"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* Inner White Form Card */}
        <div className="w-full bg-white rounded-[26px] p-5 shadow-sm flex flex-col gap-3">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            {/* ชื่อ */}
            <div className="flex flex-col">
              <label htmlFor="onboarding-name" className="text-xs font-semibold text-[#334155] mb-1">
                ชื่อ
              </label>
              <input
                id="onboarding-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="ชื่อที่ต้องการให้เรียก"
                autoComplete="name"
                required
                className="w-full bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b99e2] transition-all"
              />
            </div>

            {/* เพศ */}
            <div className="flex flex-col">
              <label htmlFor="onboarding-gender" className="text-xs font-semibold text-[#334155] mb-1">
                เพศ
              </label>
              <select
                id="onboarding-gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className="w-full bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#3b99e2] transition-all cursor-pointer"
              >
                <option value="" disabled className="text-slate-400">เลือกเพศ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="non_binary">หลากหลายทางเพศ</option>
                <option value="prefer_not_to_say">ไม่ต้องการระบุ</option>
              </select>
            </div>

            {/* อายุ */}
            <div className="flex flex-col">
              <label htmlFor="onboarding-age" className="text-xs font-semibold text-[#334155] mb-1">
                อายุ
              </label>
              <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#3b99e2] transition-all">
                <input
                  id="onboarding-age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="เช่น 25"
                  required
                  className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none"
                />
                <span className="text-xs text-[#64748b] font-medium ml-2 pointer-events-none">
                  ปี
                </span>
              </div>
            </div>

            {/* ส่วนสูง */}
            <div className="flex flex-col">
              <label htmlFor="onboarding-height" className="text-xs font-semibold text-[#334155] mb-1">
                ส่วนสูง
              </label>
              <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#3b99e2] transition-all">
                <input
                  id="onboarding-height"
                  name="height"
                  type="number"
                  min="1"
                  step="0.1"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="เช่น 170"
                  required
                  className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none"
                />
                <span className="text-xs text-[#64748b] font-medium ml-2 pointer-events-none">
                  cm
                </span>
              </div>
            </div>

            {/* น้ำหนัก */}
            <div className="flex flex-col">
              <label htmlFor="onboarding-weight" className="text-xs font-semibold text-[#334155] mb-1">
                น้ำหนัก
              </label>
              <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#3b99e2] transition-all">
                <input
                  id="onboarding-weight"
                  name="weight"
                  type="number"
                  min="1"
                  step="0.1"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="เช่น 65"
                  required
                  className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none"
                />
                <span className="text-xs text-[#64748b] font-medium ml-2 pointer-events-none">
                  kg
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full mt-1.5 py-3.5 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/30 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                "ยืนยันและเริ่มคุยกับ AI"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
