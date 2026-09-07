import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { PATHS } from "./paths";

export function LoadingScreen() {
  return (
    <div className="app">
      <main className="dashboard-page">
        <div className="dashboard-card">
          <h2>กำลังโหลดข้อมูล...</h2>
          <p>กรุณารอสักครู่</p>
        </div>
      </main>
    </div>
  );
}

export function ProtectedRoute({ children, profile, loadingProfile }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace state={{ from: location }} />;
  }

  if (loadingProfile) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Navigate to={PATHS.ONBOARDING} replace />;
  }

  return children;
}

export default ProtectedRoute;
