import OpenAI from "openai";
import { EmbeddingClient } from "../../application/ports/embedding-client";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class OpenAiEmbeddingClient implements EmbeddingClient {
  async embed(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
    return response.data[0].embedding; // 1536 dimensiones
  }
}