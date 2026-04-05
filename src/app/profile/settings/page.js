"use client";

/**
 * Profile Settings — edit avatar, bio, and birthday.
 */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2, Save, ArrowLeft } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
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
        toast("No changes to save");
        setSaving(false);
        return;
      }

      const res = await clientFetch("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setUser(res.data);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
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
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err.message || "Failed to upload avatar");
    }
    setUploadingAvatar(false);
  };

  /** Revert to Google avatar */
  const handleRevertAvatar = async () => {
    try {
      await clientFetch("/api/users/me/avatar", { method: "DELETE" });
      setUser({ ...user, use_custom_avatar: false });
      toast.success("Reverted to Google avatar");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-surface border border-surface-border rounded-2xl p-6 space-y-6">
        {/* Avatar section */}
        <div className="flex items-center gap-4">
          <Avatar src={user.avatar_url} name={user.name} size="xl" />
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                loading={uploadingAvatar}
              >
                <Camera className="w-3.5 h-3.5" /> Upload
              </Button>
              {user.use_custom_avatar && (
                <Button size="sm" variant="ghost" onClick={handleRevertAvatar}>
                  <Trash2 className="w-3.5 h-3.5" /> Revert
                </Button>
              )}
            </div>
            <p className="text-xs text-muted">JPG, PNG. Max 5MB.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>

        <hr className="border-surface-border" />

        {/* Profile form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-hover/50 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-jw-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself…"
              className="w-full px-4 py-2.5 bg-surface-hover/50 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-jw-primary/30 resize-none"
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-muted-light text-right">{bio.length}/300</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Birthday</label>
            <input
              type="date"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-hover/50 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-jw-primary/30"
            />
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted">Username</label>
              <p className="text-sm text-muted-light">@{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted">Email</label>
              <p className="text-sm text-muted-light">{user.email}</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
