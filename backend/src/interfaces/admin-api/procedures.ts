// backend/src/interfaces/admin-api/procedures.ts
import { Router } from "express";
import { db } from "../../infrastructure/persistence/firestore/init";
import { FirestoreEscalationRepository } from "../../infrastructure/persistence/firestore/escalation-repository.impl";
import { OpenAiEmbeddingClient } from "../../infrastructure/llm/openai-embedding-client";

const escalationRepository = new FirestoreEscalationRepository(db, new OpenAiEmbeddingClient());
export const proceduresAdminRouter = Router();

proceduresAdminRouter.get("/", async (_req, res) => res.json(await escalationRepository.findAll()));
proceduresAdminRouter.post("/", async (req, res) => {
  res.status(201).json(await escalationRepository.create(req.body));
});
proceduresAdminRouter.put("/:id", async (req, res) => res.json(await escalationRepository.update(req.params.id, req.body)));
proceduresAdminRouter.delete("/:id", async (req, res) => {
  await escalationRepository.delete(req.params.id);
  res.status(204).send();
});