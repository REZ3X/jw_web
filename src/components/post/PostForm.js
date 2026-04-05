"use client";

/**
 * PostForm — create a new post/report.
 *
 * Features:
 * - Caption textarea with #tag highlighting
 * - Image upload (drag & drop, max 4)
 * - Location input (manual)
 * - Department selector with "Choose for me" AI classification
 * - Private toggle
 */

import { useState, useRef } from "react";
import {
  ImagePlus, X, MapPin, Sparkles, Lock, Globe, Send, Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { clientFetch } from "@/lib/api";
import { DEPARTMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function PostForm({ onClose, onCreated }) {
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const fileInputRef = useRef(null);

  /** Handle file selection (max 4) */
  const handleFiles = (files) => {
    const newFiles = Array.from(files).slice(0, 4 - images.length);
    if (newFiles.length === 0) return;

    setImages((prev) => [...prev, ...newFiles]);
    for (const file of newFiles) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  /** AI-classify department from caption */
  const classifyDepartment = async () => {
    if (!caption.trim()) {
      toast.error("Write a caption first so AI can classify");
      return;
    }
    setClassifying(true);
    try {
      const res = await clientFetch("/api/posts/classify/classify", {
        method: "POST",
        body: JSON.stringify({ caption }),
      });
      if (res?.data?.department) {
        setDepartment(res.data.department);
        toast.success(`AI suggests: ${DEPARTMENTS[res.data.department]?.label || res.data.department}`);
      }
    } catch (err) {
      toast.error("AI classification failed. Please select manually.");
    }
    setClassifying(false);
  };

  /** Submit post */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim()) { toast.error("Caption is required"); return; }
    if (images.length === 0) { toast.error("At least one image is required"); return; }
    if (!department) { toast.error("Please choose a department"); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("caption", caption);
      if (location.trim()) formData.append("location", location);
      formData.append("department", department);
      formData.append("is_private", isPrivate ? "true" : "false");
      for (const img of images) {
        formData.append("media", img);
      }

      const res = await clientFetch("/api/posts", {
        method: "POST",
        body: formData,
        headers: {},
      });

      toast.success("Report submitted!");
      onCreated?.(res.data);
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Failed to submit report");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Caption */}
      <div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's the issue? Describe the problem… Use #tags for categorization"
          className="w-full min-h-[120px] p-4 bg-surface-hover/50 border border-surface-border rounded-xl text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-jw-primary/30 resize-none"
          maxLength={2000}
        />
        <p className="text-xs text-muted-light text-right mt-1">{caption.length}/2000</p>
      </div>

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {previews.map((src, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-surface-hover">
              <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add images button */}
      {images.length < 4 && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-surface-border rounded-xl text-sm text-muted hover:border-jw-primary hover:text-jw-primary transition-colors w-full justify-center cursor-pointer"
        >
          <ImagePlus className="w-5 h-5" />
          Add Photos ({images.length}/4)
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Location */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (e.g., Jl. Malioboro, Yogyakarta)"
          className="w-full pl-10 pr-4 py-2.5 bg-surface-hover/50 border border-surface-border rounded-xl text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-jw-primary/30"
        />
      </div>

      {/* Department selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Report to Department</label>
          <button
            type="button"
            onClick={classifyDepartment}
            disabled={classifying}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-jw-secondary hover:text-jw-secondary-light transition-colors disabled:opacity-50 cursor-pointer"
          >
            {classifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Choose for me (AI)
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(DEPARTMENTS).map(([key, d]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDepartment(key)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all cursor-pointer",
                department === key
                  ? "border-jw-primary bg-jw-primary/10 text-jw-primary ring-1 ring-jw-primary/30"
                  : "border-surface-border hover:border-jw-primary/30 hover:bg-surface-hover"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", d.dotColor)} />
              <span className="font-medium">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy toggle */}
      <button
        type="button"
        onClick={() => setIsPrivate(!isPrivate)}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
      >
        {isPrivate ? (
          <>
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Private — only you and the department can see this</span>
          </>
        ) : (
          <>
            <Globe className="w-4 h-4 text-jw-primary" />
            <span>Public — visible to everyone</span>
          </>
        )}
      </button>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-border">
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        )}
        <Button type="submit" loading={submitting}>
          <Send className="w-4 h-4" /> Submit Report
        </Button>
      </div>
    </form>
  );
}
