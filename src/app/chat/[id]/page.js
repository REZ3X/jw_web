"use client";

/**
 * Chat Conversation Page — ChatGPT-style message thread.
 *
 * Layout:
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  Chat Sidebar │           Message Thread (centered)         │
 *  │   ─ New chat  │  ─ Sticky header (title + mode)            │
 *  │   ─ History   │  ─ Messages (full-width, no bubble for AI) │
 *  │               │  ─ Sticky input bar (auto-resize textarea) │
 *  └─────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  HiPaperAirplane, HiArrowLeft, HiCpuChip,
  HiWrenchScrewdriver, HiChatBubbleLeftRight,
  HiPlus, HiTrash, HiStopCircle, HiChevronRight, HiChevronLeft
} from "react-icons/hi2";
import { ImSpinner8 } from "react-icons/im";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { timeAgo, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ChatConversation() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const [chat, setChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load chat + messages
  useEffect(() => {
    if (!user || !id || !user.email_verified) return;
    Promise.all([
      clientFetch(`/api/chats/${id}`),
      clientFetch(`/api/chats/${id}/messages?limit=100`),
    ])
      .then(([chatRes, msgRes]) => {
        setChat(chatRes.data);
        setMessages(msgRes.data || []);
      })
      .catch(() => toast.error("Failed to load chat"))
      .finally(() => setLoading(false));
  }, [id, user]);

  // Load sidebar chats
  useEffect(() => {
    if (!user?.email_verified) return;
    clientFetch("/api/chats?limit=50")
      .then((res) => setChats(res?.data || []))
      .catch(() => {})
      .finally(() => setSidebarLoading(false));
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send prompt from suggestion cards (sessionStorage)
  useEffect(() => {
    if (!id || loading || sending) return;
    const stored = sessionStorage.getItem(`jw-chat-prompt-${id}`);
    if (stored) {
      sessionStorage.removeItem(`jw-chat-prompt-${id}`);
      setInput(stored);
      // Auto-send after small delay
      setTimeout(() => {
        sendMessage(stored);
      }, 300);
    }
  }, [id, loading]);

  // Auto-resize textarea
  const adjustTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, []);

  useEffect(() => { adjustTextarea(); }, [input, adjustTextarea]);

  /** Send a message */
  const sendMessage = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || sending) return;

    setInput("");
    setSending(true);

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: msgText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await clientFetch(`/api/chats/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: msgText }),
      });

      const { user_message, assistant_message } = res.data;

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        user_message,
        assistant_message,
      ]);

      // Refresh title if it was "New Chat"
      if (chat && chat.title === "New Chat") {
        clientFetch(`/api/chats/${id}`)
          .then((r) => setChat(r.data))
          .catch(() => {});
      }
    } catch (err) {
      toast.error(err.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    }
    setSending(false);
    textareaRef.current?.focus();
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createChat = async () => {
    try {
      const res = await clientFetch("/api/chats", {
        method: "POST",
        body: JSON.stringify({ chat_type: "agentic" }),
      });
      router.push(`/chat/${res.data.id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteChat = async (chatId) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      await clientFetch(`/api/chats/${chatId}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (chatId === id) router.push("/chat");
      toast.success("Chat deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!user) { router.push("/auth/login"); return null; }
  if (!user.email_verified) { router.push("/chat"); return null; }

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen overflow-hidden relative">

      {/* ═══ Main Chat Area ═══ */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-default relative">

        {/* ── Sticky header ── */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle
          bg-bg-default/80 backdrop-blur-lg shrink-0">
          <Link
            href="/chat"
            className="p-1.5 rounded-xl text-text-muted hover:bg-bg-card-hover hover:text-text-primary transition-all md:hidden"
          >
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-jw-secondary to-jw-accent flex items-center justify-center shrink-0">
              <HiCpuChip className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate text-text-primary">
                {chat?.title || "Loading…"}
              </h1>
            </div>
          </div>
          
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-text-muted hover:bg-bg-card-hover hover:text-text-primary transition-all"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <HiChevronRight className="w-5 h-5" /> : <HiChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ImSpinner8 className="w-6 h-6 animate-spin text-text-dim mx-auto mb-3" />
                <p className="text-sm text-text-dim">Loading conversation…</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-jw-accent/10 border border-jw-accent/15 flex items-center justify-center mx-auto mb-4">
                  <HiCpuChip className="w-6 h-6 text-jw-accent" />
                </div>
                <p className="text-sm text-text-muted mb-1">Start the conversation</p>
                <p className="text-xs text-text-dim">Type a message below to begin.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-4 space-y-0">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx > messages.length - 3 ? 0.05 : 0 }}
                  className={cn(
                    "py-5",
                    idx < messages.length - 1 && "border-b border-border-subtle/50"
                  )}
                >
                  {/* Message header */}
                  <div className="flex items-center gap-2.5 mb-2">
                    {msg.role === "user" ? (
                      <Avatar src={user.avatar_url} name={user.name} size="xs" />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-jw-secondary to-jw-accent flex items-center justify-center shrink-0">
                        <HiCpuChip className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-semibold text-text-primary">
                      {msg.role === "user" ? "You" : "JW AI"}
                    </span>
                  </div>

                  {/* Message content */}
                  {msg.role === "user" ? (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-text-primary/90 pl-[34px]">
                      {msg.content}
                    </p>
                  ) : (
                    <div className="text-[15px] leading-relaxed chat-markdown text-text-primary/85 pl-[34px]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Tool calls (agentic mode) */}
                  {msg.has_tool_calls && msg.tool_calls && (
                    <div className="mt-3 pl-[34px]">
                      <div className="inline-flex flex-wrap items-center gap-1.5">
                        <HiWrenchScrewdriver className="w-3 h-3 text-text-dim" />
                        {(Array.isArray(msg.tool_calls) ? msg.tool_calls : []).map((tc, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 bg-jw-accent/8 text-jw-accent rounded-md border border-jw-accent/15 font-medium"
                          >
                            {tc.tool_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Thinking indicator */}
              <AnimatePresence>
                {sending && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="py-5"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-jw-secondary to-jw-accent flex items-center justify-center shrink-0">
                        <HiCpuChip className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-text-primary">JW AI</span>
                    </div>
                    <div className="pl-[34px] flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-jw-accent/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-jw-accent/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-jw-accent/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-xs text-text-dim">Thinking…</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div className="shrink-0 border-t border-border-subtle bg-bg-default/80 backdrop-blur-lg">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <form onSubmit={handleSend} className="relative">
              <div className="flex items-end gap-2 bg-bg-card border border-border-default rounded-2xl
                focus-within:border-jw-accent/40 focus-within:ring-2 focus-within:ring-jw-accent/15
                transition-all duration-200 px-4 py-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message JW AI…"
                  rows={1}
                  className="flex-1 bg-transparent border-none text-sm text-text-primary
                    placeholder:text-text-dim leading-relaxed py-1.5
                    focus:outline-none resize-none max-h-[160px]"
                  disabled={sending}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={!input.trim() || sending}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200 cursor-pointer shrink-0 mb-0.5",
                    input.trim() && !sending
                      ? "gradient-btn shadow-md shadow-jw-accent/15"
                      : "bg-bg-inset text-text-dim"
                  )}
                >
                  {sending ? (
                    <ImSpinner8 className="w-4 h-4 animate-spin" />
                  ) : (
                    <HiPaperAirplane className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
              <p className="text-[10px] text-text-dim text-center mt-2">
                JW AI can make mistakes. Verify important information.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ═══ Chat Sidebar ═══ */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:block shrink-0 border-l border-border-default bg-bg-primary/50 overflow-hidden relative z-10"
      >
        <div className="w-[260px] h-full flex flex-col">
          {/* New chat button */}
          <div className="p-3 border-b border-border-subtle">
            <button
              onClick={createChat}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                border border-border-default text-sm font-medium
                text-text-primary hover:bg-bg-card-hover
                transition-all duration-200 cursor-pointer"
            >
              <HiPlus className="w-4 h-4" />
              New chat
            </button>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sidebarLoading ? (
              <div className="space-y-1.5 p-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-lg animate-shimmer" />
                ))}
              </div>
            ) : (
              chats.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "group flex items-center rounded-lg transition-colors",
                    c.id === id
                      ? "bg-bg-card-hover"
                      : "hover:bg-bg-card-hover"
                  )}
                >
                  <Link
                    href={`/chat/${c.id}`}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2 min-w-0"
                  >
                    <HiChatBubbleLeftRight className="w-4 h-4 text-text-dim shrink-0" />
                    <p className={cn(
                      "truncate text-sm",
                      c.id === id ? "font-semibold text-text-primary" : "text-text-muted"
                    )}>{c.title}</p>
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
                    className="p-1.5 mr-1 rounded-md text-text-dim opacity-0 group-hover:opacity-100
                      hover:text-danger hover:bg-danger/8 transition-all cursor-pointer"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.aside>

    </div>
  );
}
