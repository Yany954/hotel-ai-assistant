import OpenAI from "openai";
import { IntentRouter, Intent } from "../../application/router/intent-router";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// This list used to be missing "greeting" and "off_topic" — the classifier would correctly
// return "greeting" for a "hi", but the check below would reject it and silently fall back to
// "contacts_directory", which is why greetings/brand questions came back as "couldn't find that
// contact." All categories the model can return must be listed here.
const VALID_INTENTS: Intent[] = ["greeting", "off_topic", "room_matching", "contacts_directory", "procedure", "general_info"];

export class OpenAiIntentRouter implements IntentRouter {
  async classify(message: string): Promise<Intent> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Classify into exactly one: greeting, off_topic, room_matching, contacts_directory, procedure, general_info.

greeting: "hi", "hello", "hey", "good morning" — a hello with no real question.
off_topic: anything unrelated to the hotel or its brand (weather, sports, personal questions, general trivia, homework help).
room_matching: guest room requirements (beds, shower, floor, accessibility, kitchen, view, suite).
contacts_directory: asking for a phone number or who to call, by name or vendor.
procedure: how-to questions, hotel policies, guest situations, staff duties — anything needing an explanation of steps or rules specific to THIS hotel that our internal procedure documents would cover.
general_info: questions about the Wyndham brand, loyalty programs, or general hospitality knowledge that isn't a step-by-step hotel procedure (e.g. "what is Wyndham Rewards", "what chain is this hotel part of").
A message that's just a name with no verb or question — a person, vendor, or organization on its own (e.g. after you already asked which one they meant) — is contacts_directory, not off_topic:
staff type just a name when they're trying to look it up.
"Safe Passages" -> contacts_directory
"Tech Guru" -> contacts_directory
Examples:
"hi" -> greeting
"good morning" -> greeting
"what's the capital of France" -> off_topic
"can you help me with my homework" -> off_topic
"2 queen beds and a walk-in shower" -> room_matching
"what's the wifi company's number" -> contacts_directory
"how do I handle a diamond member checking in" -> procedure
"guest wants to book with Wyndham points" -> procedure
"how do I use Square" -> procedure
"rooms on the second floor" -> room_matching
"what is Wyndham Rewards" -> general_info
"what hotel chain are we part of" -> general_info

Respond with ONLY the category word.`,
        },
        { role: "user", content: message },
      ],
    });
    const raw = (response.choices[0].message.content ?? "").trim();
    return (VALID_INTENTS.includes(raw as Intent) ? raw : "contacts_directory") as Intent;
  }
}