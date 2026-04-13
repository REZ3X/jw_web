"use client";

/**
 * Navbar — Dual navigation system.
 *
 * Desktop: Top bar with horizontal nav links + avatar dropdown.
 * Mobile:  Minimal top bar (logo only) + liquid glass floating bottom nav.
 *
 * Features:
 *  - Scroll-aware top bar (hides on scroll down, shows on scroll up)
 *  - Glassmorphism on mobile top bar
 *  - Bottom nav hidden on /chat/[id] pages
 *  - Both bars hide when overlay (lightbox/post modal) is active
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  HiMagnifyingGlass,
  HiHome, HiGlobeAlt, HiChatBubbleLeftRight,
  HiUser, HiArrowRightOnRectangle, HiSquares2X2,
  HiCog6Tooth, HiShieldCheck, HiVideoCamera,
  HiPlusCircle
} from "react-icons/hi2";
import { useAuthStore } from "@/lib/store";
import { isGovRole, isDevRole } from "@/lib/auth";
import Avatar from "@/components/ui/Avatar";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";
import { clientFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, loaded } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [navVisible, setNavVisible] = useState(true);
  const [overlayActive, setOverlayActive] = useState(false);
  const lastScrollY = useRef(0);

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  // Hide bottom nav on chat conversation pages (/chat/[id])
  const isChatConversation = /^\/chat\/[^/]+/.test(pathname);

  // Scroll-aware top navbar: hide on scroll down, show on scroll up (mobile only)
  useEffect(() => {
    const threshold = 10;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setNavVisible(true);
      } else if (currentY - lastScrollY.current > threshold) {
        setNavVisible(false);
      } else if (lastScrollY.current - currentY > threshold) {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for overlay open/close events (lightbox, post modal, create report)
  useEffect(() => {
    const handleOverlayOpen = () => setOverlayActive(true);
    const handleOverlayClose = () => setOverlayActive(false);
    window.addEventListener("jw:overlay-open", handleOverlayOpen);
    window.addEventListener("jw:overlay-close", handleOverlayClose);
    return () => {
      window.removeEventListener("jw:overlay-open", handleOverlayOpen);
      window.removeEventListener("jw:overlay-close", handleOverlayClose);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/explore?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    useAuthStore.getState().clearUser();
    router.push("/");
    router.refresh();
  };

  const handleResend = async () => {
    try {
      await clientFetch("/api/auth/resend-verification", { method: "POST" });
      toast.success("Verification email resent!");
    } catch (err) {
      toast.error(err.message || "Failed to resend email");
    }
  };

  /* ── Desktop nav links ─────────────────────────────────────────── */
  const desktopLinks = [
    { href: "/", label: "Home", icon: HiHome },
    { href: "/explore", label: "Explore", icon: HiGlobeAlt },
    { href: "/cctv", label: "CCTV Map", icon: HiVideoCamera },
    ...(user ? [{ href: "/chat", label: "AI Chat", icon: HiChatBubbleLeftRight }] : []),
  ];

  /* ── Mobile bottom nav items ───────────────────────────────────── */
  const mobileNavItems = [
    { href: "/", icon: HiHome, label: "Home" },
    { href: "/explore", icon: HiGlobeAlt, label: "Explore" },
    { href: "/cctv", icon: HiVideoCamera, label: "CCTV" },
    ...(user ? [{ href: "/chat", icon: HiChatBubbleLeftRight, label: "Chat" }] : []),
    ...(user
      ? [{ href: `/profile/${user.username}`, icon: HiUser, label: "Profile" }]
      : [{ href: "/auth/login", icon: HiUser, label: "Join" }]
    ),
  ];

  // Whether to hide the bars (overlay active or scroll-hidden)
  const hideTopBar = (!navVisible || overlayActive);
  const hideBottomBar = overlayActive || isChatConversation;

  return (
    <>
      {/* ═══ Verification Banner ═══ */}
      {loaded && user && !user.email_verified && (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 relative z-50">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-warning">
            <p>Please verify your email address. You won&apos;t be able to comment until you do.</p>
            <button
              onClick={handleResend}
              className="font-semibold hover:underline cursor-pointer whitespace-nowrap"
            >
              Resend Email
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
       *  TOP NAVBAR
       * ═══════════════════════════════════════════════════════════════ */}
      <header
        className={cn(
          /* Mobile: fixed + glassmorphism. Desktop: sticky + standard glass */
          "fixed top-0 left-0 right-0 lg:sticky z-40 border-b border-border-default",
          "lg:glass",
          /* Mobile glassmorphism */
          "max-lg:bg-jw-base/60 max-lg:backdrop-blur-2xl max-lg:backdrop-saturate-150",
          "transition-transform duration-300 ease-out will-change-transform",
          hideTopBar ? "lg:translate-y-0 -translate-y-full" : "translate-y-0"
        )}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src="/assets/green-logo.png"
                  alt="JogjaWaskita"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="text-base font-bold text-jw-mint">
                JogjaWaskita
              </span>
            </Link>

            {/* Search — desktop only */}
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-sm">
              <div className="relative group">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-jw-accent transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports…"
                  className="w-full pl-9 pr-4 py-2 bg-bg-input border border-border-default rounded-lg text-sm
                    text-text-primary placeholder:text-text-dim
                    focus:outline-none focus:ring-1 focus:ring-jw-accent/40 focus:border-jw-accent/40
                    transition-all duration-200"
                />
              </div>
            </form>

            {/* Nav links — desktop only */}
            <nav className="hidden md:flex items-center gap-0.5">
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150",
                    isActive(link.href)
                      ? "bg-jw-accent/12 text-jw-mint"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-card-hover"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: Auth — desktop only */}
            <div className="hidden md:flex items-center gap-2.5">
              {loaded && !user && (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg gradient-btn text-sm font-semibold"
                >
                  Join Now
                </Link>
              )}

              {loaded && user && (
                <Dropdown
                  trigger={
                    <Avatar
                      src={user.avatar_url}
                      name={user.name}
                      size="sm"
                      isGovernment={user.is_government}
                      className="cursor-pointer"
                    />
                  }
                >
                  <div className="px-3.5 py-2.5 border-b border-border-subtle">
                    <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-muted truncate">@{user.username}</p>
                  </div>
                  <DropdownItem onClick={() => router.push(`/profile/${user.username}`)}>
                    <HiUser className="w-4 h-4" /> Profile
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push("/profile/settings")}>
                    <HiCog6Tooth className="w-4 h-4" /> Settings
                  </DropdownItem>
                  {(isGovRole(user.role) || isDevRole(user.role)) && (
                    <DropdownItem onClick={() => router.push("/dashboard")}>
                      <HiSquares2X2 className="w-4 h-4" /> Dashboard
                    </DropdownItem>
                  )}
                  {isDevRole(user.role) && (
                    <DropdownItem onClick={() => router.push("/admin")}>
                      <HiShieldCheck className="w-4 h-4" /> Admin
                    </DropdownItem>
                  )}
                  <div className="border-t border-border-subtle my-0.5" />
                  <DropdownItem danger onClick={handleLogout}>
                    <HiArrowRightOnRectangle className="w-4 h-4" /> Log Out
                  </DropdownItem>
                </Dropdown>
              )}
            </div>

            {/* Mobile: Avatar → dropdown menu */}
            {loaded && user && (
              <div className="md:hidden">
                <Dropdown
                  trigger={
                    <Avatar
                      src={user.avatar_url}
                      name={user.name}
                      size="xs"
                      isGovernment={user.is_government}
                      className="cursor-pointer"
                    />
                  }
                >
                  <div className="px-3.5 py-2.5 border-b border-border-subtle">
                    <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-muted truncate">@{user.username}</p>
                  </div>
                  <DropdownItem onClick={() => router.push(`/profile/${user.username}`)}>
                    <HiUser className="w-4 h-4" /> Profile
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push("/profile/settings")}>
                    <HiCog6Tooth className="w-4 h-4" /> Settings
                  </DropdownItem>
                  <div className="border-t border-border-subtle my-0.5" />
                  <DropdownItem danger onClick={handleLogout}>
                    <HiArrowRightOnRectangle className="w-4 h-4" /> Log Out
                  </DropdownItem>
                </Dropdown>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed navbar on mobile/tablet */}
      <div className="h-14 lg:hidden" />

      {/* ═══════════════════════════════════════════════════════════════
       *  MOBILE — LIQUID GLASS FLOATING BOTTOM NAV
       * ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!hideBottomBar && (
          <motion.div
            key="bottom-nav"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none"
          >
            <nav
              className="relative overflow-hidden rounded-2xl px-2 py-1.5 pointer-events-auto
                flex items-center gap-0.5 w-full max-w-sm
            bg-jw-secondary/[0.15] backdrop-blur-xl
                border border-jw-accent/[0.15]
                shadow-[0_8px_40px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(176,228,204,0.08)]"
            >
              {/* Liquid glass refraction layers */}
              <div className="absolute inset-0 rounded-2xl
                bg-gradient-to-br from-jw-mint/[0.07] via-transparent to-jw-accent/[0.05]
                pointer-events-none" />
              <div className="absolute top-0 left-4 right-4 h-[1px]
                bg-gradient-to-r from-transparent via-jw-mint/20 to-transparent
                pointer-events-none" />
              <div className="absolute bottom-0 left-8 right-8 h-[0.5px]
                bg-gradient-to-r from-transparent via-jw-accent/10 to-transparent
                pointer-events-none" />

              {mobileNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-300",
                      active
                        ? "text-jw-mint"
                        : "text-text-secondary hover:text-jw-mint/80 active:scale-95"
                    )}
                  >
                    {/* Active glow background */}
                    {active && (
                      <motion.div
                        layoutId="mobileNavGlow"
                        className="absolute inset-0 rounded-xl bg-jw-accent/12
                          shadow-[0_0_20px_rgba(64,138,113,0.15),inset_0_0_8px_rgba(176,228,204,0.1)]"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative z-10">
                      <item.icon className={cn(
                        "w-5 h-5 transition-transform duration-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]",
                        active && "scale-110"
                      )} />
                    </div>

                    {/* Label */}
                    <span className={cn(
                      "relative z-10 text-[9px] font-semibold tracking-wide transition-colors duration-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]",
                      active ? "text-jw-mint" : "text-text-secondary"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
