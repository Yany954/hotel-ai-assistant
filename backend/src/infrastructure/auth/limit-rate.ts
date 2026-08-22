// A real, server-enforced daily quota per staff account. This can't live in a system prompt —
// an LLM has no memory of "how many questions were asked today across separate requests" — so
// it has to be tracked and checked here, before the request ever reaches the LLM.
import { Request, Response, NextFunction } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../persistence/firestore/init";

export const DAILY_CHAT_LIMIT = 50;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
}

export async function enforceDailyChatLimit(req: Request, res: Response, next: NextFunction) {
  const uid = req.user!.uid;
  const today = todayKey();
  const ref = db.collection("chatUsage").doc(`${uid}_${today}`);

  const snap = await ref.get();
  const count = snap.exists ? (snap.data()?.count ?? 0) : 0;

  if (count >= DAILY_CHAT_LIMIT) {
    return res.status(429).json({
      error: "daily_limit_reached",
      message: `You've reached today's limit of ${DAILY_CHAT_LIMIT} questions — it resets at midnight UTC.`,
    });
  }

  // FieldValue.increment is an atomic server-side op, so this is safe even if the same user
  // fires two requests at once — no read-then-write race condition, no transaction needed.
  await ref.set({ uid, date: today, count: FieldValue.increment(1) }, { merge: true });
  next();
}