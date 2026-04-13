"use client";

/**
 * LeftSidebar — Permanent navigation sidebar (lg+ only).
 *
 * Always visible on desktop, cannot be minimized.
 * X/Twitter-style fixed left navigation.
 *
 * Contains:
 *  - Brand/logo
 *  - Main nav links with active states
 *  - Quick tools (dashboard/admin for authorized users)
 *  - "Create Report" CTA
 *  - User card with quick profile link
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  HiHome, HiGlobeAlt, HiChatBubbleLeftRight,
  HiUser, HiSquares2X2, HiShieldCheck,
  HiCog6Tooth, HiArrowRightOnRectangle,
  HiPlusCircle, HiBookOpen, HiVideoCamera
} from "react-icons/hi2";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/lib/store";
import { isGovRole, isDevRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

function NavLink({ href, icon: Icon, label, active }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
        active
          ? "bg-jw-accent/12 text-jw-mint"
          : "text-text-muted hover:text-text-primary hover:bg-bg-card-hover"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 shrink-0 transition-transform duration-200",
        active ? "" : "group-hover:scale-110"
      )} />
      <span>{label}</span>
    </Link>
  );
}

export default function LeftSidebar() {
  const { user, loaded } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    useAuthStore.getState().clearUser();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 sticky top-0 h-screen border-r border-border-default bg-bg-primary/50 z-30">

      {/* ─── Brand ───────────────────────── */}
      <div className="px-4 pt-5 pb-3">
        <Link href="/" className="flex items-center gap-2.5 px-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-jw-accent/8 group-hover:bg-jw-accent/15 transition-colors duration-200">
            <Image
              src="/assets/green-logo.png"
              alt="JogjaWaskita"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
          <span className="text-base font-bold text-jw-mint tracking-tight">
            JogjaWaskita
          </span>
        </Link>
      </div>

      {/* ─── Main nav ────────────────────── */}
      <nav className="px-3 space-y-0.5 mt-2">
        <NavLink href="/" icon={HiHome} label="Home" active={isActive("/")} />
        <NavLink href="/explore" icon={HiGlobeAlt} label="Explore" active={isActive("/explore")} />
        <NavLink href="/cctv" icon={HiVideoCamera} label="CCTV Map" active={isActive("/cctv")} />
        {loaded && user && (
          <NavLink href="/chat" icon={HiChatBubbleLeftRight} label="AI Chat" active={isActive("/chat")} />
        )}
      </nav>

      {/* ─── Tools ────────────────────────── */}
      {loaded && user && (isGovRole(user.role) || isDevRole(user.role)) && (
        <div className="px-3 mt-6">
          <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-3 mb-2">
            Tools
          </p>
          <div className="space-y-0.5">
            <NavLink href="/dashboard" icon={HiSquares2X2} label="Dashboard" active={isActive("/dashboard")} />
            {isDevRole(user.role) && (
              <NavLink href="/admin" icon={HiShieldCheck} label="Admin" active={isActive("/admin")} />
            )}
          </div>
        </div>
      )}

      {/* ─── Spacer ───────────────────────── */}
      <div className="flex-1" />

      {/* ─── Create Report CTA ────────────── */}
      {loaded && user && !user.is_government && (
        <div className="px-3 mb-3">
          <Link
            href="/?create=1"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("jw:open-create-post"));
            }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl gradient-btn text-sm font-semibold cursor-pointer
              shadow-lg shadow-jw-accent/10 hover:shadow-jw-accent/20 transition-shadow duration-300"
          >
            <HiPlusCircle className="w-5 h-5" />
            Create Report
          </Link>
        </div>
      )}

      {/* ─── User card ────────────────────── */}
      {loaded && user && (
        <div className="px-3 pb-4">
          <div className="rounded-xl bg-bg-card border border-border-default p-3 hover:border-border-accent/40 transition-colors duration-200">
            <div className="flex items-center gap-2.5 mb-2.5">
              <Link href={`/profile/${user.username}`}>
                <Avatar src={user.avatar_url} name={user.name} size="sm" isGovernment={user.is_government} className="cursor-pointer" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/profile/${user.username}`} className="text-sm font-semibold text-text-primary hover:text-jw-mint transition-colors truncate block">
                  {user.name}
                </Link>
                <p className="text-[11px] text-text-dim truncate">@{user.username}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Link
                href="/profile/settings"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
              >
                <HiCog6Tooth className="w-3.5 h-3.5" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold text-text-muted hover:text-danger hover:bg-danger/5 transition-colors cursor-pointer"
              >
                <HiArrowRightOnRectangle className="w-3.5 h-3.5" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Not logged in ────────────────── */}
      {loaded && !user && (
        <div className="px-3 pb-4">
          <Link
            href="/auth/login"
            className="flex items-center justify-center w-full py-3 rounded-xl gradient-btn text-sm font-semibold
              shadow-lg shadow-jw-accent/10"
          >
            Join Now
          </Link>
        </div>
      )}
    </aside>
  );
}
