// Delivery mechanism (Clean Architecture outermost ring). Front desk chat endpoint.
// Wires router -> use cases. Swappable for a different transport (Slack bot, web widget, etc.)
// without touching domain/application code.

// TODO: e.g. Express/Fastify server exposing POST /chat
// backend/src/interfaces/chat-api/server.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import express from "express";
import cors from "cors";
import { roomsAdminRouter } from "../admin-api/rooms";

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN })); // en prod, el dominio exacto del frontend, nunca "*"
app.use(express.json());
app.use("/admin/rooms", roomsAdminRouter);

app.listen(process.env.PORT || 3000, () => console.log("backend listo"));