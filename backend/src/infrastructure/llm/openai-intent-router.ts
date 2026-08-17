import OpenAI from "openai";
import { IntentRouter, Intent } from "../../application/router/intent-router";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const VALID_INTENTS: Intent[] = ["room_matching", "contacts_directory", "procedure"];

export class OpenAiIntentRouter implements IntentRouter {
  async classify(message: string): Promise<Intent> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `Classify into exactly one of: ${VALID_INTENTS.join(", ")}. Respond with ONLY that word, nothing else.` },
        { role: "user", content: message },
      ],
    });
    const raw = (response.choices[0].message.content ?? "").trim();
    return (VALID_INTENTS.includes(raw as Intent) ? raw : "contacts_directory") as Intent;
  }
}