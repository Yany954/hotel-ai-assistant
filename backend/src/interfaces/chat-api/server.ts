// backend/src/interfaces/chat-api/server.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import express from "express";
import cors from "cors";
import { roomsAdminRouter } from "../admin-api/rooms";
import { contactsAdminRouter } from "../admin-api/contacts";
import { proceduresAdminRouter } from "../admin-api/procedures";
import { OpenAiLlmClient } from "../../infrastructure/llm/openai-client";               // <- archivo correcto
import { OpenAiEmbeddingClient } from "../../infrastructure/llm/openai-embedding-client";
import { OpenAiIntentRouter } from "../../infrastructure/llm/openai-intent-router";       // <- nuevo
import { FirestoreRoomRepository } from "../../infrastructure/persistence/firestore/room-repository.impl";       // <- faltaba
import { FirestoreContactRepository } from "../../infrastructure/persistence/firestore/contact-repository.impl"; // <- faltaba
import { FirestoreEscalationRepository } from "../../infrastructure/persistence/firestore/escalation-repository.impl";
import { HandleStaffQuery } from "../../application/use-cases/handle-staff-query";
import { db } from "../../infrastructure/persistence/firestore/init";
import { requireAuth, requireAdmin } from "../../infrastructure/auth/rbac";
import { usersAdminRouter } from "../admin-api/users";
import { conversationsRouter } from "../conversations-api/conversations";
import { profileRouter } from "../profile-api/profile";
import { enforceDailyChatLimit } from "../../infrastructure/auth/limit-rate";

const intentRouter = new OpenAiIntentRouter();
const llmClient = new OpenAiLlmClient();
const embeddingClient = new OpenAiEmbeddingClient();
const roomRepository = new FirestoreRoomRepository(db);
const contactRepository = new FirestoreContactRepository(db);
const escalationRepository = new FirestoreEscalationRepository(db, embeddingClient);

const handleStaffQuery = new HandleStaffQuery(
  intentRouter, llmClient, embeddingClient, roomRepository, contactRepository, escalationRepository
);

const app = express();
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/admin/rooms", requireAuth, requireAdmin, roomsAdminRouter);
app.use("/admin/contacts", requireAuth, requireAdmin, contactsAdminRouter);
app.use("/admin/procedures", requireAuth, requireAdmin, proceduresAdminRouter);
app.use("/admin/users", requireAuth, requireAdmin, usersAdminRouter); 
app.use("/conversations", requireAuth, conversationsRouter);          
app.post("/chat", requireAuth, enforceDailyChatLimit, async (req, res) => {
  const message = String(req.body.message ?? "").trim().slice(0, 1000);
  if (!message) return res.status(400).json({ error: "message is required" });

  const history = Array.isArray(req.body.history)
    ? req.body.history
        .filter((t: any) => (t?.role === "staff" || t?.role === "assistant") && typeof t?.text === "string")
        .map((t: any) => ({ role: t.role, text: String(t.text).slice(0, 1000) }))
        .slice(-10)
    : [];

  try {
    res.json(await handleStaffQuery.execute(message, history));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to process query" });
  }
});
app.use("/me", requireAuth, profileRouter);
app.post("/me/activate", requireAuth, async (req, res) => {
  await db.collection("users").doc(req.user!.uid).update({ status: "active", activatedAt: new Date().toISOString() });
  res.status(204).send();
});

app.listen(process.env.PORT || 3000, () => console.log("backend listo"));