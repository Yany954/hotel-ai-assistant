import { Router } from "express";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../infrastructure/persistence/firestore/init";
import { OpenAiLlmClient } from "../../infrastructure/llm/openai-client";
//gcloud firestore fields ttls update expireAt --collection-group=conversations --enable-ttl --project=hotel-ai-assistant-6d3c5
export const conversationsRouter = Router();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const llmClient = new OpenAiLlmClient();

conversationsRouter.get("/", async (req, res) => {
  const snapshot = await db.collection("conversations").where("userId", "==", req.user!.uid).get();
  res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
});

conversationsRouter.post("/", async (req, res) => {
  const ref = await db.collection("conversations").add({
    userId: req.user!.uid,
    title: req.body.title ?? "New conversation",
    messages: [],
    keep: false,
    expireAt: Timestamp.fromMillis(Date.now() + THIRTY_DAYS_MS),
  });
  res.status(201).json({ id: ref.id });
});

conversationsRouter.put("/:id", async (req, res) => {
  const ref = db.collection("conversations").doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.userId !== req.user!.uid) {
    return res.status(404).json({ error: "conversation not found" });
  }

  const patch: Record<string, unknown> = {};
  if (Array.isArray(req.body.messages)) patch.messages = req.body.messages;
  if (typeof req.body.title === "string" && req.body.title.trim()) patch.title = req.body.title.trim();
  if (typeof req.body.keep === "boolean") {
    patch.keep = req.body.keep;
    patch.expireAt = req.body.keep ? null : Timestamp.fromMillis(Date.now() + THIRTY_DAYS_MS);
  }

  // Auto-title: the first time this conversation's first exchange gets saved and nobody has
  // renamed it yet (still the default "New conversation"), ask the AI for a short title.
  // A manual rename permanently opts a conversation out of this (title no longer matches the
  // default guard below).
  const currentTitle = snap.data()?.title;
  if (currentTitle === "New conversation" && !patch.title && Array.isArray(req.body.messages)) {
    const firstStaffMessage = req.body.messages.find((m: any) => m.role === "staff")?.text;
    if (firstStaffMessage) {
      try {
        const generated = await llmClient.complete([{
          role: "user",
          content: `Write a short 3-6 word title (no quotes, no trailing punctuation) summarizing what this front desk chat is about, based on this first message: "${firstStaffMessage}"`,
        }]);
        const cleaned = generated.trim().replace(/^"|"$/g, "").slice(0, 60);
        if (cleaned) patch.title = cleaned;
      } catch (error) {
        console.error("Title generation failed, keeping default title:", error);
      }
    }
  }

  await ref.update(patch);
  res.status(204).send();
});