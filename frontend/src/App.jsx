import { useEffect, useState } from "react";
import "./App.css";

import Login from "./Login";
import AIAssistant from "./AIAssistant";
import Workout from "./Workout";

import { useAuth } from "./contexts/AuthProvider";
import api from "./services/api";
import WorkoutProgress from "./WorkoutProgress";
import ProfileEditor from "./ProfileEditor";
import Onboarding from "./Onboarding";
import WorkoutPlan from "./WorkoutPlan";
import Settings from "./Settings";

function App() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [page, setPage] =
    useState("ai");
  const [theme, setTheme] = useState(() => localStorage.getItem("fitai-theme") || "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("fitai-theme", theme);
  }, [theme]);

  const [profile, setProfile] =
    useState(null);

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================
  // Load Profile
  // =====================================

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    

    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        setError("");

        const response =
          await api.get("/profile/me");

        console.log(
          "Profile response:",
          response.data
        );

        const savedProfile = response.data?.data || null;
        setProfile(savedProfile);

        if (!savedProfile) {
          setPage("onboarding");
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setProfile(null);
          setPage("onboarding");
          return;
        }

        console.error(
          "Profile Error:",
          error
        );

        setError(
          error.response?.data?.message ||
          error.message ||
          "ไม่สามารถโหลด Profile ได้"
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  // =====================================
  // Not Login
  // =====================================

  if (!isAuthenticated) {
    return <Login />;
  }

  if (page === "onboarding") {
    return (
      <Onboarding
        onComplete={(savedProfile) => {
          setProfile(savedProfile);
          setPage("ai");
        }}
      />
    );
  }

  // =====================================
  // AI Assistant Page
  // =====================================

  if (page === "ai") {
    return (
      <AIAssistant
        user={user}
        onProfile={() => setPage("profile")}
        onSettings={() => setPage("settings")}
        onWorkout={() => setPage("workout")}
        onBack={() => setPage("dashboard")}
        onLogout={logout}
      />
    );
  }
  if (page === "workout") {
  return (
    <Workout
      onBack={() =>
        setPage("ai")
      }
    />
  );
}
  if (page === "plan") {
    return <WorkoutPlan onBack={() => setPage("ai")} onStartCamera={() => setPage("workout")} />;
  }
  if (page === "progress") {
  return (
    <WorkoutProgress
      onBack={() => setPage("ai")}
    />
  );
}
  if (page === "profile") {
  return (
    <ProfileEditor
      onBack={() => setPage("ai")}
    />
  );
}
  if (page === "settings") {
    return <Settings onBack={() => setPage("ai")} theme={theme} onThemeChange={setTheme} />;
  }

  // =====================================
  // Workout Page
  // =====================================

  if (page === "workout") {
    return (
      <Workout
        onBack={() =>
          setPage("dashboard")
        }
      />
    );
  }

  // =====================================
  // Loading Profile
  // =====================================

  if (loadingProfile) {
    return (
      <div className="app">
        <main className="dashboard-page">

          <div className="dashboard-card">

            <div className="loading-icon">
              🤖
            </div>

            <h2>
              กำลังโหลดข้อมูล...
            </h2>

            <p>
              กรุณารอสักครู่
            </p>

          </div>

        </main>
      </div>
    );
  }

  if (page === "ai") {
  return (
    <AIAssistant
      onBack={() => setPage("dashboard")}
    />
  );
}

if (page === "workout") {
  return (
    <Workout
      onBack={() => setPage("dashboard")}
    />
  );
}

if (page === "progress") {
  return (
    <WorkoutProgress
      onBack={() => setPage("dashboard")}
    />
  );
}

  // =====================================
  // Dashboard
  // =====================================

  return (
    <div className="app">

      <main className="dashboard-page">

        <div className="dashboard-container">

          {/* =====================================
              Header
          ===================================== */}

          <div className="dashboard-header">

            <div>

              <div className="badge">
                AI FITNESS ASSISTANT
              </div>

              <h1>
                FitAI
                <span> Trainer</span>
              </h1>

              <p>
                ยินดีต้อนรับ{" "}
                <strong>
                  {user?.name ||
                    "User"}
                </strong>
              </p>

            </div>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              ออกจากระบบ
            </button>

          </div>

          {/* =====================================
              Error
          ===================================== */}

          {error && (
            <div className="dashboard-card">

              <h2>
                ไม่สามารถโหลด Profile
              </h2>

              <p className="dashboard-error">
                {error}
              </p>

            </div>
          )}

          {/* =====================================
              User Information
          ===================================== */}

          <section className="dashboard-section">

            <h2>
              👤 ข้อมูลของฉัน
            </h2>

            <div className="dashboard-grid">

              <div className="info-card">

                <span>
                  ชื่อ
                </span>

                <strong>
                  {user?.name ||
                    "-"}
                </strong>

              </div>

              <div className="info-card">

                <span>
                  Email
                </span>

                <strong>
                  {user?.email ||
                    "-"}
                </strong>

              </div>

              <div className="info-card">

                <span>
                  อายุ
                </span>

                <strong>
                  {profile?.age
                    ? `${profile.age} ปี`
                    : "-"}
                </strong>

              </div>

            </div>

          </section>

          {/* =====================================
              Health
          ===================================== */}

          <section className="dashboard-section">

            <h2>
              📊 สุขภาพของฉัน
            </h2>

            <div className="dashboard-grid">

              <div className="info-card">

                <span>
                  ส่วนสูง
                </span>

                <strong>
                  {profile?.height
                    ? `${profile.height} cm`
                    : "-"}
                </strong>

              </div>

              <div className="info-card">

                <span>
                  น้ำหนัก
                </span>

                <strong>
                  {profile?.weight
                    ? `${profile.weight} kg`
                    : "-"}
                </strong>

              </div>

              <div className="info-card bmi-card">

                <span>
                  BMI
                </span>

                <strong>
                  {profile?.bmi ||
                    "-"}
                </strong>

                {profile?.bmiStatus && (
                  <small>
                    {
                      profile.bmiStatus
                    }
                  </small>
                )}

              </div>

            </div>

          </section>

          {/* =====================================
              Main Actions
          ===================================== */}

          <section className="dashboard-section">

            <h2>
              🚀 FitAI Trainer
            </h2>

            <div className="dashboard-actions">

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  setPage("ai")
                }
              >
                🤖 AI Assistant
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setPage("workout")
                }
              >
                🏋️ Workout
              </button>

              <button
                className="primary-button"
                onClick={() => setPage("progress")}
              >
                📈 Progress
              </button>

              <button
  className="secondary-button"
  onClick={() => setPage("profile")}
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

export default App;
