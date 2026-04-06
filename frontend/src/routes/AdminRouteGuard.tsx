import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AdminRouteGuard() {
  const location = useLocation();
  const { authReady, isAuthenticated, user } = useAuthStore();
  const hasToken = !!localStorage.getItem("accessToken");

  if (!authReady && hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">
        <p className="text-sm text-moa-subtle">권한을 확인하는 중...</p>
      </div>
    );
  }

  if (!isAuthenticated && !hasToken) {
    sessionStorage.setItem("postLoginRedirect", location.pathname + location.search);
    return <Navigate to="/users/login" replace />;
  }

  if (user?.userRole !== "ADMIN") {
    return <Navigate to="/error/403" replace />;
  }

  return <Outlet />;
}
