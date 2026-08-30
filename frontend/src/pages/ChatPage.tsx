import { useEffect, useRef, useState } from "react";
import { Send, Plus, MessageSquare, Pencil, Check, Menu, X } from "lucide-react";
import { askStaffQuery, fetchConversations, createConversation, updateConversation } from "../api/client";
import { Conversation, ConversationMessage } from "../types/conversation";

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
            <span className="text-slate-400 dark:text-slate-500">•</span>
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
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  async function startNewConversation() {
    const { id } = await createConversation();
    setConversations((prev) => [{ id, title: "New conversation", messages: [], keep: false }, ...prev]);
    setActiveId(id);
    setSidebarOpen(false);
  }

  function selectConversation(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
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
      const result = await askStaffQuery(input, baseMessages);
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

  const conversationList = (
    <>
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
              c.id === activeId
                ? "bg-violet-50 text-violet-700 font-medium dark:bg-violet-500/15 dark:text-violet-300"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
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
                  className="flex-1 min-w-0 px-1 py-0.5 rounded border border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                />
                <button onClick={() => saveRename(c.id)} className="shrink-0 text-violet-600 dark:text-violet-400">
                  <Check size={13} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => selectConversation(c.id)} className="flex-1 min-w-0 text-left truncate">
                  {c.title}
                </button>
                <button
                  onClick={() => startRename(c)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-400 transition-opacity"
                >
                  <Pencil size={12} />
                </button>
              </>
            )}
          </div>
        ))}
        {conversations.length === 0 && <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500">No conversations yet.</div>}
      </div>
    </>
  );

  return (
    <div className="flex h-[calc(100dvh-6rem)] bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col">
        {conversationList}
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="sm:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Conversations</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            {conversationList}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="sm:hidden flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-500 dark:text-slate-400 p-1">
            <Menu size={18} />
          </button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{active?.title ?? "New conversation"}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3">
          {(active?.messages ?? []).map((m, i) => (
            <div key={i} className={`max-w-[85%] sm:max-w-lg ${m.role === "staff" ? "ml-auto" : ""}`}>
              <div
                className={`rounded-xl px-4 py-2.5 text-sm ${
                  m.role === "staff"
                    ? "bg-violet-600 text-white whitespace-pre-wrap"
                    : "bg-white border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                }`}
              >
                {m.role === "assistant" ? renderMarkdownLite(m.text) : m.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-slate-400 dark:text-slate-500">Thinking...</div>}
          <div ref={bottomRef} />
        </div>
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask a question like front desk would..."
            rows={1}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm resize-none overflow-y-auto max-h-40 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
          />
          <button onClick={send} className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
