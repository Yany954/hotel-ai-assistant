// No self-registration anywhere in the system. Accounts are created only through the admin API
// (see interfaces/admin-panel) using the Firebase Admin SDK, which also sets a custom claim for
// role. This middleware just reads and enforces that claim on every request.
// backend/src/infrastructure/auth/rbac.ts
import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";

export type Role = "admin" | "front_desk";

declare global {
  namespace Express {
    interface Request { user?: { uid: string; role: Role; email?: string } }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "missing token" });
  
  try {
    console.log("Verificando token...");
    const decoded = await getAuth().verifyIdToken(header.slice(7));
    console.log("Token verificado con éxito para:", decoded.email);
    req.user = { uid: decoded.uid, role: (decoded.role as Role) ?? "front_desk", email: decoded.email };
    next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(401).json({ error: "invalid token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "admin only" });
  next();
}