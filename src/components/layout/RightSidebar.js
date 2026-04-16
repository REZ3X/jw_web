"use client";

/**
 * RightSidebar — HomeFeed right sidebar with useful social widgets.
 *
 * Contains:
 *  - Search bar (duplicate of navbar search for quick access)
 *  - Trending Topics (compact)
 *  - Who to Follow / Active Users
 *  - Platform footer links
 *
 * Only visible on xl+ screens. Sticky sidebar.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiArrowTrendingUp, HiHashtag, HiArrowRight,
  HiMagnifyingGlass, HiUserPlus, HiSparkles,
  HiInformationCircle, HiShieldCheck, HiBookOpen,
  HiGlobeAlt
} from "react-icons/hi2";
import { motion } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import { clientFetch } from "@/lib/api";
import { formatCount, cn, getRole } from "@/lib/utils";

function SidebarSection({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
    >
      {title && (
        <div className="px-4 py-3 border-b border-border-subtle">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
            {Icon && <Icon className="w-3.5 h-3.5 text-jw-accent" />}
            {title}
          </h3>
        </div>
      )}
      {children}
    </motion.div>
  );
}

function SearchWidget() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/explore?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSearch}
      className="relative group"
    >
      <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-jw-accent transition-colors" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari laporan..."
        className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border-default rounded-xl text-sm
          text-text-primary placeholder:text-text-dim
          focus:outline-none focus:ring-2 focus:ring-jw-accent/30 focus:border-jw-accent/40
          transition-all duration-200"
      />
    </motion.form>
  );
}

function TrendingWidget() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientFetch("/api/analytics/trending-tags")
      .then((res) => setTags(res?.data?.trending_tags || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-bg-card border border-border-default animate-shimmer h-48" />
    );
  }

  if (tags.length === 0) return null;

  return (
    <SidebarSection title="Trending" icon={HiArrowTrendingUp} delay={0.1}>
      <div className="divide-y divide-border-subtle">
        {tags.slice(0, 5).map((tag, idx) => (
          <Link
            key={tag.tag}
            href={`/explore?tag=${encodeURIComponent(tag.tag)}`}
            className="flex items-center justify-between px-4 py-2.5
              hover:bg-bg-card-hover transition-colors duration-150 group"
          >
            <div className="min-w-0">
              <p className="text-[10px] text-text-dim font-medium uppercase tracking-wider">
                #{idx + 1} Trending
              </p>
              <p className="text-sm font-semibold text-text-primary group-hover:text-jw-mint transition-colors truncate">
                <HiHashtag className="w-3 h-3 text-jw-accent inline mr-0.5" />
                {tag.tag}
              </p>
            </div>
            <span className="text-[11px] text-text-dim tabular-nums shrink-0 ml-3">
              {formatCount(tag.count)} laporan
            </span>
          </Link>
        ))}
      </div>
      <Link
        href="/explore"
        className="flex items-center justify-center gap-1 px-4 py-2.5
          text-xs font-semibold text-jw-accent hover:text-jw-mint
          border-t border-border-subtle transition-colors"
      >
        Lihat semua <HiArrowRight className="w-3 h-3" />
      </Link>
    </SidebarSection>
  );
}

function ActiveUsersWidget() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientFetch("/api/users/search?q=a&limit=10&sort=recent")
      .then((res) => {
        const data = res?.data || [];
        const basicUsers = data.filter((u) => !u.is_government);
        setUsers(basicUsers.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-bg-card border border-border-default animate-shimmer h-44" />
    );
  }

  if (users.length === 0) return null;

  return (
    <SidebarSection title="Warga Aktif" icon={HiSparkles} delay={0.2}>
      <div className="divide-y divide-border-subtle">
        {users.map((u) => {
          const role = getRole(u.role);
          return (
            <Link
              key={u.id}
              href={`/profile/${u.username}`}
              className="flex items-center gap-2.5 px-4 py-2.5
                hover:bg-bg-card-hover transition-colors duration-150 group"
            >
              <Avatar src={u.avatar_url} name={u.name} size="sm" isGovernment={u.is_government} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold text-text-primary group-hover:text-jw-mint transition-colors truncate">
                    {u.name}
                  </p>
                  {u.is_government && (
                    <HiShieldCheck className="w-3 h-3 text-jw-accent shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-text-dim truncate">@{u.username}</p>
              </div>
              <HiUserPlus className="w-4 h-4 text-text-dim group-hover:text-jw-accent transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>
      <Link
        href="/explore?tab=users"
        className="flex items-center justify-center gap-1 px-4 py-2.5
          text-xs font-semibold text-jw-accent hover:text-jw-mint
          border-t border-border-subtle transition-colors"
      >
        Cari warga lain <HiArrowRight className="w-3 h-3" />
      </Link>
    </SidebarSection>
  );
}

function SuggestedGovWidget() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientFetch("/api/users/search?q=yogya&limit=10")
      .then((res) => {
        const data = res?.data || [];
        const govUsers = data.filter((u) => u.is_government);
        const shuffled = govUsers.sort(() => 0.5 - Math.random());
        setUsers(shuffled);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-bg-card border border-border-default animate-shimmer h-44" />
    );
  }

  if (users.length === 0) return null;

  return (
    <SidebarSection title="Akun Pemerintah" icon={HiShieldCheck} delay={0.15}>
      <div className="divide-y divide-border-subtle">
        {users.map((u) => {
          return (
            <Link
              key={u.id}
              href={`/profile/${u.username}`}
              className="flex items-center gap-2.5 px-4 py-2.5
                hover:bg-bg-card-hover transition-colors duration-150 group"
            >
              <Avatar src={u.avatar_url} name={u.name} size="sm" isGovernment={u.is_government} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold text-text-primary group-hover:text-jw-mint transition-colors truncate">
                    {u.name}
                  </p>
                  {u.is_government && (
                    <HiShieldCheck className="w-3 h-3 text-jw-accent shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-text-dim truncate">@{u.username}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </SidebarSection>
  );
}

function FooterLinks() {
  const links = [
    { href: "/explore", label: "Explore" },
    { href: "/chat", label: "Tanya AI" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="px-1"
    >
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-dim">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-text-muted transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="text-[10px] text-text-dim/60 mt-2">
        © 2026 JogjaWaskita. Hak Cipta Dilindungi.
      </p>
    </motion.div>
  );
}

export default function RightSidebar() {
  return (
    <aside className="hidden xl:flex flex-col w-[300px] shrink-0 sticky top-[72px] self-start space-y-4 py-0">
      <SearchWidget />
      <TrendingWidget />
      <SuggestedGovWidget />
      <ActiveUsersWidget />
      <FooterLinks />
    </aside>
  );
}
