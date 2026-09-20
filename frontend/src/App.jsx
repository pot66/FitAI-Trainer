import { useEffect, useState, useCallback } from "react";

import { useAuth } from "./contexts/AuthProvider";
import api from "./services/api";
import { AppRoutes, LoadingScreen } from "./routes";

function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [theme, setTheme] = useState(() => localStorage.getItem("fitai-theme") || "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("fitai-theme", theme);
  }, [theme]);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    try {
      setLoadingProfile(true);
      setError("");

      const response = await api.get("/profile/me");
      const savedProfile = response.data?.data || null;
      setProfile(savedProfile);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        console.error("Profile Error:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "ไม่สามารถโหลดข้อมูล Profile ได้"
        );
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <AppRoutes
      profile={profile}
      setProfile={setProfile}
      loadingProfile={loadingProfile}
      error={error}
      loadProfile={loadProfile}
      theme={theme}
      setTheme={setTheme}
    />
  );
}

export default App;