// Account provisioning — the ONLY place accounts get created (no public signup exists anywhere).
import { Router } from "express";
import { getAuth } from "firebase-admin/auth";
import { db } from "../../infrastructure/persistence/firestore/init";

export const usersAdminRouter = Router();

const FRONTEND_URL = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

function passwordSetupSettings() {
  return { url: `${FRONTEND_URL}/set-password`, handleCodeInApp: true };
}

usersAdminRouter.get("/", async (_req, res) => {
  const snapshot = await db.collection("users").get();
  res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
});

usersAdminRouter.post("/", async (req, res) => {
  const { email, role } = req.body as { email: string; role: "admin" | "front_desk" };
  if (!email || !role) {
    return res.status(400).json({ error: "missing_fields", message: "Email and role are required." });
  }
  try {
    const userRecord = await getAuth().createUser({ email });
    await getAuth().setCustomUserClaims(userRecord.uid, { role });
    await db.collection("users").doc(userRecord.uid).set({
      email, role, status: "pending", invitedAt: new Date().toISOString(),
    });
    const link = await getAuth().generatePasswordResetLink(email, passwordSetupSettings());
    res.status(201).json({ uid: userRecord.uid, email, role, status: "pending", setupLink: link });
  } catch (error: any) {
    console.error("Failed to invite user:", error);
    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({
        error: error.code,
        message: `${email} already has an account — check the Users list below, they may already be invited or active.`,
      });
    }
    if (error.code === "auth/invalid-email") {
      return res.status(400).json({ error: error.code, message: `"${email}" isn't a valid email address.` });
    }
    res.status(400).json({ error: error.code ?? "unknown", message: error.message ?? "Couldn't create the invite." });
  }
});

// Regenerates a fresh setup link for an existing user — needed because Firebase's reset links
// expire (~1 hour by default), so "the link I copied earlier" often won't work by the time it's
// actually sent. This always issues a brand new one rather than trying to recover the old one.
usersAdminRouter.post("/:uid/resend-invite", async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.params.uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: "not_found", message: "User not found." });
    const email = userDoc.data()?.email;
    if (!email) return res.status(400).json({ error: "no_email", message: "That user has no email on file." });

    const link = await getAuth().generatePasswordResetLink(email, passwordSetupSettings());
    res.json({ setupLink: link });
  } catch (error: any) {
    console.error("Failed to resend invite:", error);
    res.status(400).json({ error: error.code ?? "unknown", message: error.message ?? "Couldn't generate a new invite link." });
  }
});