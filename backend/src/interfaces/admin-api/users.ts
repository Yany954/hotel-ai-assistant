// Account provisioning — the ONLY place accounts get created (no public signup exists anywhere).
import { Router } from "express";
import { getAuth } from "firebase-admin/auth";
import { db } from "../../infrastructure/persistence/firestore/init";

export const usersAdminRouter = Router();

usersAdminRouter.get("/", async (_req, res) => {
  const snapshot = await db.collection("users").get();
  res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
});

usersAdminRouter.post("/", async (req, res) => {
  const { email, role } = req.body as { email: string; role: "admin" | "front_desk" };
  try {
    const userRecord = await getAuth().createUser({ email });
    await getAuth().setCustomUserClaims(userRecord.uid, { role });
    await db.collection("users").doc(userRecord.uid).set({
      email, role, status: "pending", invitedAt: new Date().toISOString(),
    });
    const link = await getAuth().generatePasswordResetLink(email); // sirve como "crea tu contraseña" para cuenta nueva
    res.status(201).json({ uid: userRecord.uid, email, role, status: "pending", setupLink: link });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});