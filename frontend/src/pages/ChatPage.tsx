import { useState } from "react";
import { Send } from "lucide-react";
import { askStaffQuery } from "../api/client";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

interface ChatMessage {
  role: "staff" | "assistant";
  content: string;
  raw?: any;
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const staffMessage = input;
    setMessages((prev) => [...prev, { role: "staff", content: staffMessage }]);
    setInput("");
    setLoading(true);
    try {
      const result = await askStaffQuery(staffMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: formatResponse(result), raw: result }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Hubo un error consultando el backend." }]);
    } finally {
      setLoading(false);
    }
  }

  function formatResponse(result: any): string {
    if (result.type === "emergency") {
      return `🚨 EMERGENCIA — contacta de inmediato:\n` + result.contacts.map((c: any) => `${c.organizationName}: ${c.phoneLines[0]?.phoneNumber}`).join("\n");
    }
    if (result.type === "rooms") {
      if (result.rooms.length === 0) return "No encontré habitaciones que cumplan todos los criterios.";
      return result.rooms.map((r: any) => `#${r.roomNumber} — ${r.bedConfiguration.bedCount} ${r.bedConfiguration.bedType}, ${r.showerType}`).join("\n");
    }
    if (result.type === "contacts") {
      if (result.contacts.length === 0) return "No encontré ese contacto.";
      return result.contacts.map((c: any) => `${c.organizationName}: ${c.phoneLines[0]?.phoneNumber}`).join("\n");
    }
    if (result.type === "procedure") {
      return result.answer + (result.sources?.length ? `\n\n(fuente: ${result.sources.join(", ")})` : "");
    }
    return JSON.stringify(result);
  }

  return (
    <div className="flex flex-col h-[720px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-lg ${m.role === "staff" ? "ml-auto" : ""}`}>
            <div className={`rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "staff" ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-700"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-slate-400">Pensando...</div>}
      </div>
      <div className="p-4 border-t border-slate-200 bg-white flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Escribe una pregunta como haría el front desk..."
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
        <button onClick={send} className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <Send size={16} />
        </button>
         <button 
            onClick={() => signOut(auth)} 
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-colors ml-auto"
          >
            Sign Out
          </button>
      </div>
    </div>
  );
}