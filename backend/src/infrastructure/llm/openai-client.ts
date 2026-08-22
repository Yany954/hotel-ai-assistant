import OpenAI from "openai";
import { LlmClient, LlmMessage } from "../../application/ports/llm-client";
import { HOTEL_SYSTEM_CONTEXT } from "../../shared/hotel-context";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class OpenAiLlmClient implements LlmClient {
  async extractRoomCriteria(guestDescription: string): Promise<Record<string, unknown>> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Extract ONLY room criteria explicitly stated in the message — whether it's phrased as a guest's request (\"I need 2 queen beds\") or staff asking about inventory (\"how many queen beds do we have\"). Both describe the same filter: bedType queen. Never infer or guess a value that wasn't stated — if a field isn't mentioned, leave it out entirely rather than guessing a value for it." },
        { role: "user", content: guestDescription },
      ],
      tools: [{
        type: "function",
        function: {
          name: "extract_room_criteria",
          description: "Room filter criteria explicitly stated by the guest",
          parameters: {
            type: "object",
            properties: {
              bedCount: { type: "number" },
              bedType: { type: "string", enum: ["queen", "king"] },
              showerType: { type: "string", enum: ["walk_in_shower", "bathtub", "tub_shower_combo"] },
              bedClearance: { type: "string", enum: ["flush_to_floor", "gap_underneath"] },
              isAccessible: { type: "boolean" },
              hasKitchen: { type: "boolean" },
              hasPullOutSofaBed: { type: "boolean" },
              hasSofa: { type: "boolean" },
              hasCarpet: { type: "boolean" },
              view: { type: "string", enum: ["street_facing", "parking_lot_facing"] },
              curtainType: { type: "string", enum: ["electric", "manual"] },
              roomClass: { type: "string", enum: ["suite", "regular"] },
            },
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "extract_room_criteria" } },
    });

    const call = response.choices[0].message.tool_calls?.[0];
    if (!call || call.type !== "function") return {};
    return JSON.parse(call.function.arguments);
  }

  async complete(messages: LlmMessage[]): Promise<string> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 600,
      temperature: 0.3,
      messages: [
        { role: "system", content: HOTEL_SYSTEM_CONTEXT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    return response.choices[0].message.content ?? "";
  }
}