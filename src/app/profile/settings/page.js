"use client";

/**
 * Profile Settings — X/Twitter-style settings page.
 * Edit avatar, bio, name, and birthday.
 */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiCamera, HiTrash, HiCheck, HiArrowLeft } from "react-icons/hi2";
import { motion } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import TrendingSidebar from "@/components/layout/TrendingSidebar";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import toast from "react-hot-toast";

export default function ProfileSettings() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const fileRef = useRef(null);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [birth, setBirth] = useState(user?.birth || "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  /** Save profile changes */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {};
      if (name.trim() && name !== user.name) body.name = name.trim();
      if (bio !== (user.bio || "")) body.bio = bio;
      if (birth && birth !== user.birth) body.birth = birth;

      if (Object.keys(body).length === 0) {
        toast("Nggak ada perubahan yang disimpen");
        setSaving(false);
        return;
      }

      const res = await clientFetch("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setUser(res.data);
      toast.success("Profil diupdate!");
    } catch (err) {
      toast.error(err.message || "Gagal ngupdate profil");
    }
    setSaving(false);
  };

  /** Upload custom avatar */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await clientFetch("/api/users/me/avatar", {
        method: "POST",
        body: formData,
        headers: {},
      });
      setUser({ ...user, avatar_url: res.data?.avatar_url || user.avatar_url, use_custom_avatar: true });
      toast.success("Avatar diupdate!");
    } catch (err) {
      toast.error(err.message || "Gagal aplod avatar");
    }
    setUploadingAvatar(false);
  };

  /** Revert to Google avatar */
  const handleRevertAvatar = async () => {
    try {
      await clientFetch("/api/users/me/avatar", { method: "DELETE" });
      setUser({ ...user, use_custom_avatar: false });
      toast.success("Balik pake avatar Google");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="feed-layout">
      {/* ═══ Main column ═══ */}
      <div className="feed-column">

        {/* ─── Sticky header ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4 sticky top-0 z-20 py-2 -mt-2
            bg-bg-default/80 backdrop-blur-lg"
        >
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-all cursor-pointer"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-text-primary">Edit profil</h1>
        </motion.div>

        {/* ─── Settings card ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
        >
          {/* Cover area with avatar */}
          <div className="relative h-24 sm:h-28">
            <div className="absolute inset-0 bg-gradient-to-br from-jw-accent/25 via-jw-secondary/40 to-jw-accent/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card/60 to-transparent" />
          </div>

          <div className="px-4 sm:px-5 pb-5">
            {/* Avatar + upload */}
            <div className="flex items-end gap-4 -mt-10 mb-5">
              <div className="relative group">
                <Avatar
                  src={user.avatar_url}
                  name={user.name}
                  size="2xl"
                  className="ring-4 ring-bg-card"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100
                    flex items-center justify-center transition-opacity duration-200 cursor-pointer"
                >
                  <HiCamera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="flex gap-2 mb-1">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border-default
                    text-text-primary hover:bg-bg-card-hover hover:border-border-accent/40
                    transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <HiCamera className="w-3.5 h-3.5" />
                  {uploadingAvatar ? "Upload..." : "Upload"}
                </button>
                {user.use_custom_avatar && (
                  <button
                    onClick={handleRevertAvatar}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border-default
                      text-text-muted hover:text-danger hover:border-danger/30
                      transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <HiTrash className="w-3.5 h-3.5" /> Batalin Custom
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-[11px] font-bold text-text-dim uppercase tracking-wider mb-1.5">
                  Nama Tampilan
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-inset border border-border-default rounded-xl text-sm
                    text-text-primary placeholder:text-text-dim
                    focus:outline-none focus:ring-2 focus:ring-jw-accent/30 focus:border-jw-accent/40
                    transition-all duration-200"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[11px] font-bold text-text-dim uppercase tracking-wider mb-1.5">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritain diri kamu ke warga..."
                  className="w-full px-4 py-2.5 bg-bg-inset border border-border-default rounded-xl text-sm
                    text-text-primary placeholder:text-text-dim resize-none
                    focus:outline-none focus:ring-2 focus:ring-jw-accent/30 focus:border-jw-accent/40
                    transition-all duration-200"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-[10px] text-text-dim text-right mt-1">{bio.length}/300</p>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-[11px] font-bold text-text-dim uppercase tracking-wider mb-1.5">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-inset border border-border-default rounded-xl text-sm
                    text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-jw-accent/30 focus:border-jw-accent/40
                    transition-all duration-200"
                />
              </div>

              {/* Read-only info */}
              <div className="border-t border-border-subtle pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-text-dim uppercase tracking-wider mb-1">Username</p>
                    <p className="text-sm text-text-muted">@{user.username}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-text-dim uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm text-text-muted truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end pt-2">
                <Button type="submit" loading={saving}>
                  <HiCheck className="w-4 h-4" /> Simpen Perubahan
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* ═══ Right Sidebar (xl+ only) ═══ */}
      <aside className="hidden xl:flex flex-col w-[300px] shrink-0 sticky top-[72px] self-start space-y-4 lg:top-5">
        <TrendingSidebar />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="px-1"
        >
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-dim">
            <Link href="/" className="hover:text-text-muted transition-colors">Beranda</Link>
            <Link href="/explore" className="hover:text-text-muted transition-colors">Explore</Link>
            <Link href="/chat" className="hover:text-text-muted transition-colors">Tanya AI</Link>
          </div>
          <p className="text-[10px] text-text-dim/60 mt-2">
            © 2026 JogjaWaskita. Hak Cipta Dilindungi.
          </p>
        </motion.div>
      </aside>
    </div>
  );
}
