import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-page" role="status">
        <p className="auth-muted">Carregando sessão…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
