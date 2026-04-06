"use client";

/**
 * Email Verification Page — processes the ?token= query parameter.
 */

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { clientFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

function VerifyContent() {
  const { setUser } = useAuthStore();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    clientFetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (res.user) setUser(res.user);
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Verification failed. The link may have expired.");
      });
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-surface border border-surface-border rounded-2xl p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 text-jw-primary animate-spin mx-auto" />
            <p className="text-sm text-muted">Verifying your email…</p>
          </div>
        )}
        {status === "success" && (
          <div className="space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold">Email Verified!</h2>
            <p className="text-sm text-muted">{message}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-jw-primary text-white text-sm font-medium mt-4 hover:bg-jw-primary-dark transition-colors"
            >
              Go to Home
            </Link>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-3">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Verification Failed</h2>
            <p className="text-sm text-muted">{message}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface-hover border border-surface-border text-sm font-medium mt-4 hover:bg-surface-hover transition-colors"
            >
              Go to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
