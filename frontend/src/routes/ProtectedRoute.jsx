import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { PATHS } from "./paths";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-[24px] p-8 shadow-sm flex flex-col items-center text-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-3 border-slate-200 border-t-[#3b99e2] animate-spin" />
          <div className="absolute w-6 h-6 rounded-full bg-[#3b99e2]/20 blur-sm" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1e293b]">กำลังโหลดข้อมูล...</h2>
          <p className="text-xs text-[#64748b] mt-1">กรุณารอสักครู่ ระบบกำลังจัดเตรียมข้อมูล</p>
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