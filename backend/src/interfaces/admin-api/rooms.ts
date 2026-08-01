// Admin endpoints for managing room data. The React AdminPage calls these — it never writes to
// Firestore directly. Every write goes through requireRole("admin") first.
//
// TODO:
//   POST   /admin/rooms       create a room
//   PUT    /admin/rooms/:id   update a room
//   DELETE /admin/rooms/:id   remove a room
//   GET    /admin/rooms       list all rooms (for the admin table view)
// backend/src/interfaces/admin-api/rooms.ts
import { Router } from "express";
import { db } from "../../infrastructure/persistence/firestore/init";
import { FirestoreRoomRepository } from "../../infrastructure/persistence/firestore/room-repository.impl";

const roomRepository = new FirestoreRoomRepository(db);
export const roomsAdminRouter = Router();

roomsAdminRouter.get("/", async (_req, res) => {
  res.json(await roomRepository.findAll());
});

roomsAdminRouter.post("/import", async (req, res) => {
  const rooms = req.body.rooms; // array de Room sin id, ya parseado por el frontend
  const created = await roomRepository.bulkCreate(rooms);
  res.status(201).json(created);
});

roomsAdminRouter.post("/", async (req, res) => {
  res.status(201).json(await roomRepository.create(req.body));
});