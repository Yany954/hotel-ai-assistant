// Implements the LlmClient port using the Anthropic API.
// Retrieved/reference content passed to the model must always be labeled as DATA, never as
// instructions, to guard against prompt injection from any future free-text sources.

import { LlmClient, LlmMessage } from "../../application/ports/llm-client";

export class AnthropicLlmClient implements LlmClient {
  async extractRoomCriteria(guestDescription: string): Promise<Record<string, unknown>> {
    throw new Error("not implemented yet");
  }

  async complete(messages: LlmMessage[]): Promise<string> {
    throw new Error("not implemented yet");
  }
}
