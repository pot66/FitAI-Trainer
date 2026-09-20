import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { PATHS } from "./paths";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm flex flex-col items-center text-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-red-500 animate-spin" />
          <div className="absolute w-6 h-6 rounded-full bg-red-600/20 blur-sm" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">กำลังโหลดข้อมูล...</h2>
          <p className="text-xs text-zinc-400 mt-1">กรุณารอสักครู่ ระบบกำลังจัดเตรียมข้อมูล</p>
        </div>
      </div>
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