// Single lazily-created OpenAI client. It must not be built at import time: when deploying to
// Firebase Functions the CLI loads this code to discover the functions, and the OPENAI_API_KEY
// secret only exists at runtime — constructing the client eagerly would crash the deploy.
import OpenAI from "openai";

let instance: OpenAI | undefined;

export function openai(): OpenAI {
  if (!instance) instance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return instance;
}
