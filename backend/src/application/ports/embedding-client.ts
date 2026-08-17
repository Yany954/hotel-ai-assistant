export interface EmbeddingClient {
  embed(text: string): Promise<number[]>;
}