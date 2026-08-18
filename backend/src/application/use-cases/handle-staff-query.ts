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
  ) { }

  async execute(staffMessage: string) {
    if (isEmergency(staffMessage)) {
      const emergencyContacts = await this.contactRepository.findByCategory("emergency_services");
      return {
        type: "emergency" as const,
        contacts: emergencyContacts,
        debugInfo: "Emergency keyword override triggered — bypassed AI classification entirely.",
      };
    }

    const intent = await this.intentRouter.classify(staffMessage);
    if (intent === "greeting") {
      return { type: "procedure" as const, answer: "¡Hola! Soy el asistente de front desk. Puedo ayudarte con habitaciones, contactos, o procedimientos del hotel — ¿qué necesitas?", sources: [], debugInfo: "Greeting — no data lookup." };
    }
    if (intent === "off_topic") {
      return { type: "procedure" as const, answer: "Solo puedo ayudarte con temas del hotel — habitaciones, contactos, o procedimientos de front desk.", sources: [], debugInfo: "Off-topic — request declined, no data lookup." };
    }

    if (intent === "room_matching") {
      const criteria = await this.llmClient.extractRoomCriteria(staffMessage);
      const rooms = await this.roomRepository.findMatching(criteria);

      if (rooms.length === 0) {
        return { type: "rooms" as const, rooms: [], answer: "No encontré habitaciones que cumplan todos los criterios.", debugInfo: "Domain tool 'Room matching' used with deterministic filters." };
      }

      const roomsList = rooms.map((r) => `Room ${r.roomNumber}: ${r.bedConfiguration.bedCount} ${r.bedConfiguration.bedType}, ${r.showerType}, kitchen: ${r.hasKitchen}, accessible: ${r.isAccessible}, view: ${r.view}`).join("\n");
      const answer = await this.llmClient.complete([{
        role: "user",
        content: `You already have the exact list of matching rooms below — a deterministic filter already ran, do not add, remove, or guess any room or attribute not listed. Just describe these results naturally to hotel staff, mentioning why they fit the guest's request.\n\nGuest request: ${staffMessage}\n\nMatching rooms:\n${roomsList}`,
      }]);

      return { type: "rooms" as const, rooms, answer, debugInfo: "Domain tool 'Room matching' used with deterministic filters. AI only narrates the results, never selects them." };
    }

    if (intent === "procedure") {
      const queryEmbedding = await this.embeddingClient.embed(staffMessage);
      const matches = await this.escalationRepository.findByEmbedding(queryEmbedding, 3);

      if (matches.length === 0) {
        return { type: "procedure" as const, answer: "No tengo un procedimiento cargado sobre eso todavía.", sources: [], debugInfo: "Domain tool 'Procedures' used with vector search — no matches found." };
      }

      const context = matches.map((m, i) => `[Procedimiento ${i + 1}: ${m.triggerSituation}]\n${m.content}`).join("\n\n");
      const answer = await this.llmClient.complete([{
        role: "user",
        content: `You are a front desk assistant. Answer using ONLY the procedures below. If the retrieved procedures cover more than one distinct task and the question doesn't specify which one, ask a short clarifying question instead of guessing. If not covered, say you don't have that information — never invent.\n\n${context}\n\nStaff question: ${staffMessage}`,
      }]);

      return {
        type: "procedure" as const,
        answer, sources: matches.map((m) => m.triggerSituation),
        debugInfo: `Domain tool 'Procedures' used with vector search (RAG) over ${matches.length} matched document(s).`,
      };
    }

    return {
      type: "contacts" as const,
      contacts: await this.contactRepository.search(staffMessage),
      debugInfo: "Domain tool 'Contacts directory' used with exact/category lookup. No AI involved.",
    };
  }
}