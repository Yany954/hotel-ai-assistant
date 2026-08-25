import { Router } from "express";
import { getAuth } from "firebase-admin/auth";
import { db } from "../../infrastructure/persistence/firestore/init";

export const profileRouter = Router();

profileRouter.get("/", async (req, res) => {
  const doc = await db.collection("users").doc(req.user!.uid).get();
  const data = doc.data() || {};

  res.json({
    uid: req.user!.uid,
    email: req.user!.email ?? null,
    role: req.user!.role,
    name: data.name ?? null,
    phoneNumber: data.phoneNumber ?? null,
    photoURL: data.photoURL ?? null,
  });
});

profileRouter.patch("/", async (req, res) => {
  const { name, phoneNumber, photoURL } = req.body as {
    name?: string;
    phoneNumber?: string;
    photoURL?: string;
  };

  const updates: Record<string, any> = {};
  const authUpdates: Record<string, any> = {};

  if (typeof name === "string") {
    updates.name = name.trim();
    authUpdates.displayName = name.trim();
  }
  if (typeof phoneNumber === "string") {
    updates.phoneNumber = phoneNumber.trim();
  }
  
  // Only include photoURL if it is a non-empty string starting with http(s)
  if (typeof photoURL === "string" && photoURL.trim().startsWith("http")) {
    updates.photoURL = photoURL.trim();
    authUpdates.photoURL = photoURL.trim();
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "no_valid_fields", message: "No valid fields provided to update." });
  }

  await db.collection("users").doc(req.user!.uid).set(updates, { merge: true });

  if (Object.keys(authUpdates).length > 0) {
    await getAuth().updateUser(req.user!.uid, authUpdates);
  }

  res.status(204).send();
});