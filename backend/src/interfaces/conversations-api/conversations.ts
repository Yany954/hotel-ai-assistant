import { Router } from "express";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../infrastructure/persistence/firestore/init";
//gcloud firestore fields ttls update expireAt --collection-group=conversations --enable-ttl --project=hotel-ai-assistant-6d3c5
export const conversationsRouter = Router();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

conversationsRouter.get("/", async (req, res) => {
  const snapshot = await db.collection("conversations").where("userId", "==", req.user!.uid).get();
  res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
});

conversationsRouter.post("/", async (req, res) => {
  const ref = await db.collection("conversations").add({
    userId: req.user!.uid,
    title: req.body.title ?? "Nueva conversación",
    messages: [],
    keep: false,
    expireAt: Timestamp.fromMillis(Date.now() + THIRTY_DAYS_MS),
  });
  res.status(201).json({ id: ref.id });
});

conversationsRouter.put("/:id", async (req, res) => {
  const patch: Record<string, unknown> = { messages: req.body.messages };
  if (typeof req.body.keep === "boolean") {
    patch.keep = req.body.keep;
    // si el usuario marca "guardar", quitamos expireAt para que el TTL nunca la borre
    patch.expireAt = req.body.keep ? null : Timestamp.fromMillis(Date.now() + THIRTY_DAYS_MS);
  }
  await db.collection("conversations").doc(req.params.id).update(patch);
  res.status(204).send();
});