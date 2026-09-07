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
      setError("กรุณาตรวจสอบอายุ ส่วนสูง และน้ำหนักอีกครั้ง");
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
      setError(requestError.response?.data?.message || "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-page">
      <main className="onboarding-card">
        <div className="badge">FITAI TRAINER</div>
        <h1>เริ่มต้นให้ AI รู้จักคุณ</h1>
        <p>ข้อมูลนี้ช่วยให้ FitAI แนะนำการออกกำลังกายได้เหมาะกับคุณมากขึ้น</p>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          <div className="onboarding-field onboarding-field-wide">
            <label htmlFor="onboarding-name">ชื่อ</label>
            <input id="onboarding-name" name="name" value={form.name} onChange={handleChange} placeholder="ชื่อที่ต้องการให้เรียก" autoComplete="name" required />
          </div>
          <div className="onboarding-field">
            <label htmlFor="onboarding-gender">เพศ</label>
            <select id="onboarding-gender" name="gender" value={form.gender} onChange={handleChange} required>
              <option value="" disabled>เลือกเพศ</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="non_binary">นอนไบนารี</option>
              <option value="prefer_not_to_say">ไม่ต้องการระบุ</option>
            </select>
          </div>
          <div className="onboarding-field">
            <label htmlFor="onboarding-age">อายุ</label>
            <div className="onboarding-input-unit"><input id="onboarding-age" name="age" type="number" min="1" max="120" value={form.age} onChange={handleChange} placeholder="เช่น 25" required /><span>ปี</span></div>
          </div>
          <div className="onboarding-field">
            <label htmlFor="onboarding-height">ส่วนสูง</label>
            <div className="onboarding-input-unit"><input id="onboarding-height" name="height" type="number" min="1" step="0.1" value={form.height} onChange={handleChange} placeholder="เช่น 170" required /><span>cm</span></div>
          </div>
          <div className="onboarding-field">
            <label htmlFor="onboarding-weight">น้ำหนัก</label>
            <div className="onboarding-input-unit"><input id="onboarding-weight" name="weight" type="number" min="1" step="0.1" value={form.weight} onChange={handleChange} placeholder="เช่น 65" required /><span>kg</span></div>
          </div>
          {error && <div className="onboarding-error">{error}</div>}
          <button className="onboarding-submit" type="submit" disabled={saving}>
            {saving ? "กำลังบันทึก..." : "ยืนยันและเริ่มคุยกับ AI"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Onboarding;
