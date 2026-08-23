import { useEffect, useRef, useState } from "react";
import { Send, Plus, MessageSquare, Pencil, Check } from "lucide-react";
import { askStaffQuery, fetchConversations, createConversation, updateConversation } from "../api/client";
import { Conversation, ConversationMessage } from "../types/conversation";

// Tiny Markdown renderer — just enough for what the backend actually sends back: **bold** spans
// and "- " bullet lines. Not a general Markdown parser on purpose; the AI is instructed to keep
// formatting light, so this only needs to cover those two cases.
function renderMarkdownLite(text: string) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const isBullet = line.trim().startsWith("- ");
        const content = isBullet ? line.trim().slice(2) : line;
        const segments = content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        const rendered = segments.map((seg, j) =>
          seg.startsWith("**") && seg.endsWith("**") ? <strong key={j}>{seg.slice(2, -2)}</strong> : <span key={j}>{seg}</span>
        );
        return isBullet ? (
          <div key={i} className="flex gap-1.5 pl-1">
            <span className="text-slate-400">•</span>
            <span>{rendered}</span>
          </div>
        ) : (
          <div key={i}>{rendered.length ? rendered : <>&nbsp;</>}</div>
        );
      })}
    </>
  );
}

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    fetchConversations().then((list) => {
      setConversations(list);
      if (list.length) setActiveId(list[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, loading]);

  async function startNewConversation() {
    const { id } = await createConversation();
    setConversations((prev) => [{ id, title: "New conversation", messages: [], keep: false }, ...prev]);
    setActiveId(id);
  }

  function patchActive(id: string, messages: ConversationMessage[]) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, messages } : c)));
  }

  function startRename(c: Conversation) {
    setRenamingId(c.id);
    setRenameInput(c.title);
  }

  async function saveRename(id: string) {
    const title = renameInput.trim();
    setRenamingId(null);
    if (!title) return;
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    try {
      await updateConversation(id, { title });
    } catch (error) {
      console.error(error);
    }
  }

  function formatResponse(result: any): string {
    if (result.type === "emergency") {
      return `🚨 EMERGENCY — contact immediately:\n` + result.contacts.map((c: any) => `- **${c.organizationName}** — ${c.phoneLines[0]?.phoneNumber}`).join("\n");
    }
    return result.answer ?? "Sorry, something went wrong reading that response.";
  }

  async function send() {
    if (!input.trim()) return;

    let conversationId = activeId;
    let baseMessages = active?.messages ?? [];
    const isFirstExchange = baseMessages.length === 0;

    if (!conversationId) {
      const created = await createConversation();
      conversationId = created.id;
      setConversations((prev) => [{ id: conversationId!, title: "New conversation", messages: [], keep: false }, ...prev]);
      setActiveId(conversationId);
    }

    const staffMessage: ConversationMessage = { role: "staff", text: input, timestamp: new Date().toISOString() };
    const withStaff = [...baseMessages, staffMessage];
    patchActive(conversationId, withStaff);
    setInput("");
    setLoading(true);

    try {
      const result = await askStaffQuery(input);
      const assistantMessage: ConversationMessage = { role: "assistant", text: formatResponse(result), timestamp: new Date().toISOString() };
      const withBoth = [...withStaff, assistantMessage];
      patchActive(conversationId, withBoth);
      await updateConversation(conversationId, { messages: withBoth });

      if (isFirstExchange) {
        const refreshed = await fetchConversations();
        const match = refreshed.find((c) => c.id === conversationId);
        if (match) {
          setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, title: match.title } : c)));
        }
      }
      } catch (error: any) {
        console.error(error);
        const errorMessage: ConversationMessage = { role: "assistant", text: error?.message ?? "There was an error reaching the backend.", timestamp: new Date().toISOString() };
        patchActive(conversationId, [...withStaff, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[720px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> New conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                c.id === activeId ? "bg-violet-50 text-violet-700 font-medium" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <MessageSquare size={14} className="shrink-0" />
              {renamingId === c.id ? (
                <>
                  <input
                    autoFocus
                    value={renameInput}
                    onChange={(e) => setRenameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveRename(c.id)}
                    onBlur={() => saveRename(c.id)}
                    className="flex-1 min-w-0 px-1 py-0.5 rounded border border-violet-200 text-sm focus:outline-none"
                  />
                  <button onClick={() => saveRename(c.id)} className="shrink-0 text-violet-600">
                    <Check size={13} />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setActiveId(c.id)} className="flex-1 min-w-0 text-left truncate">
                    {c.title}
                  </button>
                  <button
                    onClick={() => startRename(c)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-violet-600 transition-opacity"
                  >
                    <Pencil size={12} />
                  </button>
                </>
              )}
            </div>
          ))}
          {conversations.length === 0 && <div className="px-3 py-2 text-xs text-slate-400">No conversations yet.</div>}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {(active?.messages ?? []).map((m, i) => (
            <div key={i} className={`max-w-lg ${m.role === "staff" ? "ml-auto" : ""}`}>
              <div className={`rounded-xl px-4 py-2.5 text-sm ${m.role === "staff" ? "bg-violet-600 text-white whitespace-pre-wrap" : "bg-white border border-slate-200 text-slate-700"}`}>
                {m.role === "assistant" ? renderMarkdownLite(m.text) : m.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-slate-400">Thinking...</div>}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-slate-200 bg-white flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask a question like front desk would..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <button onClick={send} className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}