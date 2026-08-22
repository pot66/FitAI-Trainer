import { useEffect, useState } from "react";
import api from "../services/api";

function ProfileEditor({ onBack }) {
  const [form, setForm] = useState({
    age: "",
    height: "",
    weight: "",
    trainingGoal: "general-fitness",
    fitnessLevel: "beginner",
    sessionsPerWeek: 3,
    preferredDuration: 30,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================
  // Load Profile
  // =====================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/profile/me"
      );

      console.log(
        "Profile response:",
        response.data
      );

      const profile =
        response.data?.data;

      if (profile) {
        setForm({
          age: profile.age ?? "",
          height: profile.height ?? "",
          weight: profile.weight ?? "",
          trainingGoal: profile.trainingGoal ?? "general-fitness",
          fitnessLevel: profile.fitnessLevel ?? "beginner",
          sessionsPerWeek: profile.sessionsPerWeek ?? 3,
          preferredDuration: profile.preferredDuration ?? 30,
        });
      }
    } catch (error) {
      console.error(
        "Load Profile Error:",
        error
      );

      // Profile ยังไม่มี
      if (
        error.response?.status === 404
      ) {
        setForm({
          age: "",
          height: "",
          weight: "",
          trainingGoal: "general-fitness",
          fitnessLevel: "beginner",
          sessionsPerWeek: 3,
          preferredDuration: 30,
        });

        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "ไม่สามารถโหลด Profile ได้"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // =====================================
  // Handle Input
  // =====================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // =====================================
  // BMI Calculation
  // =====================================

  const calculateBMI = () => {
    const height =
      Number(form.height);

    const weight =
      Number(form.weight);

    if (
      !height ||
      !weight ||
      height <= 0 ||
      weight <= 0
    ) {
      return null;
    }

    const heightMeter =
      height / 100;

    const bmi =
      weight /
      (heightMeter *
        heightMeter);

    return Number(
      bmi.toFixed(2)
    );
  };

  const bmi =
    calculateBMI();

  // =====================================
  // BMI Status
  // =====================================

  const getBMIStatus = (value) => {
    if (value === null) {
      return {
        text: "กรอกข้อมูลเพื่อคำนวณ",
        className: "bmi-neutral",
      };
    }

    if (value < 18.5) {
      return {
        text: "น้ำหนักน้อย",
        className: "bmi-underweight",
      };
    }

    if (value < 25) {
      return {
        text: "ปกติ",
        className: "bmi-normal",
      };
    }

    if (value < 30) {
      return {
        text: "น้ำหนักเกิน",
        className: "bmi-overweight",
      };
    }

    return {
      text: "อ้วน",
      className: "bmi-obese",
    };
  };

  const bmiStatus =
    getBMIStatus(bmi);

  // =====================================
  // Save Profile
  // =====================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const age =
      Number(form.age);

    const height =
      Number(form.height);

    const weight =
      Number(form.weight);

    // =====================================
    // Validation
    // =====================================

    if (!age || !height || !weight) {
      setError(
        "กรุณากรอก อายุ ส่วนสูง และน้ำหนักให้ครบ"
      );

      return;
    }

    if (
      age < 1 ||
      age > 120
    ) {
      setError(
        "อายุต้องอยู่ระหว่าง 1-120 ปี"
      );

      return;
    }

    if (height <= 0) {
      setError(
        "ส่วนสูงต้องมากกว่า 0"
      );

      return;
    }

    if (weight <= 0) {
      setError(
        "น้ำหนักต้องมากกว่า 0"
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await api.post(
          "/profile/me",
          {
            age,
            height,
            weight,
            trainingGoal: form.trainingGoal,
            fitnessLevel: form.fitnessLevel,
            sessionsPerWeek: Number(form.sessionsPerWeek),
            preferredDuration: Number(form.preferredDuration),
          }
        );

      console.log(
        "Save Profile response:",
        response.data
      );

      setSuccess(
        "บันทึกข้อมูล Profile สำเร็จ ✓"
      );
    } catch (error) {
      console.error(
        "Save Profile Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "ไม่สามารถบันทึก Profile ได้"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <div className="profile-page">

        <div className="profile-loading">

          <div className="profile-loading-icon">
            👤
          </div>

          <h2>
            กำลังโหลด Profile...
          </h2>

          <p>
            กรุณารอสักครู่
          </p>

        </div>

      </div>
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="profile-page">

      {/* =====================================
          Header
      ===================================== */}

      <header className="profile-header">

        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← กลับ Dashboard
        </button>

        <div className="profile-header-title">

          <div className="badge">
            AI FITNESS ASSISTANT
          </div>

          <h1>
            👤 My Profile
          </h1>

          <p>
            ข้อมูลส่วนตัวและข้อมูลสุขภาพ
          </p>

        </div>

      </header>

      <main className="profile-container">

        {/* =====================================
            Error
        ===================================== */}

        {error && (
          <div className="profile-message error">
            ❌ {error}
          </div>
        )}

        {/* =====================================
            Success
        ===================================== */}

        {success && (
          <div className="profile-message success">
            {success}
          </div>
        )}

        <div className="profile-grid">

          {/* =====================================
              Form
          ===================================== */}

          <section className="profile-card">

            <div className="profile-card-header">

              <div className="profile-card-icon">
                👤
              </div>

              <div>
                <h2>
                  ข้อมูลของฉัน
                </h2>

                <p>
                  แก้ไขข้อมูลส่วนตัว
                </p>
              </div>

            </div>

            <form
              className="profile-form"
              onSubmit={handleSubmit}
            >

              {/* Age */}

              <div className="profile-field">

                <label htmlFor="age">
                  อายุ
                </label>

                <div className="profile-input-wrapper">

                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={form.age}
                    onChange={
                      handleChange
                    }
                    placeholder="เช่น 21"
                  />

                  <span>
                    ปี
                  </span>

                </div>

              </div>

              {/* Height */}

              <div className="profile-field">

                <label htmlFor="height">
                  ส่วนสูง
                </label>

                <div className="profile-input-wrapper">

                  <input
                    id="height"
                    name="height"
                    type="number"
                    min="1"
                    step="0.1"
                    value={
                      form.height
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="เช่น 170"
                  />

                  <span>
                    cm
                  </span>

                </div>

              </div>

              {/* Weight */}

              <div className="profile-field">

                <label htmlFor="weight">
                  น้ำหนัก
                </label>

                <div className="profile-input-wrapper">

                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    min="1"
                    step="0.1"
                    value={
                      form.weight
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="เช่น 65"
                  />

                  <span>
                    kg
                  </span>

                </div>

              </div>

              <div className="profile-field">
                <label htmlFor="trainingGoal">เป้าหมายการฝึก</label>
                <select id="trainingGoal" name="trainingGoal" value={form.trainingGoal} onChange={handleChange}>
                  <option value="general-fitness">สุขภาพและความฟิตทั่วไป</option>
                  <option value="weight-loss">ควบคุมน้ำหนัก</option>
                  <option value="muscle-gain">สร้างกล้ามเนื้อ</option>
                  <option value="strength">เพิ่มความแข็งแรง</option>
                  <option value="mobility">เพิ่มความยืดหยุ่น/การเคลื่อนไหว</option>
                </select>
              </div>

              <div className="profile-field">
                <label htmlFor="fitnessLevel">ระดับประสบการณ์</label>
                <select id="fitnessLevel" name="fitnessLevel" value={form.fitnessLevel} onChange={handleChange}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="profile-field">
                <label htmlFor="sessionsPerWeek">จำนวนวันฝึกต่อสัปดาห์</label>
                <div className="profile-input-wrapper">
                  <input id="sessionsPerWeek" name="sessionsPerWeek" type="number" min="1" max="7" value={form.sessionsPerWeek} onChange={handleChange} />
                  <span>วัน</span>
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="preferredDuration">เวลาต่อครั้ง</label>
                <div className="profile-input-wrapper">
                  <input id="preferredDuration" name="preferredDuration" type="number" min="10" max="180" value={form.preferredDuration} onChange={handleChange} />
                  <span>นาที</span>
                </div>
              </div>

              <button
                type="submit"
                className="profile-save-button"
                disabled={saving}
              >
                {saving
                  ? "กำลังบันทึก..."
                  : "💾 บันทึกข้อมูล"}
              </button>

            </form>

          </section>

          {/* =====================================
              BMI
          ===================================== */}

          <section className="profile-card bmi-profile-card">

            <div className="profile-card-header">

              <div className="profile-card-icon">
                📊
              </div>

              <div>
                <h2>
                  BMI
                </h2>

                <p>
                  ดัชนีมวลกาย
                </p>
              </div>

            </div>

            <div className="bmi-result">

              <div className="bmi-number">
                {bmi !== null
                  ? bmi
                  : "--"}
              </div>

              <div
                className={`bmi-status ${bmiStatus.className}`}
              >
                {bmiStatus.text}
              </div>

            </div>

            <div className="bmi-scale">

              <div className="bmi-scale-item underweight">
                <span>
                  &lt;18.5
                </span>

                <small>
                  น้อย
                </small>
              </div>

              <div className="bmi-scale-item normal">
                <span>
                  18.5-24.9
                </span>

                <small>
                  ปกติ
                </small>
              </div>

              <div className="bmi-scale-item overweight">
                <span>
                  25-29.9
                </span>

                <small>
                  เกิน
                </small>
              </div>

              <div className="bmi-scale-item obese">
                <span>
                  ≥30
                </span>

                <small>
                  อ้วน
                </small>
              </div>

            </div>

            <div className="bmi-info">

              <p>
                💡 BMI คำนวณจากน้ำหนักและส่วนสูง
              </p>

              <p>
                ระบบจะนำข้อมูลนี้ไปใช้
                ในการแนะนำ Workout
                ของคุณในขั้นต่อไป
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default ProfileEditor;