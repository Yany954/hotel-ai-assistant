// Firebase Functions entry point. The whole Express app is exposed as a single HTTPS function
// named "api", so every route (/chat, /admin/*, /conversations, /me) works exactly as before:
//   https://us-central1-<project-id>.cloudfunctions.net/api/chat
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { app } from "./interfaces/chat-api/app";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export const api = onRequest(
  {
    region: "us-central1",
    secrets: [OPENAI_API_KEY],
    memory: "512MiB",
    timeoutSeconds: 120,
  },
  app
);
