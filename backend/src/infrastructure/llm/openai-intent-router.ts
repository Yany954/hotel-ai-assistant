import OpenAI from "openai";
import { IntentRouter, Intent } from "../../application/router/intent-router";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const VALID_INTENTS: Intent[] = ["room_matching", "contacts_directory", "procedure"];

export class OpenAiIntentRouter implements IntentRouter {
  async classify(message: string): Promise<Intent> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Classify into exactly one: greeting, off_topic, room_matching, contacts_directory, procedure.

greeting: "hola", "buenos días", small talk with no actual question.
off_topic: anything unrelated to hotel operations (weather, sports, personal questions, general trivia).
room_matching: guest room requirements (beds, shower, floor, accessibility, kitchen, view, suite).
contacts_directory: asking for a phone number or who to call, by name.
procedure: how-to questions, policies, guest situations, staff duties, anything requiring an explanation of steps or rules — NOT a room search or a phone number lookup.

Examples:
"hi" -> greeting
"what's the capital of France" -> off_topic
"can you help me with my homework" -> off_topic
"2 queen beds and a walk-in shower" -> room_matching
"what's the wifi company's number" -> contacts_directory
"how do I handle a diamond member checking in" -> procedure
"guest wants to book with Wyndham points" -> procedure
"how do I use Square" -> procedure
"rooms on the second floor" -> room_matching

Respond with ONLY the category word.`,
        },
        { role: "user", content: message },
      ],
    });
    const raw = (response.choices[0].message.content ?? "").trim();
    return (VALID_INTENTS.includes(raw as Intent) ? raw : "contacts_directory") as Intent;
  }
}