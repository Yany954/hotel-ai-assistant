import { IntentRouter } from "../router/intent-router";
import { LlmClient } from "../ports/llm-client";
import { EmbeddingClient } from "../ports/embedding-client";
import { RoomRepository } from "../../domain/rooms/repositories/room-repository";
import { ContactRepository } from "../../domain/contacts/repositories/contact-repository";
import { EscalationRepository } from "../../domain/escalation/repositories/escalation-repository";
import { isEmergency } from "../emergency-override";
import { describeRoom, describeContacts } from "../../shared/humanize";

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
      const answer = await this.llmClient.complete([{ role: "user", content: staffMessage }]);
      return { type: "procedure" as const, answer, sources: [], debugInfo: "Greeting — answered by AI directly, no data lookup." };
    }

    if (intent === "off_topic") {
      return {
        type: "procedure" as const,
        answer: "I can only help with hotel-related topics — rooms, contacts, or front desk procedures. What do you need?",
        sources: [],
        debugInfo: "Off-topic — request declined, no data lookup.",
      };
    }

    if (intent === "general_info") {
      const answer = await this.llmClient.complete([{ role: "user", content: staffMessage }]);
      return { type: "procedure" as const, answer, sources: [], debugInfo: "General info — answered directly from hotel/brand context, no domain tool used." };
    }

    if (intent === "room_matching") {
      const criteria = await this.llmClient.extractRoomCriteria(staffMessage);
      let rooms = await this.roomRepository.findMatching(criteria);
      rooms = rooms.sort((a, b) =>
        a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
      );

      if (rooms.length === 0) {
        return {
          type: "rooms" as const,
          rooms: [],
          answer: "I couldn't find any rooms that match all of that. Want to try loosening one of the criteria?",
          debugInfo: "Domain tool 'Room matching' used with deterministic filters.",
        };
      }

      const roomsList = rooms.map(describeRoom).join("\n");
      const answer = await this.llmClient.complete([{
        role: "user",
        content: `You already have the exact list of matching rooms below — a deterministic filter already ran, do not add, remove, or guess any room or attribute not listed. Describe these results naturally to hotel staff, in plain conversational English, mentioning why they fit the guest's request. Use Markdown: bold each room number, and a short bullet list if there's more than one room.\n\nGuest request: ${staffMessage}\n\nMatching rooms:\n${roomsList}`,
      }]);

      return { type: "rooms" as const, rooms, answer, debugInfo: "Domain tool 'Room matching' used with deterministic filters. AI only narrates the results, never selects them." };
    }

    if (intent === "procedure") {
      const queryEmbedding = await this.embeddingClient.embed(staffMessage);
      const matches = await this.escalationRepository.findByEmbedding(queryEmbedding, 3);

      if (matches.length === 0) {
        return {
          type: "procedure" as const,
          answer: "I don't have a procedure loaded for that yet — try asking a manager, or ask an admin to add it to the system.",
          sources: [],
          debugInfo: "Domain tool 'Procedures' used with vector search — no matches found.",
        };
      }

      const context = matches.map((m, i) => `[Procedure ${i + 1}: ${m.triggerSituation}]\n${m.content}`).join("\n\n");
      const answer = await this.llmClient.complete([{
        role: "user",
        content: `You are a front desk assistant. Answer using ONLY the procedures below — never invent a rule, number, or step that isn't there. Don't just paste the raw procedure text back: read what the staff member is actually asking and give a direct, dynamic answer to THEIR specific question, in your own words, grounded in the procedures. Use Markdown (bold for key rules/numbers, short bullet lists for steps) so it's easy to scan. If the retrieved procedures cover more than one distinct task and the question doesn't specify which one, ask a short clarifying question instead of guessing. If the procedures genuinely don't cover the question, say so plainly instead of inventing an answer.\n\n${context}\n\nStaff question: ${staffMessage}`,
      }]);

      return {
        type: "procedure" as const,
        answer, sources: matches.map((m) => m.triggerSituation),
        debugInfo: `Domain tool 'Procedures' used with vector search (RAG) over ${matches.length} matched document(s).`,
      };
    }

    const contacts = await this.contactRepository.search(staffMessage);
    return {
      type: "contacts" as const,
      contacts,
      answer: describeContacts(contacts, staffMessage),
      debugInfo: "Domain tool 'Contacts directory' used with exact/category lookup. No AI involved — formatting is deterministic.",
    };
  }
}