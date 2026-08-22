import { useEffect, useState } from "react";
import api from "./services/api";

function Profile({ onBack }) {
  const [form, setForm] = useState({
    age: "",
    height: "",
    weight: "",
  });

  const [profile, setProfile] = useState(null);

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
        "Profile:",
        response.data
      );

      const data =
        response.data?.data;

      if (data) {
        setProfile(data);

        setForm({
          age: data.age ?? "",
          height: data.height ?? "",
          weight: data.weight ?? "",
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
        setProfile(null);

        setForm({
          age: "",
          height: "",
          weight: "",
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
  // Input Change
  // =====================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // =====================================
  // Save Profile
  // =====================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const age = Number(form.age);
    const height = Number(form.height);
    const weight = Number(form.weight);

    // =====================================
    // Validate
    // =====================================

    if (!age || age < 1 || age > 120) {
      setError(
        "กรุณากรอกอายุระหว่าง 1-120 ปี"
      );
      return;
    }

    if (!height || height <= 0) {
      setError(
        "กรุณากรอกส่วนสูงให้ถูกต้อง"
      );
      return;
    }

    if (!weight || weight <= 0) {
      setError(
        "กรุณากรอกน้ำหนักให้ถูกต้อง"
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
          }
        );

      console.log(
        "Save Profile:",
        response.data
      );

      const savedProfile =
        response.data?.data;

      setProfile(savedProfile);

      setForm({
        age: savedProfile?.age ?? age,
        height:
          savedProfile?.height ??
          height,
        weight:
          savedProfile?.weight ??
          weight,
      });

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
            🤖
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
  // Render
  // =====================================

  return (
    <div className="profile-page">

      {/* =================================
          Header
      ================================= */}

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
            FITAI PROFILE
          </div>

          <h1>
            👤 Profile
          </h1>

          <p>
            จัดการข้อมูลส่วนตัวและข้อมูลสุขภาพ
          </p>

        </div>

      </header>

      {/* =================================
          Content
      ================================= */}

      <main className="profile-container">

        {/* =================================
            Profile Form
        ================================= */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div>
              <h2>
                📋 ข้อมูลสุขภาพ
              </h2>

              <p>
                ข้อมูลเหล่านี้จะถูกนำไปใช้
                เพื่อช่วยแนะนำการออกกำลังกาย
              </p>
            </div>

            <div className="profile-avatar">
              👤
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
                  onChange={handleChange}
                  placeholder="เช่น 21"
                  disabled={saving}
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
                  value={form.height}
                  onChange={handleChange}
                  placeholder="เช่น 170"
                  disabled={saving}
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
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="เช่น 65"
                  disabled={saving}
                />

                <span>
                  kg
                </span>

              </div>

            </div>

            {/* Error */}

            {error && (
              <div className="profile-message error">
                ❌ {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="profile-message success">
                ✅ {success}
              </div>
            )}

            {/* Save */}

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

        {/* =================================
            BMI
        ================================= */}

        <section className="profile-card bmi-section">

          <div className="profile-card-header">

            <div>
              <h2>
                📊 BMI ของฉัน
              </h2>

              <p>
                ระบบคำนวณจากส่วนสูงและน้ำหนัก
                ของคุณโดยอัตโนมัติ
              </p>
            </div>

            <div className="bmi-icon">
              📈
            </div>

          </div>

          <div className="bmi-result">

            <div className="bmi-number">
              {profile?.bmi ?? "--"}
            </div>

            <div className="bmi-label">
              BMI
            </div>

            {profile?.bmiStatus && (
              <div className="bmi-status">
                {profile.bmiStatus}
              </div>
            )}

          </div>

          <div className="bmi-info">

            <div>
              <span>
                น้ำหนัก
              </span>

              <strong>
                {profile?.weight
                  ? `${profile.weight} kg`
                  : "-"}
              </strong>
            </div>

            <div>
              <span>
                ส่วนสูง
              </span>

              <strong>
                {profile?.height
                  ? `${profile.height} cm`
                  : "-"}
              </strong>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Profile;