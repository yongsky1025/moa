import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasToken = !!localStorage.getItem('accessToken');
  if (!isAuthenticated && !hasToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}
