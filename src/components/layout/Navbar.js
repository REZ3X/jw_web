"use client";

/**
 * Navbar — top navigation bar.
 *
 * Displays:
 * - Logo + brand name
 * - Search bar (navigates to /explore)
 * - Nav links (Home, Explore, Chat)
 * - Auth: "Join Now" button or profile avatar dropdown
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, Menu, X, MessageSquare, Compass, Home,
  User, LogOut, LayoutDashboard, Settings, Shield,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { isGovRole, isDevRole } from "@/lib/auth";
import Avatar from "@/components/ui/Avatar";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";

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
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    useAuthStore.getState().clearUser();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    ...(user ? [{ href: "/chat", label: "AI Chat", icon: MessageSquare }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-jw-primary to-jw-secondary flex items-center justify-center shadow-lg shadow-jw-primary/20 group-hover:shadow-jw-primary/40 transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-jw-primary to-jw-secondary bg-clip-text text-transparent hidden sm:block">
              JogjaWaskita
            </span>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports, tags, locations…"
                className="w-full pl-10 pr-4 py-2 bg-surface-hover/60 border border-surface-border/50 rounded-xl text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-jw-primary/30 focus:border-jw-primary/50 transition-all"
              />
            </div>
          </form>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-jw-primary/10 text-jw-primary"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Auth actions */}
          <div className="flex items-center gap-3">
            {loaded && !user && (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-jw-primary to-jw-secondary text-white text-sm font-semibold shadow-md shadow-jw-primary/20 hover:shadow-jw-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                    className="cursor-pointer hover:ring-jw-primary/50 transition-all"
                  />
                }
              >
                <div className="px-4 py-2.5 border-b border-surface-border">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted truncate">@{user.username}</p>
                </div>
                <DropdownItem onClick={() => router.push(`/profile/${user.username}`)}>
                  <User className="w-4 h-4" /> Profile
                </DropdownItem>
                <DropdownItem onClick={() => router.push("/profile/settings")}>
                  <Settings className="w-4 h-4" /> Settings
                </DropdownItem>
                {(isGovRole(user.role) || isDevRole(user.role)) && (
                  <DropdownItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </DropdownItem>
                )}
                {isDevRole(user.role) && (
                  <DropdownItem onClick={() => router.push("/admin")}>
                    <Shield className="w-4 h-4" /> Admin Panel
                  </DropdownItem>
                )}
                <div className="border-t border-surface-border my-1" />
                <DropdownItem danger onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Log Out
                </DropdownItem>
              </Dropdown>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-muted hover:bg-surface-hover transition-colors cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-surface-border py-3 animate-slide-down">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports…"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-hover/60 border border-surface-border/50 rounded-xl text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-jw-primary/30"
                />
              </div>
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-jw-primary/10 text-jw-primary"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
