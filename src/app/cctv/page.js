"use client";

/**
 * CCTV Page — Interactive CCTV map of Yogyakarta city.
 *
 * Fetches 100+ CCTV locations from the government API,
 * displays them on a Leaflet map with dark/light tile toggle.
 * Click a marker → opens live HLS stream modal.
 */

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { HiVideoCamera, HiSun, HiMoon } from "react-icons/hi2";
import { normalizeCCTV } from "@/lib/cctv-data";
import { cn } from "@/lib/utils";
import CCTVPanel from "@/components/cctv/CCTVPanel";
import CCTVModal from "@/components/cctv/CCTVModal";

/* Leaflet requires window — dynamic import with SSR disabled */
const CCTVMap = dynamic(() => import("@/components/cctv/CCTVMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-bg-primary">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-jw-accent/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <HiVideoCamera className="w-5 h-5 text-jw-accent" />
        </div>
        <p className="text-sm text-text-muted">Lagi loading Map CCTV nih...</p>
      </div>
    </div>
  ),
});

export default function CCTVPage() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [lightMap, setLightMap] = useState(false);

  // Fetch CCTV data from proxy API
  useEffect(() => {
    async function fetchCameras() {
      try {
        const res = await fetch("/api/cctv");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const normalized = normalizeCCTV(data);
        setCameras(normalized);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCameras();
  }, []);

  const handleSelectCCTV = useCallback((cam) => {
    setSelectedCamera(cam);
    setActiveId(cam.id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedCamera(null);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] lg:h-screen items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-jw-accent/10 border border-jw-accent/20
            flex items-center justify-center mx-auto mb-4 animate-pulse">
            <HiVideoCamera className="w-6 h-6 text-jw-accent" />
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">Ditunggu ya, lagi ambil data CCTV...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] lg:h-screen items-center justify-center bg-bg-primary px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20
            flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">Gagal memuat data CCTV</p>
          <p className="text-xs text-text-dim mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-xl gradient-btn text-sm font-semibold cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen overflow-hidden relative">

      {/* ═══ Map Area ═══ */}
      <div className="flex-1 relative">
        <CCTVMap
          cameras={cameras}
          onSelectCCTV={handleSelectCCTV}
          selectedId={activeId}
          lightTheme={lightMap}
        />

        {/* Map overlay header */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
          <div className="px-3.5 py-2 rounded-xl bg-bg-primary/85 backdrop-blur-xl
            border border-border-default shadow-xl shadow-black/30">
            <h1 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <HiVideoCamera className="w-4 h-4 text-jw-accent" />
              CCTV Kota Yogyakarta
            </h1>
            <p className="text-[10px] text-text-dim mt-0.5">
              {cameras.length} kamera • Monitoring langsung
            </p>
          </div>
        </div>

        {/* ═══ Map theme toggle — mobile only ═══ */}
        <div className="lg:hidden absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setLightMap(!lightMap)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl",
              "border shadow-lg transition-all duration-300 cursor-pointer",
              lightMap
                ? "bg-white/90 border-gray-200 shadow-black/10 text-gray-700"
                : "bg-bg-primary/85 border-border-default shadow-black/30 text-text-primary"
            )}
            title={lightMap ? "Ganti ke map gelap" : "Ganti ke map terang"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {lightMap ? (
                <motion.span
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HiMoon className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HiSun className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-[11px] font-semibold">
              {lightMap ? "Gelap" : "Terang"}
            </span>
          </motion.button>
        </div>
      </div>

      {/* ═══ Camera Panel ═══ */}
      <CCTVPanel
        cameras={cameras}
        selectedId={activeId}
        onSelect={handleSelectCCTV}
        lightMap={lightMap}
        setLightMap={setLightMap}
      />

      {/* ═══ Live Stream Modal ═══ */}
      <AnimatePresence>
        {selectedCamera && (
          <CCTVModal
            camera={selectedCamera}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

