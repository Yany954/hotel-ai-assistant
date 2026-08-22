import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";

export type Role = "admin" | "front_desk";

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = still loading
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setRole(u ? (((await u.getIdTokenResult()).claims.role as Role) ?? "front_desk") : null);
    });
  }, []);

  return { user, role, loading: user === undefined };
}