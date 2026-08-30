import OpenAI from "openai";
import { IntentRouter, Intent, ConversationTurn } from "../../application/router/intent-router";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VALID_INTENTS: Intent[] = ["greeting", "off_topic", "room_matching", "contacts_directory", "procedure", "general_info"];

export class OpenAiIntentRouter implements IntentRouter {
  async classify(message: string, history: ConversationTurn[] = []): Promise<Intent> {
    const recentHistory = history.slice(-6);
    const historyBlock = recentHistory.length
      ? `Recent conversation, most recent last (use this ONLY to disambiguate an otherwise-vague follow-up message — classify based on what the STAFF MEMBER's latest message is actually asking):\n${recentHistory
          .map((t) => `${t.role === "staff" ? "Staff" : "Assistant"}: ${t.text}`)
          .join("\n")}\n\n`
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Classify the staff member's LATEST message into exactly one: greeting, off_topic, room_matching, contacts_directory, procedure, general_info.

greeting: "hi", "hello", "hey", "good morning" — a hello with no real question.
off_topic: anything unrelated to the hotel or its brand (weather, sports, personal questions, general trivia, homework help).
room_matching: guest room requirements (beds, shower, floor, accessibility, kitchen, view, suite).
contacts_directory: asking for a phone number or who to call, by name or vendor.
procedure: how-to questions, hotel policies, guest situations, staff duties — anything needing an explanation of steps or rules specific to THIS hotel that our internal procedure documents would cover.
general_info: questions about the Wyndham brand, loyalty programs, or general hospitality knowledge that isn't a step-by-step hotel procedure (e.g. "what is Wyndham Rewards", "what chain is this hotel part of").

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
"what are space coast rooms?" -> procedure
"where are space coast rooms?" -> procedure
"how to check in a space coast room" -> procedure
"how to check out a space coast room" -> procedure
"space coast room rate code" -> procedure
"rate for space coast room" -> procedure
"a guest is asking for rollaway bed" -> procedure
"rollaway bed request" -> procedure
"do we have rollaway beds" -> procedure
"cot request" -> procedure
"extra bed request" -> procedure
"how many extra cots do we have" -> procedure
"what is the earliest a guest can check in?" -> procedure
"can a guest check in at 1pm?" -> procedure
"Wyndham Rewards number" -> contacts_directory
"guest is checking out early" -> procedure
"guest wants to leave a day early" -> procedure
"guest needs maintenance" -> procedure
"AC or PTAC is not working" -> procedure
"how to reset the AC unit" -> procedure
"toilet is clogged" -> procedure
"how to submit a maintenance ticket" -> procedure
"guest wants a refund for broken items" -> procedure
"how to respond to a bad review" -> procedure
"how to respond to a good review" -> procedure
"OTA review responses" -> procedure
"template for responding to guest reviews" -> procedure
"what to reply to a 10 out of 10 review" -> procedure
"how to reset the AC" -> procedure
"how to reset a PTAC" -> procedure
"AC is not working" -> procedure
"how to fix the AC unit" -> procedure
"PTAC reset steps" -> procedure
"can a guest pay with cash" -> procedure

A message that's just a name with no verb or question — a person, vendor, or organization on its
own (e.g. after you already asked which one they meant) — is contacts_directory, not off_topic:
staff type just a name when they're trying to look it up.
"Safe Passages" -> contacts_directory
"Tech Guru" -> contacts_directory
"credit card machine not working" -> procedure
"card reader is frozen" -> procedure
"rates and categories for VIP guests" -> procedure
"synxis issue dashboard numbers wrong" -> procedure
"trouble with synxis vacant dirty status" -> procedure
"synxis system error or PMS mismatch" -> procedure
"already reset the elevator and still not working" -> procedure
"elevator reset didnt work" -> procedure
"guest trapped in elevator" -> procedure
"firefighters arrived at front desk" -> procedure
"fire alarm evacuation steps" -> procedure
"what should i do if the fireman arrive here" -> procedure
"the fireman is here what should i do" -> procedure
"firefighters arrived at front desk" -> procedure
"which reports should i generate during the night audit shift" -> procedure
"night audit reports list" -> procedure
"what reports to print for night audit" -> procedure
"first shift duties" -> procedure
"second shift responsibilities" -> procedure
"third shift tasks" -> procedure
"how to set up housekeeping boards in kipsu" -> procedure
"bar rules second shift" -> procedure

A short follow-up that's ambiguous alone (e.g. "when I try to login it says error", "it's not
working") almost always continues whatever the conversation was already about — use the recent
conversation below to classify it the same way, not as off_topic or a fresh guess.
If the user is asking what action to take or what to do when emergency responders/firefighters arrive, classify as procedure (DO NOT classify as emergency_contact or contact_lookup).

Respond with ONLY the category word.`,
        },
        { role: "user", content: `${historyBlock}Staff member's latest message: "${message}"` },
      ],
    });
    const raw = (response.choices[0].message.content ?? "").trim();
    return (VALID_INTENTS.includes(raw as Intent) ? raw : "contacts_directory") as Intent;
  }
}