// backend/src/infrastructure/persistence/firestore/init.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Local dev / scripts: explicit service-account credentials from .env.dev.
// Firebase Functions: no credentials needed — the function's runtime service account is used.
if (projectId && clientEmail && privateKey) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
} else {
  initializeApp();
}

export const db = getFirestore();
