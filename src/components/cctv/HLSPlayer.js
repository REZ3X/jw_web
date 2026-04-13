"use client";

/**
 * HLSPlayer — Plays HLS (.m3u8) live streams using hls.js.
 *
 * Falls back to native video if the browser supports HLS natively (Safari).
 */

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function HLSPlayer({ src, className = "", autoPlay = true, muted = true }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(false);
    setLoading(true);

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
        liveSyncDurationCount: 3,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setLoading(false);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            // Try to recover
            hls.startLoad();
          } else {
            setError(true);
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        setLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });
      video.addEventListener("error", () => {
        setLoading(false);
        setError(true);
      });
    } else {
      setError(true);
      setLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-bg-primary ${className}`}>
        <div className="text-center px-4">
          <div className="w-12 h-12 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <p className="text-sm text-text-muted font-medium">Stream tak tersedia</p>
          <p className="text-[11px] text-text-dim mt-1">Camera mungkin sedang offline</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-jw-accent/30 border-t-jw-accent rounded-full animate-spin" />
            <p className="text-xs text-text-dim">Memuat stream...</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-contain pointer-events-none"
        muted={muted}
        playsInline
      />
    </div>
  );
}
