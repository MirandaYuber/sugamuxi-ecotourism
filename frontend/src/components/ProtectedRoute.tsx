import { Navigate, Outlet } from 'react-router-dom';

/** Sustituir esta comprobación por el store de sesión cuando se implemente refresh token. */
export function ProtectedRoute({ requiredRole }: { requiredRole?: 'operator' | 'visitor' }) {
  const hasSession = Boolean(localStorage.getItem('access_token'));
  const role = localStorage.getItem('user_role');
  if (!hasSession) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return <Outlet />;
}
