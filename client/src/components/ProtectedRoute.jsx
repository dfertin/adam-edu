import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthed, loading, isAdmin } = useAuth();
  if (loading) return <p className="page-wrap py-12 text-center muted">Загрузка...</p>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}
