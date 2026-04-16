"use client";

/**
 * Email Verification Page — processes the ?token= query parameter.
 */

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HiCheckCircle, HiXCircle, HiArrowRight } from "react-icons/hi2";
import { ImSpinner2 } from "react-icons/im";
import { clientFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

function VerifyContent() {
  const { setUser } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Waduh, token verifikasinya nggak ketemu nih.");
      return;
    }

    clientFetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (res.user) setUser(res.user);
        setStatus("success");
        setMessage(res.message || "Mantap! Email kamu udah berhasil diverifikasi.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Waduh, verifikasi gagal. Kayaknya link-nya udah kadaluarsa, deh.");
      });
  }, [token, setUser]);

  // Handle countdown & redirect
  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm rounded-[24px] bg-bg-card border border-border-default p-8 text-center"
      >
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center space-y-4 py-4"
            >
              <ImSpinner2 className="w-12 h-12 text-jw-accent animate-spin" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-text-primary">Lagi Ngecek...</h2>
                <p className="text-sm text-text-muted">Bentar ya, nyocokin token verifikasi kamu.</p>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-4 py-2"
            >
              <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mb-1 ring-4 ring-success/5">
                <HiCheckCircle className="w-10 h-10 text-success" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-text-primary">Aman Terkendali!</h2>
                <p className="text-sm text-text-muted leading-relaxed">{message}</p>
              </div>
              
              <div className="w-full h-px bg-border-subtle my-2" />
              
              <div className="w-full">
                <Link
                  href="/"
                  onClick={() => setCountdown(0)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold 
                    gradient-btn mt-2"
                >
                  Langsung ke Beranda <HiArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <p className="text-[11px] font-medium text-text-dim mt-3">
                  Otomatis pindah ke beranda dalam <span className="text-jw-accent font-bold">{countdown}</span> detik...
                </p>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-4 py-2"
            >
              <div className="w-16 h-16 bg-danger/15 rounded-full flex items-center justify-center mb-1 ring-4 ring-danger/5">
                <HiXCircle className="w-10 h-10 text-danger" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-text-primary">Verifikasi Gagal</h2>
                <p className="text-sm text-text-muted leading-relaxed">{message}</p>
              </div>

              <div className="w-full h-px bg-border-subtle my-2" />

              <div className="w-full">
                <Link
                  href="/"
                  onClick={() => setCountdown(0)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold 
                    border border-border-default text-text-primary hover:bg-bg-card-hover transition-all active:scale-[0.98] mt-2"
                >
                  Balik ke Beranda <HiArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <p className="text-[11px] font-medium text-text-dim mt-3">
                  Otomatis pindah ke beranda dalam <span className="text-danger/80 font-bold">{countdown}</span> detik...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <ImSpinner2 className="w-10 h-10 animate-spin text-text-dim" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
