import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthProvider";

function Dashboard({ profile, error }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app">
      <main className="dashboard-page">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <div className="badge">AI FITNESS ASSISTANT</div>
              <h1>
                FitAI<span> Trainer</span>
              </h1>
              <p>
                ยินดีต้อนรับ{" "}
                <strong>{user?.name || "User"}</strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/settings")}
                style={{ padding: "8px 16px" }}
              >
                ⚙️ ตั้งค่า
              </button>
              <button
                type="button"
                className="logout-button"
                onClick={logout}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="dashboard-card">
              <h2>ไม่สามารถโหลด Profile</h2>
              <p className="dashboard-error">{error}</p>
            </div>
          )}

          {/* User Information */}
          <section className="dashboard-section">
            <h2>👤 ข้อมูลของฉัน</h2>
            <div className="dashboard-grid">
              <div className="info-card">
                <span>ชื่อ</span>
                <strong>{user?.name || "-"}</strong>
              </div>

              <div className="info-card">
                <span>Email</span>
                <strong>{user?.email || "-"}</strong>
              </div>

              <div className="info-card">
                <span>อายุ</span>
                <strong>{profile?.age ? `${profile.age} ปี` : "-"}</strong>
              </div>
            </div>
          </section>

          {/* Health */}
          <section className="dashboard-section">
            <h2>📊 สุขภาพของฉัน</h2>
            <div className="dashboard-grid">
              <div className="info-card">
                <span>ส่วนสูง</span>
                <strong>{profile?.height ? `${profile.height} cm` : "-"}</strong>
              </div>

              <div className="info-card">
                <span>น้ำหนัก</span>
                <strong>{profile?.weight ? `${profile.weight} kg` : "-"}</strong>
              </div>

              <div className="info-card bmi-card">
                <span>BMI</span>
                <strong>{profile?.bmi || "-"}</strong>
                {profile?.bmiStatus && <small>{profile.bmiStatus}</small>}
              </div>
            </div>
          </section>

          {/* Main Actions */}
          <section className="dashboard-section">
            <h2>🚀 FitAI Trainer</h2>
            <div className="dashboard-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => navigate("/ai")}
              >
                🤖 AI Assistant
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/workout")}
              >
                🏋️ Workout
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => navigate("/plan")}
              >
                📅 Weekly Plan
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/progress")}
              >
                📈 Progress
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/profile")}
              >
                👤 My Profile
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
