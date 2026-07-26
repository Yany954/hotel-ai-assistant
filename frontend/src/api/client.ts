// The ONLY file allowed to know the backend's URL. Every LLM call goes through our own backend
// (src/interfaces/chat-api/), never straight from the browser to Anthropic — the API key must
// never reach client-side code.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function sendChatMessage(message: string) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("chat request failed");
  return res.json();
}
