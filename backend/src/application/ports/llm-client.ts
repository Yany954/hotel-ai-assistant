// Port for whatever LLM provider we use. Application/domain never import the SDK directly —
// only src/infrastructure/llm/ does. This is what lets the provider change later without
// touching business logic.

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LlmClient {
  extractRoomCriteria(guestDescription: string): Promise<Record<string, unknown>>;
  complete(messages: LlmMessage[]): Promise<string>;
}