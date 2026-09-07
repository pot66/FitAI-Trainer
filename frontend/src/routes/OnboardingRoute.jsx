import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { PATHS } from "./paths";
import { LoadingScreen } from "./ProtectedRoute";

export function OnboardingRoute({ children, profile, loadingProfile }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  if (loadingProfile) {
    return <LoadingScreen />;
  }

  if (profile) {
    return <Navigate to={PATHS.AI} replace />;
  }

  return children;
}

export default OnboardingRoute;
