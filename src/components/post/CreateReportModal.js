"use client";

/**
 * CreateReportModal — Global "Submit a Report" modal.
 *
 * X/Twitter-style compose modal that can be triggered from any page
 * via the custom event "jw:open-create-post".
 *
 * Features:
 *  - Full-screen backdrop with blur
 *  - Compact, centered compose card
 *  - User avatar in header
 *  - Smooth spring animations
 *  - Accessible from LeftSidebar CTA, HomeFeed prompt, and mobile FAB
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HiXMark, HiPencilSquare } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import PostForm from "@/components/post/PostForm";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function CreateReportModal() {
  const { user, loaded } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Listen for the global custom event
  useEffect(() => {
    const handler = () => {
      if (!user) {
        toast.error("Login dulu ya buat bikin laporan");
        return;
      }
      if (!user.email_verified) {
        toast.error("Verifikasi email kamu dulu ya");
        return;
      }
      setOpen(true);
    };
    window.addEventListener("jw:open-create-post", handler);
    return () => window.removeEventListener("jw:open-create-post", handler);
  }, [user]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("jw:overlay-open"));
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("jw:overlay-close"));
    };
  }, [open]);

  const handleCreated = useCallback((newPost) => {
    setOpen(false);
    // If on home page, dispatch reload event
    window.dispatchEvent(new CustomEvent("jw:post-created", { detail: newPost }));
    toast.success("Laporan terkirim!");
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[3vh] sm:pt-[6vh] px-3 sm:px-4 pb-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-xl rounded-2xl overflow-hidden
              bg-bg-card border border-border-default
              shadow-2xl shadow-black/50
              max-h-[92vh] flex flex-col"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-xl text-text-dim hover:text-text-primary hover:bg-bg-card-hover transition-all cursor-pointer"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <HiPencilSquare className="w-4 h-4 text-jw-accent" />
                  Laporan Baru
                </h2>
              </div>
            </div>

            {/* ── Compose area ── */}
            <div className="overflow-y-auto flex-1">
              {/* User indicator */}
              {user && (
                <div className="flex items-center gap-2.5 px-5 pt-4 pb-2">
                  <Avatar src={user.avatar_url} name={user.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                    <p className="text-[11px] text-text-dim">Posting sebagai @{user.username}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="px-5 pb-5">
                <PostForm
                  onClose={() => setOpen(false)}
                  onCreated={handleCreated}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
