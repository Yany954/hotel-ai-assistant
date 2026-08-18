// frontend/src/components/RequireAuth.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebase";

export function RequireAuth({ role, children }: { role?: "admin"; children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) setUserRole((await u.getIdTokenResult()).claims.role as string);
    });
  }, []);

  if (user === undefined) return <div className="p-8 text-sm text-slate-400">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role === "admin" && userRole !== "admin") return <Navigate to="/chatpage" replace />;
  return <>{children}</>;
}