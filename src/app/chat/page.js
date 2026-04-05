"use client";

/**
 * AI Chat Page — ChatGPT-style layout with sidebar chat list.
 * /chat — shows chat list + new chat prompt
 * /chat/:id — shows selected conversation
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, MessageSquare, Bot, Wrench, Trash2, MoreHorizontal, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import Button from "@/components/ui/Button";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import EmptyState from "@/components/ui/EmptyState";
import { timeAgo, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    clientFetch("/api/chats?limit=50")
      .then((res) => setChats(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const createChat = async (type = "general") => {
    try {
      const res = await clientFetch("/api/chats", {
        method: "POST",
        body: JSON.stringify({ chat_type: type }),
      });
      const newChat = res.data;
      router.push(`/chat/${newChat.id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteChat = async (id) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      await clientFetch(`/api/chats/${id}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.id !== id));
      toast.success("Chat deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex gap-6">
        {/* Sidebar: chat list */}
        <aside className="w-72 shrink-0 hidden md:block">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-muted">Conversations</h2>
            </div>

            {/* New chat buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => createChat("general")}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-surface-border hover:bg-surface-hover transition-colors text-sm font-medium cursor-pointer"
              >
                <Bot className="w-4 h-4 text-jw-primary" /> New Chat
              </button>
              <button
                onClick={() => createChat("agentic")}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-jw-secondary/30 bg-jw-secondary/5 hover:bg-jw-secondary/10 transition-colors text-sm font-medium cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-jw-secondary" /> New Agent Chat
              </button>
            </div>

            {/* Chat list */}
            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl animate-shimmer" />
                  ))}
                </div>
              ) : chats.length === 0 ? (
                <p className="text-xs text-muted-light text-center py-4">No conversations yet</p>
              ) : (
                chats.map((chat) => (
                  <div key={chat.id} className="group flex items-center gap-2">
                    <Link
                      href={`/chat/${chat.id}`}
                      className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-hover transition-colors text-sm"
                    >
                      {chat.chat_type === "agentic" ? (
                        <Wrench className="w-4 h-4 text-jw-secondary shrink-0" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-muted shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-sm">{chat.title}</p>
                        <p className="text-[11px] text-muted-light">{timeAgo(chat.updated_at)}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="p-1.5 rounded-lg text-muted-light opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main: welcome / new chat */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-jw-primary/20 to-jw-secondary/20 flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-jw-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">JW AI Assistant</h2>
            <p className="text-sm text-muted mb-8">
              Ask questions about civic issues, get help drafting reports, or explore platform data with the agentic assistant.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => createChat("general")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-surface-border hover:border-jw-primary/30 hover:bg-jw-primary/5 transition-all cursor-pointer group"
              >
                <Bot className="w-6 h-6 text-jw-primary" />
                <span className="text-sm font-semibold">General Chat</span>
                <span className="text-xs text-muted">Conversational assistant</span>
              </button>
              <button
                onClick={() => createChat("agentic")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-surface-border hover:border-jw-secondary/30 hover:bg-jw-secondary/5 transition-all cursor-pointer group"
              >
                <Wrench className="w-6 h-6 text-jw-secondary" />
                <span className="text-sm font-semibold">Agent Chat</span>
                <span className="text-xs text-muted">Search data, draft reports</span>
              </button>
            </div>

            {/* Mobile: show existing chats */}
            <div className="md:hidden mt-8">
              {chats.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-muted mb-3">Recent Conversations</h3>
                  <div className="space-y-2">
                    {chats.slice(0, 5).map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/chat/${chat.id}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-surface-border hover:bg-surface-hover transition-colors"
                      >
                        {chat.chat_type === "agentic" ? (
                          <Wrench className="w-4 h-4 text-jw-secondary" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-muted" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{chat.title}</p>
                          <p className="text-xs text-muted-light">{timeAgo(chat.updated_at)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-light" />
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
