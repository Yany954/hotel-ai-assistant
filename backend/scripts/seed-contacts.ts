// backend/scripts/seed-contacts.ts
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Sanity check rápido — bórralo una vez que confirmes que carga bien
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);

async function main() {
  // import() dinámico: se ejecuta AQUÍ, después de dotenv.config() — no se hoistea como los import estáticos de arriba
  const { db } = await import("../src/infrastructure/persistence/firestore/init");
  const { FirestoreContactRepository } = await import("../src/infrastructure/persistence/firestore/contact-repository.impl");

  const contacts = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "contacts_seed.json"), "utf-8")
);
  const repo = new FirestoreContactRepository(db);
  for (const contact of contacts) {
    const created = await repo.create(contact);
    console.log("creado:", created.organizationName, created.id);
  }
}

main();