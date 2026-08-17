import OpenAI from "openai";
import { LlmClient, LlmMessage } from "../../application/ports/llm-client";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class OpenAiLlmClient implements LlmClient {
  async extractRoomCriteria(guestDescription: string): Promise<Record<string, unknown>> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Extract ONLY room criteria explicitly stated. Never infer or guess a value the guest did not say." },
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
    if (!call || call.type !== "function") return {}; // <- la corrección: narrow por 'type' antes de leer '.function'
    return JSON.parse(call.function.arguments);
  }

  async complete(messages: LlmMessage[]): Promise<string> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return response.choices[0].message.content ?? "";
  }
}