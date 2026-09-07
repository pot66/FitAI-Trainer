import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { PATHS } from "./paths";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { OnboardingRoute } from "./OnboardingRoute";

import Login from "../Login";
import Register from "../Register";
import VerifyEmail from "../VerifyEmail";
import AIAssistant from "../AIAssistant";
import Workout from "../Workout";
import WorkoutProgress from "../WorkoutProgress";
import ProfileEditor from "../ProfileEditor";
import Onboarding from "../Onboarding";
import WorkoutPlan from "../WorkoutPlan";
import Settings from "../Settings";
import Dashboard from "../Dashboard";

export function AppRoutes({
  profile,
  setProfile,
  loadingProfile,
  error,
  loadProfile,
  theme,
  setTheme,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path={PATHS.LOGIN}
        element={
          <PublicRoute profile={profile} loadingProfile={loadingProfile}>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path={PATHS.REGISTER}
        element={
          <PublicRoute profile={profile} loadingProfile={loadingProfile}>
            <Register onBackToLogin={() => navigate(PATHS.LOGIN)} />
          </PublicRoute>
        }
      />
      <Route path={PATHS.VERIFY_EMAIL} element={<VerifyEmail />} />

      {/* Onboarding */}
      <Route
        path={PATHS.ONBOARDING}
        element={
          <OnboardingRoute profile={profile} loadingProfile={loadingProfile}>
            <Onboarding
              onComplete={(savedProfile) => {
                setProfile(savedProfile);
                navigate(PATHS.AI);
              }}
            />
          </OnboardingRoute>
        }
      />

      {/* Protected Routes */}
      <Route path={PATHS.ROOT} element={<Navigate to={PATHS.AI} replace />} />

      <Route
        path={PATHS.AI}
        element={
          <ProtectedRoute profile={profile} loadingProfile={loadingProfile}>
            <AIAssistant
              user={user}
              onProfile={() => navigate(PATHS.PROFILE)}
              onSettings={() => navigate(PATHS.SETTINGS)}
              onWorkout={() => navigate(PATHS.WORKOUT)}
              onBack={() => navigate(PATHS.DASHBOARD)}
              onLogout={logout}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.WORKOUT}
        element={
          <ProtectedRoute profile={profile} loadingProfile={loadingProfile}>
            <Workout onBack={() => navigate(PATHS.AI)} />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.PLAN}
        element={
          <ProtectedRoute profile={profile} loadingProfile={loadingProfile}>
            <WorkoutPlan
              onBack={() => navigate(PATHS.AI)}
              onStartCamera={() => navigate(PATHS.WORKOUT)}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.PROGRESS}
        element={
          <ProtectedRoute profile={profile} loadingProfile={loadingProfile}>
            <WorkoutProgress onBack={() => navigate(PATHS.AI)} />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.PROFILE}
        element={
          <ProtectedRoute profile={profile} loadingProfile={loadingProfile}>
            <ProfileEditor
              onBack={() => {
                loadProfile();
                navigate(PATHS.AI);
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.SETTINGS}
        element={
          <ProtectedRoute profile={profile} loadingProfile={loadingProfile}>
            <Settings
              onBack={() => navigate(PATHS.AI)}
              theme={theme}
              onThemeChange={setTheme}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.DASHBOARD}
        element={
          <ProtectedRoute profile={profile} loadingProfile={loadingProfile}>
            <Dashboard profile={profile} error={error} />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={PATHS.ROOT} replace />} />
    </Routes>
  );
}

export default AppRoutes;
