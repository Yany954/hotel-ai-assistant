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
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(express.json());
app.use("/admin/rooms", roomsAdminRouter);
app.use("/admin/contacts", contactsAdminRouter);
app.use("/admin/procedures", proceduresAdminRouter);
app.post("/chat", async (req, res) => {
  try {
    res.json(await handleStaffQuery.execute(req.body.message));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to process query" });
  }
});
app.listen(process.env.PORT || 3000, () => console.log("backend listo"));