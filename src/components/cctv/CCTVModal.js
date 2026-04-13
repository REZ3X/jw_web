"use client";

/**
 * CCTVModal — Fullscreen-ish modal with live HLS stream from CCTV camera.
 *
 * Features:
 *  - HLS live stream via hls.js
 *  - Camera info header with live indicator
 *  - Glassmorphism design
 *  - Framer-motion open/close animations
 *  - Keyboard (Esc) to close
 */

import { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  HiXMark,
  HiMapPin,
  HiSignal,
} from "react-icons/hi2";
import { motion } from "framer-motion";

/* HLS Player — needs window, dynamic import */
const HLSPlayer = dynamic(() => import("@/components/cctv/HLSPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-bg-primary flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-jw-accent/30 border-t-jw-accent rounded-full animate-spin" />
    </div>
  ),
});

export default function CCTVModal({ camera, onClose }) {
  const handleEsc = useCallback(
    (e) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [handleEsc]);

  if (!camera) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 lg:p-10">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden
          bg-bg-card border border-border-default shadow-2xl shadow-black/60"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3
          border-b border-border-subtle bg-bg-card/90 backdrop-blur-lg">
          <div className="flex items-center gap-3 min-w-0">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-danger/15 border border-danger/25 shrink-0">
              <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="text-[10px] font-bold text-danger uppercase tracking-wider">
                Live
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-text-primary truncate">
                {camera.name}
              </h2>
              <p className="text-[11px] text-text-dim flex items-center gap-1">
                <HiMapPin className="w-3 h-3 text-jw-accent/70 shrink-0" />
                <span className="truncate">
                  {camera.district}
                  {camera.kelurahan ? ` — ${camera.kelurahan}` : ""}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline text-[10px] text-text-dim bg-bg-inset px-2 py-0.5 rounded-md">
              {camera.categoryLabel}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-dim hover:text-text-primary
                hover:bg-bg-card-hover transition-all duration-200 cursor-pointer"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── HLS Stream ── */}
        <HLSPlayer
          src={camera.streamUrl}
          className="w-full aspect-video"
          autoPlay
          muted
        />

        {/* ── Footer info ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5
          border-t border-border-subtle bg-bg-card/90 text-[11px] text-text-dim">
          <div className="flex items-center gap-1.5">
            <HiSignal className="w-3.5 h-3.5 text-jw-accent" />
            <span>Source: CCTV Pemkot Yogyakarta</span>
          </div>
          <span className="text-text-dim/60">cctv.jogjakota.go.id</span>
        </div>
      </motion.div>
    </div>
  );
}
