import { Navigate, Outlet } from 'react-router-dom';

/** Sustituir esta comprobación por el store de sesión cuando se implemente refresh token. */
export function ProtectedRoute() {
  const hasSession = Boolean(localStorage.getItem('access_token'));
  return hasSession ? <Outlet /> : <Navigate to="/login" replace />;
}
