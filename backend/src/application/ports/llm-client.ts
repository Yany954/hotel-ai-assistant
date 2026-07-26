// Port for whatever LLM provider we use. Application/domain never import the SDK directly —
// only src/infrastructure/llm/ does. This is what lets the provider change later without
// touching business logic.

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LlmClient {
  // Extracts structured filter criteria from a guest description — this is the ONLY place
  // free text touches the room-matching flow; everything downstream is deterministic.
  extractRoomCriteria(guestDescription: string): Promise<Record<string, unknown>>;
  complete(messages: LlmMessage[]): Promise<string>;
}
