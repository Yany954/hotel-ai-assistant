import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function RequireAuth({ role, children }: { role?: "admin"; children: React.ReactNode }) {
  const { user, role: userRole, loading } = useAuth();

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role === "admin" && userRole !== "admin") return <Navigate to="/chatpage" replace />;
  return <>{children}</>;
}