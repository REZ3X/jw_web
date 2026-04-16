"use client";

/**
 * AI Chat Page — ChatGPT-style landing with sidebar chat history.
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │ LeftSidebar │     Chat Sidebar  │   Welcome Area (centered)  │
 *  │  (global)   │   ─ New chat btn  │   ─ Logo + greeting        │
 *  │             │   ─ Chat history  │   ─ Suggestion cards       │
 *  │             │                   │   ─ Start button            │
 *  │             │                   │   ─ Mobile chat list        │
 *  └──────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  HiPlus, HiChatBubbleLeftRight, HiCpuChip,
  HiTrash, HiChevronRight, HiChevronLeft, HiSparkles,
  HiDocumentText, HiLightBulb, HiMagnifyingGlass
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { timeAgo, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const SUGGESTIONS = [
  {
    icon: HiDocumentText,
    title: "Bikin laporan",
    desc: "Bantu aku bikin laporan masalah sekitar",
    prompt: "Bantu aku bikin laporan soal jalan berlubang di Jl. Malioboro",
  },
  {
    icon: HiLightBulb,
    title: "Pahami aturan",
    desc: "Jelasin regulasi pemerintah",
    prompt: "Jelasin gimana sih proses komplain publik di Jogja",
  },
  {
    icon: HiMagnifyingGlass,
    title: "Cari tau data",
    desc: "Liat tren masalah di komunitas",
    prompt: "Bulan ini masalah yang paling sering dilaporin apa aja ya?",
  },
  {
    icon: HiSparkles,
    title: "Minta saran",
    desc: "Rekomendasi dari AI buat area kamu",
    prompt: "Fasilitas publik apa sih yang bagus ditambahin di Malioboro?",
  },
];

export default function ChatPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!user || !user.email_verified) return;
    clientFetch("/api/chats?limit=50")
      .then((res) => setChats(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const createChat = async (initialPrompt) => {
    if (!user?.email_verified) {
      toast.error("Verifikasi email dulu ya buat pake AI Chat.");
      return;
    }
    try {
      const res = await clientFetch("/api/chats", {
        method: "POST",
        body: JSON.stringify({ chat_type: "agentic" }),
      });
      const newChat = res.data;
      // If initial prompt, store it for the conversation page to pick up
      if (initialPrompt) {
        sessionStorage.setItem(`jw-chat-prompt-${newChat.id}`, initialPrompt);
      }
      router.push(`/chat/${newChat.id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteClick = (id) => {
    setChatToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;
    setIsDeleting(true);
    try {
      await clientFetch(`/api/chats/${chatToDelete}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.id !== chatToDelete));
      toast.success("Chat dihapus");
    } catch (err) {
      toast.error(err.message);
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    setChatToDelete(null);
  };

  // Redirect must happen in a useEffect (not during render) to avoid SSR location errors
  useEffect(() => {
    if (mounted && !user) router.push("/auth/login");
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

  if (!user.email_verified) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <HiCpuChip className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-text-primary">Verifikasi Email Kamu Dulu</h2>
          <p className="text-sm text-text-muted mb-6">
            AI Chat butuh verifikasi email. Cek inbox kamu ya buat dapet link verifikasi.
          </p>
          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/resend-verification", { method: "POST" });
                toast.success("Email verifikasi udah dikirim ulang!");
              } catch { toast.error("Gagal ngirim ulang"); }
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all cursor-pointer"
          >
            Kirim Ulang Email Verifikasi
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen overflow-hidden relative">

      {/* ═══ Main Welcome ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 overflow-y-auto overflow-x-hidden relative bg-bg-default">

        {/* ── Kirana mascot background (desktop only) ── */}
        <div className="hidden sm:block absolute bottom-0 -right-33 sm:-right-36 lg:-right-40 w-[600px] h-[600px] lg:w-[700px] lg:h-[700px]
          pointer-events-none select-none z-0 overflow-visible">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="w-full h-full relative animate-float"
          >
            {/* White square patch — behind GIF to fill transparent hole */}
            <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[12%] h-[10%] bg-white/80 rounded z-0" />
            {/* GIF layer — above the square */}
            <div className="absolute inset-0 z-10">
              <Image
                src="/assets/kirana.gif"
                alt="Kirana — JogjaWaskita Mascot"
                fill
                className="object-contain object-bottom"
                sizes="700px"
                unoptimized
              />
            </div>
          </motion.div>
          {/* Soft fade: bottom-to-top, very light */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
        </div>
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex absolute top-4 right-4 items-center justify-center p-1.5 rounded-lg text-text-muted hover:bg-bg-card-hover hover:text-text-primary transition-all z-10"
          title={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
        >
          {isSidebarOpen ? <HiChevronRight className="w-5 h-5" /> : <HiChevronLeft className="w-5 h-5" />}
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl px-1 sm:px-0 py-6 sm:py-8 relative z-10"
        >
          {/* Greeting — left-aligned, large */}
          <div className="mb-8 sm:mb-10 mt-18">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
              Ada yang bisa dibantu hari ini?
            </h1>
            <p className="text-xs sm:text-sm text-text-muted max-w-lg"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
              Tanya soal masalah warga, bikin laporan, cari data komunitas, atau minta saran.
            </p>
          </div>

          {/* Suggestion cards — glassmorphism */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
                onClick={() => createChat(s.prompt)}
                className="text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl relative overflow-hidden
                  bg-jw-secondary/[0.12] backdrop-blur-xl
                  border border-jw-accent/[0.12]
                  shadow-[inset_0_1px_0_0_rgba(176,228,204,0.06)]
                  hover:border-jw-accent/30 hover:bg-jw-secondary/[0.2]
                  hover:shadow-[inset_0_1px_0_0_rgba(176,228,204,0.12),0_8px_32px_-8px_rgba(64,138,113,0.15)]
                  transition-all duration-300 cursor-pointer group"
              >
                {/* Liquid glass refraction highlight */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl
                  bg-gradient-to-br from-jw-mint/[0.06] via-transparent to-jw-accent/[0.04]
                  pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[1px]
                  bg-gradient-to-r from-transparent via-jw-mint/15 to-transparent
                  pointer-events-none" />
                <s.icon className="w-5 h-5 text-jw-accent mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform relative z-10" />
                <p className="text-xs sm:text-sm font-semibold text-text-primary mb-0.5 relative z-10"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.18)' }}>
                  {s.title}
                </p>
                <p className="text-[10px] sm:text-xs text-text-dim leading-relaxed relative z-10"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
                  {s.desc}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Start chat button */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => createChat()}
              className="flex items-center justify-center gap-2.5 w-full sm:w-auto
                px-8 py-3 sm:py-3.5 rounded-2xl gradient-btn
                shadow-lg shadow-jw-accent/15 cursor-pointer font-semibold text-sm"
            >
              <HiChatBubbleLeftRight className="w-5 h-5" />
              Mulai Ngobrol
            </motion.button>
          </div>

          {/* Mobile: recent chats — improved layout */}
          <div className="md:hidden">
            {chats.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-[11px] font-bold text-text-dim uppercase tracking-wider">
                    Obrolan Terakhir
                  </h3>
                  {chats.length > 5 && (
                    <Link href="#" className="text-[11px] font-semibold text-jw-accent hover:text-jw-mint transition-colors">
                      Liat semua
                    </Link>
                  )}
                </div>
                <div className="space-y-1.5">
                  {chats.slice(0, 5).map((chat) => (
                    <Link
                      key={chat.id}
                      href={`/chat/${chat.id}`}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl
                        bg-white/[0.04] backdrop-blur-md border border-white/[0.08]
                        hover:border-jw-accent/30 active:scale-[0.98] transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-jw-accent/10 flex items-center justify-center shrink-0">
                        <HiChatBubbleLeftRight className="w-4 h-4 text-jw-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{chat.title}</p>
                        <p className="text-[11px] text-text-dim">{timeAgo(chat.updated_at)}</p>
                      </div>
                      <HiChevronRight className="w-4 h-4 text-text-dim shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══ Chat Sidebar ═══ */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:block shrink-0 border-l border-border-default bg-bg-primary/50 overflow-hidden relative z-10"
      >
        <div className="w-[260px] h-full flex flex-col">
          {/* Header + New chat */}
          <div className="p-3 border-b border-border-subtle">
            <button
              onClick={() => createChat()}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                border border-border-default text-sm font-medium
                text-text-primary hover:bg-bg-card-hover
                transition-all duration-200 cursor-pointer"
            >
              <HiPlus className="w-4 h-4" />
              Chat baru
            </button>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loading ? (
              <div className="space-y-1.5 p-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-lg animate-shimmer" />
                ))}
              </div>
            ) : chats.length === 0 ? (
              <p className="text-xs text-text-dim text-center py-8">Belum ada obrolan nih</p>
            ) : (
              chats.map((chat) => (
                <div key={chat.id} className="group flex items-center rounded-lg hover:bg-bg-card-hover transition-colors">
                  <Link
                    href={`/chat/${chat.id}`}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2 min-w-0"
                  >
                    <HiChatBubbleLeftRight className="w-4 h-4 text-text-dim shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text-primary">{chat.title}</p>
                      <p className="text-[10px] text-text-dim">{timeAgo(chat.updated_at)}</p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteClick(chat.id); }}
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

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setChatToDelete(null);
        }}
        onConfirm={confirmDeleteChat}
        title="Hapus Chat"
        description="Yakin mau hapus riwayat obrolan ini?"
        confirmText="Ya, Hapus"
        danger
        loading={isDeleting}
      />
    </div>
  );
}
