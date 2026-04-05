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
import { Shield, CheckCircle, TrendingUp, MessageSquare, Users, Loader2 } from "lucide-react";
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
    { icon: Shield, title: "Report Issues", desc: "Share problems in your community with photos and location" },
    { icon: TrendingUp, title: "Track Resolution", desc: "Follow the progress from report to resolution" },
    { icon: MessageSquare, title: "AI Assistant", desc: "Get help drafting reports with our smart AI chat" },
    { icon: Users, title: "Community Voice", desc: "Upvote issues that matter — most urgent rises to top" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-center">
        {/* Left: branding + features */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-jw-primary to-jw-secondary flex items-center justify-center shadow-xl shadow-jw-primary/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-jw-primary to-jw-secondary bg-clip-text text-transparent">
                JogjaWaskita
              </h1>
              <p className="text-sm text-muted">Civic Engagement Platform</p>
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight">
            Your voice, your city.
            <br />
            <span className="text-jw-primary">Make it better, together.</span>
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto lg:mx-0">
            Report community issues, track government responses, and hold departments accountable — all in one transparent platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-surface-border"
              >
                <div className="w-9 h-9 rounded-lg bg-jw-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-4.5 h-4.5 text-jw-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-xs text-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: login card */}
        <div className="w-full max-w-sm">
          <div className="bg-surface border border-surface-border rounded-3xl p-8 shadow-xl shadow-black/5">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-1">Welcome</h3>
              <p className="text-sm text-muted">Sign in to start making a difference</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                {error === "missing_code" && "Authentication failed: missing authorization code."}
                {error === "auth_failed" && "Authentication failed. Please try again."}
                {error === "server_error" && "A server error occurred. Please try again later."}
              </div>
            )}

            {/* Google Sign In button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border-2 border-surface-border bg-surface hover:bg-surface-hover transition-all font-semibold text-sm disabled:opacity-60 cursor-pointer hover:border-jw-primary/30 hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </button>

            <p className="text-xs text-muted text-center mt-6">
              By signing in, you agree to use this platform responsibly and help build a better community.
            </p>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-surface-border">
              <div className="flex items-center gap-1 text-xs text-muted">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Secure
              </div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Private
              </div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Free
              </div>
            </div>
          </div>
        </div>
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
