// Same pattern as rooms.ts, for the contacts collection.
// TODO: POST/PUT/DELETE/GET /admin/contacts, all behind requireRole("admin").
import {Router} from "express"
import {db} from "../../infrastructure/persistence/firestore/init"
import { FirestoreContactRepository } from "../../infrastructure/persistence/firestore/contact-repository.impl"

const contactRepository = new FirestoreContactRepository(db);
export const contactsAdminRouter = Router();

contactsAdminRouter.get("/", async (_req, res) => res.json(await contactRepository.findAll()));
contactsAdminRouter.post("/", async (req, res) => res.status(201).json(await contactRepository.create(req.body)));
contactsAdminRouter.put("/:id", async (req, res) => res.json(await contactRepository.update(req.params.id, req.body)));
contactsAdminRouter.delete("/:id", async (req, res) => {
  await contactRepository.delete(req.params.id);
  res.status(204).send();
});