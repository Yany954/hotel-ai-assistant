// Front desk-facing chat screen. Staff type a question ("2 queen beds, walk-in shower..."),
// this calls the backend via api/client.ts and renders the response.
// TODO: build out input box, message list, and result rendering (e.g. a room list/card).

import { useState } from "react";
import { sendChatMessage } from "../api/client";

export function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  async function handleSend(text: string) {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    const response = await sendChatMessage(text);
    setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
  }

  return null; // TODO: render messages + input, call handleSend
}
