import { openai } from "./openai-instance";
import { EmbeddingClient } from "../../application/ports/embedding-client";

export class OpenAiEmbeddingClient implements EmbeddingClient {
  async embed(text: string): Promise<number[]> {
    const response = await openai().embeddings.create({ model: "text-embedding-3-small", input: text });
    return response.data[0].embedding; // 1536 dimensiones
  }
}