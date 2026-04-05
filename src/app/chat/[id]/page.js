"use client";

/**
 * Chat Conversation Page — ChatGPT-style message thread.
 * /chat/:id
 */

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send, ArrowLeft, Bot, User, Wrench, Loader2, MessageSquare,
} from "lucide-react";
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

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Send a message */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const msgText = input.trim();
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

      if (chat && chat.title === "New Chat" && user_message) {
        clientFetch(`/api/chats/${id}`)
          .then((r) => setChat(r.data))
          .catch(() => {});
      }
    } catch (err) {
      toast.error(err.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    }
    setSending(false);
    inputRef.current?.focus();
  };

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border">
        <Link
          href="/chat"
          className="p-1.5 rounded-lg text-muted hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold truncate">
            {chat?.title || "Loading…"}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            {chat?.chat_type === "agentic" ? (
              <><Wrench className="w-3 h-3 text-jw-secondary" /> Agent Mode</>
            ) : (
              <><Bot className="w-3 h-3 text-jw-primary" /> General</>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Bot className="w-12 h-12 text-muted-light mx-auto mb-3" />
              <p className="text-sm text-muted">Start the conversation by typing a message below.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 animate-slide-up",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role !== "user" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-jw-primary to-jw-secondary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-jw-primary text-white rounded-br-md"
                    : "bg-surface-hover border border-surface-border rounded-bl-md"
                )}
              >
                {msg.role === "user" ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="text-sm chat-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Tool calls display (agentic mode) */}
                {msg.has_tool_calls && msg.tool_calls && (
                  <div className="mt-2 pt-2 border-t border-surface-border/30">
                    <p className="text-xs text-muted flex items-center gap-1 mb-1">
                      <Wrench className="w-3 h-3" /> Tools used:
                    </p>
                    {(Array.isArray(msg.tool_calls) ? msg.tool_calls : []).map((tc, i) => (
                      <span
                        key={i}
                        className="inline-block text-xs px-2 py-0.5 bg-jw-secondary/10 text-jw-secondary rounded-md mr-1 mb-1"
                      >
                        {tc.tool_name}
                      </span>
                    ))}
                  </div>
                )}

                <p className={cn(
                  "text-[11px] mt-1.5",
                  msg.role === "user" ? "text-white/60" : "text-muted-light"
                )}>
                  {timeAgo(msg.created_at)}
                </p>
              </div>

              {msg.role === "user" && (
                <Avatar src={user.avatar_url} name={user.name} size="sm" />
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-jw-primary to-jw-secondary flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface-hover border border-surface-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-light animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-light animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-light animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-surface-border">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="flex-1 px-4 py-3 bg-surface-hover border border-surface-border rounded-2xl text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-jw-primary/30 focus:border-jw-primary/50 transition-all"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-3 rounded-2xl bg-jw-primary text-white hover:bg-jw-primary-dark disabled:opacity-30 transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
