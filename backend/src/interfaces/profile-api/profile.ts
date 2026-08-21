// Deliberately separate from admin-api/users.ts: this only ever reads/writes the
// caller's own doc (req.user.uid from the verified token), never anyone else's.
import { Router } from "express";
import { getAuth } from "firebase-admin/auth";
import { db } from "../../infrastructure/persistence/firestore/init";

export const profileRouter = Router();

profileRouter.get("/", async (req, res) => {
  const doc = await db.collection("users").doc(req.user!.uid).get();
  res.json({
    uid: req.user!.uid,
    email: req.user!.email ?? null,
    role: req.user!.role,
    name: doc.data()?.name ?? null,
  });
});

profileRouter.patch("/", async (req, res) => {
  const { name } = req.body as { name?: string };
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  await db.collection("users").doc(req.user!.uid).update({ name: name.trim() });
  await getAuth().updateUser(req.user!.uid, { displayName: name.trim() }); // keeps Auth + Firestore in sync
  res.status(204).send();
});