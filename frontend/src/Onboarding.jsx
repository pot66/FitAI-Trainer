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
      onComplete(response.data?.data || null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <main className="w-full max-w-lg bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded-full mb-3 uppercase">
            FITAI TRAINER
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            เริ่มต้นตั้งค่า AI ส่วนตัวของคุณ
          </h1>
          <p className="text-zinc-400 text-sm">
            ข้อมูลนี้จะช่วยให้ FitAI สามารถวิเคราะห์และวางแผนการออกกำลังกายที่เหมาะสมกับคุณที่สุด
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="onboarding-name" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              ชื่อของคุณ
            </label>
            <input
              id="onboarding-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="ชื่อที่ต้องการให้ AI เรียก"
              autoComplete="name"
              required
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="onboarding-gender" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              เพศ
            </label>
            <select
              id="onboarding-gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-500">เลือกเพศ</option>
              <option value="male" className="bg-zinc-900 text-zinc-100">ชาย</option>
              <option value="female" className="bg-zinc-900 text-zinc-100">หญิง</option>
              <option value="non_binary" className="bg-zinc-900 text-zinc-100">หลากหลายทางเพศ</option>
              <option value="prefer_not_to_say" className="bg-zinc-900 text-zinc-100">ไม่ต้องการระบุ</option>
            </select>
          </div>

          {/* Age, Height, Weight Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Age */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="onboarding-age" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                อายุ
              </label>
              <div className="relative flex items-center">
                <input
                  id="onboarding-age"
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
                <span className="absolute right-3 text-xs text-zinc-500 font-medium pointer-events-none">
                  ปี
                </span>
              </div>
            </div>

            {/* Height */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="onboarding-height" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                ส่วนสูง
              </label>
              <div className="relative flex items-center">
                <input
                  id="onboarding-height"
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
                <span className="absolute right-3 text-xs text-zinc-500 font-medium pointer-events-none">
                  cm
                </span>
              </div>
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="onboarding-weight" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                น้ำหนัก
              </label>
              <div className="relative flex items-center">
                <input
                  id="onboarding-weight"
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
                <span className="absolute right-3 text-xs text-zinc-500 font-medium pointer-events-none">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 py-3.5 bg-red-600 hover:bg-red-500 active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              "บันทึกและเริ่มต้นใช้งาน AI"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Onboarding;