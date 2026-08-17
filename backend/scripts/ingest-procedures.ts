import dotenv from "dotenv";
import path from "path";
import fs from "fs";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface ParsedArticle {
  triggerSituation: string;
  content: string;
}

function parseProcedures(raw: string): ParsedArticle[] {
  const blocks = raw
    .split(/[-–—]{10,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const arrowIndex = block.indexOf("->");
    if (arrowIndex !== -1 && arrowIndex < 120) {
      return {
        triggerSituation: block.slice(0, arrowIndex).trim().replace(/\s+/g, "_").toLowerCase().slice(0, 60),
        content: block.trim(),
      };
    }
    const firstLine = block.split("\n")[0].trim();
    return {
      triggerSituation: firstLine.replace(/[?:]/g, "").replace(/\s+/g, "_").toLowerCase().slice(0, 60),
      content: block.trim(),
    };
  });
}

async function main() {
  const { db } = await import("../src/infrastructure/persistence/firestore/init");
  const { OpenAiEmbeddingClient } = await import("../src/infrastructure/llm/openai-embedding-client");
  const { FirestoreEscalationRepository } = await import("../src/infrastructure/persistence/firestore/escalation-repository.impl");

  const raw = fs.readFileSync(path.resolve(__dirname, "procedures_source.txt"), "utf-8");
  const articles = parseProcedures(raw);
  console.log(`${articles.length} artículos detectados. Cargando...`);

  const repo = new FirestoreEscalationRepository(db, new OpenAiEmbeddingClient());
  for (const article of articles) {
    const created = await repo.create({
      triggerSituation: article.triggerSituation,
      content: article.content,
      category: "front_desk_operations",
    });
    console.log("creado:", created.triggerSituation, created.id);
  }
  console.log("listo.");
}
main();