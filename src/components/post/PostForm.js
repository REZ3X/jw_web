"use client";

/**
 * PostForm — X/Twitter-style compose form.
 *
 * Features:
 * - Borderless textarea with live character count ring
 * - Drag & drop image upload with animated grid
 * - Inline toolbar (photo, location, privacy)
 * - Department selector with AI classification
 * - Smooth transitions & micro-interactions
 */

import { useState, useRef, useCallback } from "react";
import {
  HiPhoto, HiXMark, HiMapPin, HiSparkles,
  HiLockClosed, HiGlobeAlt, HiPaperAirplane
} from "react-icons/hi2";
import { ImSpinner8 } from "react-icons/im";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { clientFetch } from "@/lib/api";
import { DEPARTMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const MAX_CHARS = 2000;
const MAX_IMAGES = 4;

export default function PostForm({ onClose, onCreated }) {
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Character count progress (0-1)
  const charProgress = caption.length / MAX_CHARS;
  const isNearLimit = charProgress > 0.8;
  const isOverLimit = charProgress > 0.95;

  /** Handle file selection (max 4) */
  const handleFiles = useCallback((files) => {
    const newFiles = Array.from(files).slice(0, MAX_IMAGES - images.length);
    if (newFiles.length === 0) return;

    setImages((prev) => [...prev, ...newFiles]);
    for (const file of newFiles) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    }
  }, [images.length]);

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  /** Drag & drop */
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  /** AI-classify department from caption */
  const classifyDepartment = async () => {
    if (!caption.trim()) {
      toast.error("Write a description first so AI can classify");
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
    if (!caption.trim()) { toast.error("Description is required"); return; }
    if (images.length === 0) { toast.error("At least one photo is required"); return; }
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

      onCreated?.(res.data);
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Failed to submit report");
    }
    setSubmitting(false);
  };

  const canSubmit = caption.trim() && images.length > 0 && department && !submitting;

  return (
    <form
      onSubmit={handleSubmit}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 rounded-xl border-2 border-dashed border-jw-accent bg-jw-accent/5
              flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <HiPhoto className="w-8 h-8 text-jw-accent mx-auto mb-2" />
              <p className="text-sm font-semibold text-jw-mint">Drop photos here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Compose area ── */}
      <div className="mb-3">
        <textarea
          ref={textareaRef}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's happening in your community? Describe the issue…"
          className="w-full min-h-[100px] p-0 bg-transparent border-none text-[15px]
            placeholder:text-text-dim text-text-primary leading-relaxed
            focus:outline-none resize-none"
          maxLength={MAX_CHARS}
          autoFocus
        />
      </div>

      {/* ── Image previews ── */}
      <AnimatePresence mode="popLayout">
        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className={cn(
              "grid gap-1.5 rounded-xl overflow-hidden",
              previews.length === 1 && "grid-cols-1",
              previews.length === 2 && "grid-cols-2",
              previews.length >= 3 && "grid-cols-2",
            )}>
              {previews.map((src, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "relative overflow-hidden bg-bg-inset rounded-xl group",
                    previews.length === 1 && "aspect-video",
                    previews.length === 2 && "aspect-[4/3]",
                    previews.length === 3 && idx === 0 && "row-span-2 aspect-auto h-full",
                    previews.length === 3 && idx > 0 && "aspect-[4/3]",
                    previews.length === 4 && "aspect-square",
                  )}
                >
                  <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-white
                      hover:bg-black/80 transition-all duration-150 cursor-pointer
                      opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                  >
                    <HiXMark className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Location input (expandable) ── */}
      <AnimatePresence>
        {showLocation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="relative">
              <HiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location (e.g., Jl. Malioboro)"
                className="w-full pl-9 pr-3 py-2 bg-bg-inset border border-border-default rounded-xl text-sm
                  text-text-primary placeholder:text-text-dim
                  focus:outline-none focus:ring-1 focus:ring-jw-accent/30 focus:border-jw-accent/40
                  transition-all duration-200"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Department selector ── */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-text-dim uppercase tracking-wider">Department</p>
          <button
            type="button"
            onClick={classifyDepartment}
            disabled={classifying}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-jw-accent hover:text-jw-mint transition-colors disabled:opacity-50 cursor-pointer"
          >
            {classifying ? <ImSpinner8 className="w-3 h-3 animate-spin" /> : <HiSparkles className="w-3 h-3" />}
            Auto-detect (AI)
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {Object.entries(DEPARTMENTS).map(([key, d]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDepartment(key)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs text-left transition-all duration-150 cursor-pointer font-medium",
                department === key
                  ? "border-jw-accent/40 bg-jw-accent/10 text-jw-mint ring-1 ring-jw-accent/20"
                  : "border-border-default hover:border-jw-accent/25 hover:bg-bg-card-hover text-text-muted"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", d.dotColor)} />
              {d.short}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom toolbar ── */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        {/* Left: action icons */}
        <div className="flex items-center gap-0.5">
          {/* Photo button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES}
            className={cn(
              "p-2 rounded-xl transition-all duration-150 cursor-pointer",
              images.length >= MAX_IMAGES
                ? "text-text-dim opacity-40 cursor-not-allowed"
                : "text-jw-accent hover:bg-jw-accent/8"
            )}
            title={`Add photos (${images.length}/${MAX_IMAGES})`}
          >
            <HiPhoto className="w-5 h-5" />
          </button>

          {/* Location toggle */}
          <button
            type="button"
            onClick={() => setShowLocation(!showLocation)}
            className={cn(
              "p-2 rounded-xl transition-all duration-150 cursor-pointer",
              showLocation
                ? "text-jw-accent bg-jw-accent/8"
                : "text-jw-accent hover:bg-jw-accent/8"
            )}
            title="Add location"
          >
            <HiMapPin className="w-5 h-5" />
          </button>

          {/* Privacy toggle */}
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={cn(
              "p-2 rounded-xl transition-all duration-150 cursor-pointer flex items-center gap-1.5",
              isPrivate
                ? "text-amber-400 bg-amber-400/8"
                : "text-jw-accent hover:bg-jw-accent/8"
            )}
            title={isPrivate ? "Private report" : "Public report"}
          >
            {isPrivate ? (
              <HiLockClosed className="w-5 h-5" />
            ) : (
              <HiGlobeAlt className="w-5 h-5" />
            )}
            <span className="text-[11px] font-semibold hidden sm:inline">
              {isPrivate ? "Private" : "Public"}
            </span>
          </button>

          {/* Character count indicator */}
          {caption.length > 0 && (
            <div className="ml-2 flex items-center gap-2">
              <div className="relative w-5 h-5">
                <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90">
                  <circle
                    cx="10" cy="10" r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-border-default"
                  />
                  <circle
                    cx="10" cy="10" r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${charProgress * 50.27} 50.27`}
                    className={cn(
                      "transition-all duration-300",
                      isOverLimit ? "text-danger" : isNearLimit ? "text-amber-400" : "text-jw-accent"
                    )}
                  />
                </svg>
              </div>
              {isNearLimit && (
                <span className={cn(
                  "text-[11px] font-semibold tabular-nums",
                  isOverLimit ? "text-danger" : "text-amber-400"
                )}>
                  {MAX_CHARS - caption.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer",
            canSubmit
              ? "gradient-btn shadow-md shadow-jw-accent/15 hover:shadow-jw-accent/25"
              : "bg-jw-accent/20 text-jw-mint/40 cursor-not-allowed"
          )}
        >
          {submitting ? (
            <ImSpinner8 className="w-4 h-4 animate-spin" />
          ) : (
            <HiPaperAirplane className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{submitting ? "Submitting…" : "Submit"}</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </form>
  );
}
