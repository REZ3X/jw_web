"use client";

/**
 * Navbar — top navigation with glass effect.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  HiMagnifyingGlass, HiBars3, HiXMark,
  HiHome, HiGlobeAlt, HiChatBubbleLeftRight,
  HiUser, HiArrowRightOnRectangle, HiSquares2X2,
  HiCog6Tooth, HiShieldCheck
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/explore?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMobileOpen(false);
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

  const navLinks = [
    { href: "/", label: "Home", icon: HiHome },
    { href: "/explore", label: "Explore", icon: HiGlobeAlt },
    ...(user ? [{ href: "/chat", label: "AI Chat", icon: HiChatBubbleLeftRight }] : []),
  ];

  return (
    <>
      {/* Verification Banner */}
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

      <header className="sticky top-0 z-40 glass border-b border-border-default">
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
              <span className="text-base font-bold text-jw-mint hidden sm:block">
                JogjaWaskita
              </span>
            </Link>

            {/* Search — desktop */}
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

            {/* Nav links — desktop */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
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

            {/* Right: Auth */}
            <div className="flex items-center gap-2.5">
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

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-1.5 rounded-lg text-text-muted hover:bg-bg-card-hover transition-colors cursor-pointer"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <HiXMark className="w-5 h-5" /> : <HiBars3 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-border-default overflow-hidden"
              >
                <div className="py-3 space-y-1">
                  <form onSubmit={handleSearch} className="mb-3">
                    <div className="relative">
                      <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search…"
                        className="w-full pl-9 pr-4 py-2 bg-bg-input border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-jw-accent/40"
                      />
                    </div>
                  </form>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-jw-accent/12 text-jw-mint"
                          : "text-text-muted hover:text-text-primary hover:bg-bg-card-hover"
                      )}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  ))}
                  {loaded && !user && (
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 mx-1 mt-2 px-4 py-2 rounded-lg gradient-btn text-sm font-semibold"
                    >
                      Join Now
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
