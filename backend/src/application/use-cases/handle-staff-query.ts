import { IntentRouter } from "../router/intent-router";
import { LlmClient } from "../ports/llm-client";
import { EmbeddingClient } from "../ports/embedding-client";
import { RoomRepository } from "../../domain/rooms/repositories/room-repository";
import { ContactRepository } from "../../domain/contacts/repositories/contact-repository";
import { EscalationRepository } from "../../domain/escalation/repositories/escalation-repository";
import { isEmergency } from "../emergency-override";

export class HandleStaffQuery {
  constructor(
    private readonly intentRouter: IntentRouter,
    private readonly llmClient: LlmClient,
    private readonly embeddingClient: EmbeddingClient,
    private readonly roomRepository: RoomRepository,
    private readonly contactRepository: ContactRepository,
    private readonly escalationRepository: EscalationRepository,
  ) {}

  async execute(staffMessage: string) {
    if (isEmergency(staffMessage)) {
      const emergencyContacts = await this.contactRepository.findByCategory("emergency_services");
      return { type: "emergency" as const, contacts: emergencyContacts };
    }

    const intent = await this.intentRouter.classify(staffMessage);

    if (intent === "room_matching") {
      const criteria = await this.llmClient.extractRoomCriteria(staffMessage);
      return { type: "rooms" as const, rooms: await this.roomRepository.findMatching(criteria) };
    }

    if (intent === "procedure") {
      const queryEmbedding = await this.embeddingClient.embed(staffMessage);
      const matches = await this.escalationRepository.findByEmbedding(queryEmbedding, 3);

      if (matches.length === 0) {
        return { type: "procedure" as const, answer: "No tengo un procedimiento cargado sobre eso todavía.", sources: [] };
      }

      const context = matches.map((m, i) => `[Procedimiento ${i + 1}: ${m.triggerSituation}]\n${m.content}`).join("\n\n");
      const answer = await this.llmClient.complete([
        {
          role: "user",
          content: `You are a front desk assistant. Answer the staff member's question using ONLY the procedures below as your source. If the answer isn't covered by these procedures, say plainly that you don't have that information — never invent or guess a policy, number, or step.\n\n${context}\n\nStaff question: ${staffMessage}`,
        },
      ]);

      return { type: "procedure" as const, answer, sources: matches.map((m) => m.triggerSituation) };
    }

    return { type: "contacts" as const, contacts: await this.contactRepository.search(staffMessage) };
  }
}