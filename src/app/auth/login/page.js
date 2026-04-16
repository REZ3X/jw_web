/**
 * Auth Login Page — Google OAuth login with branded landing.
 *
 * Shows a premium login screen with the platform's value proposition
 * and a single "Sign in with Google" button.
 */
"use client";

import { Suspense } from "react";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { HiShieldCheck, HiCheckCircle, HiArrowTrendingUp, HiChatBubbleLeftRight, HiUsers } from "react-icons/hi2";
import { ImSpinner8 } from "react-icons/im";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { clientFetch } from "@/lib/api";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await clientFetch("/api/auth/google/url");
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const features = [
    { icon: HiShieldCheck, title: "Lapor Masalah", desc: "Kasih tau masalah di sekitarmu pake foto & lokasi" },
    { icon: HiArrowTrendingUp, title: "Pantau Progres", desc: "Pantau terus dari lapor sampe beres" },
    { icon: HiChatBubbleLeftRight, title: "Tanya AI", desc: "AI pinter siap bantu kamu bikin laporan" },
    { icon: HiUsers, title: "Suara Warga", desc: "Upvote laporan penting, makin genting makin di atas" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 pt-12 pb-32 md:py-12">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-center">
        {/* Left: branding + features */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-jw-secondary/20 flex items-center justify-center shadow-xl shadow-jw-accent/10 border border-jw-accent/20">
              <Image
                src="/assets/green-logo.png"
                alt="JogjaWaskita"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                JogjaWaskita
              </h1>
              <p className="text-sm text-muted">Platform Warga Jogja</p>
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight text-foreground">
            Suaramu buat kotamu.
            <br />
            <span className="gradient-text">Bikin lebih baik, bareng-bareng.</span>
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto lg:mx-0">
            Laporin masalah warga, pantau respon pemerintah, & awasi bareng dinas terkait. Semuanya transparan di satu wadah.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * (i + 1) }}
                className="flex items-start gap-3 p-3 rounded-xl glass-card"
              >
                <div className="w-9 h-9 rounded-lg bg-jw-accent/10 border border-jw-accent/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4.5 h-4.5 text-jw-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: login card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="glass-card rounded-3xl p-8 shadow-2xl shadow-black/30 animate-glow-pulse">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-1">Halo!</h3>
              <p className="text-sm text-muted">Login yuk buat mulai ikutan ngawasin & ngebantu bikin Jogja lebih baik.</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error === "missing_code" && "Gagal login: kode akses ilang."}
                {error === "auth_failed" && "Gagal login nih. Coba lagi ya."}
                {error === "server_error" && "Server lagi error. Nanti dicoba lagi aja."}
              </div>
            )}

            {/* Google Sign In button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border-2 border-surface-border bg-surface hover:bg-surface-hover transition-all duration-300 font-semibold text-sm disabled:opacity-60 cursor-pointer hover:border-jw-accent/30 hover:shadow-lg hover:shadow-jw-accent/10 active:scale-[0.98] text-foreground"
            >
              {loading ? (
                <ImSpinner8 className="w-5 h-5 animate-spin" />
              ) : (
                <FcGoogle className="w-5 h-5" />
              )}
              Lanjut pake Google
            </button>

            <p className="text-xs text-muted text-center mt-6">
              Gabung berarti kamu janji mau pake ini baik-baik & ikutan bangun kota.
            </p>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-surface-border">
              <div className="flex items-center gap-1 text-xs text-muted">
                <HiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Aman
              </div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <HiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Privasi Terjaga
              </div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <HiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Gratis
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
