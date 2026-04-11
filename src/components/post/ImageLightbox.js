"use client";

/**
 * ImageLightbox — Premium fullscreen image viewer (X/Twitter-inspired).
 *
 * Desktop (lg+):
 *  ┌──────────┬──────────────────────────────┬──────────────────┐
 *  │LeftSidebar│   Image Viewer (center)     │  Post Detail     │
 *  │ (behind)  │   ─ slide / drag-to-dismiss │  ─ Author info   │
 *  │           │   ─ zoom / thumbnails       │  ─ Caption       │
 *  │           │   ─ nav arrows              │  ─ Engagement    │
 *  │           │                             │  ─ Comments      │
 *  └──────────┴──────────────────────────────┴──────────────────┘
 *
 * Mobile:
 *  Full-screen overlay with gesture controls.
 *
 * Features:
 *  ─ Smooth framer-motion open/close/slide animations
 *  ─ Drag-to-dismiss (vertical swipe closes lightbox)
 *  ─ Zoom toggle on double-tap / click
 *  ─ Thumbnail strip for multi-image galleries
 *  ─ Glassmorphism control bar
 *  ─ Keyboard navigation (← → Esc)
 *  ─ Right-side post panel on desktop (X/Twitter-style)
 *  ─ Respects LeftSidebar on lg+ screens
 *  ─ Fully responsive & touch-friendly
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiXMark,
  HiChevronLeft,
  HiChevronRight,
  HiMagnifyingGlassPlus,
  HiMagnifyingGlassMinus,
  HiArrowsPointingOut,
  HiMapPin,
  HiChatBubbleOvalLeft,
  HiArrowUpTray,
  HiLockClosed,
} from "react-icons/hi2";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import VoteButtons from "@/components/post/VoteButtons";
import { timeAgo, parseCaption, getDepartment, getStatus, cn, formatCount } from "@/lib/utils";
import { GOV_ROLES } from "@/lib/constants";
import toast from "react-hot-toast";

/* ── Animation variants ─────────────────────────────────────────── */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

const imageVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.25, ease: "easeIn" },
  }),
};

const controlBarVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { delay: 0.15, duration: 0.3, ease: "easeOut" } },
  exit: { y: 40, opacity: 0, transition: { duration: 0.15 } },
};

const thumbnailVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.3, ease: "easeOut" } },
  exit: { y: 24, opacity: 0, transition: { duration: 0.15 } },
};

const panelVariants = {
  hidden: { x: 80, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { delay: 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { x: 80, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

/* ── Post Detail Panel (Desktop right-side) ─────────────────────── */

function PostPanel({ post }) {
  if (!post) return null;

  const dept = getDepartment(post.department);
  const status = getStatus(post.status);
  const caption = parseCaption(post.caption);
  const isGov = GOV_ROLES.includes(post.user_role);
  const fullDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard?.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <motion.aside
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="hidden lg:flex flex-col w-[380px] xl:w-[420px] shrink-0 h-full
        border-l border-border-default bg-bg-primary/95 backdrop-blur-xl overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">

          {/* ── Author header ── */}
          <div className="flex items-start gap-3 mb-4">
            <Link href={`/profile/${post.username}`} className="shrink-0">
              <Avatar
                src={post.user_avatar}
                name={post.user_name}
                size="md"
                isGovernment={isGov}
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/profile/${post.username}`}
                  className="text-sm font-bold text-text-primary hover:text-jw-mint transition-colors"
                >
                  {post.user_name}
                </Link>
                {isGov && (
                  <Badge className="bg-jw-accent/15 text-jw-mint border border-jw-accent/30 text-[10px]">
                    Official
                  </Badge>
                )}
                {post.is_private && <HiLockClosed className="w-3 h-3 text-text-dim" />}
              </div>
              <p className="text-xs text-text-muted">@{post.username}</p>
            </div>
            <Badge className={status.color} dot={status.dotColor}>{status.label}</Badge>
          </div>

          {/* ── Caption ── */}
          <div className="mb-4">
            <p className="text-[15px] leading-[1.65] whitespace-pre-wrap text-text-primary/90">
              {caption.map((seg, i) =>
                seg.type === "tag" ? (
                  <Link key={i} href={`/explore?tag=${seg.value}`} className="tag-link">
                    #{seg.value}
                  </Link>
                ) : (
                  <span key={i}>{seg.value}</span>
                )
              )}
            </p>
          </div>

          {/* ── Tags ── */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/explore?tag=${tag}`}
                  className="text-xs px-2 py-0.5 rounded-md bg-jw-accent/8 text-jw-accent
                    hover:bg-jw-accent/15 transition-colors border border-jw-accent/15 font-medium"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* ── Timestamp + Location + Department ── */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-dim
            pb-3 border-b border-border-subtle">
            <time>{fullDate}</time>
            {post.location && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <HiMapPin className="w-3 h-3 text-jw-accent/70" /> {post.location}
                </span>
              </>
            )}
            <span>·</span>
            <Badge className={dept.color}>{dept.label}</Badge>
          </div>

          {/* ── Engagement stats ── */}
          <div className="flex items-center gap-4 py-3 border-b border-border-subtle text-xs">
            <div className="flex items-center gap-1">
              <span className="font-bold text-text-primary tabular-nums">{formatCount(post.upvote_count || 0)}</span>
              <span className="text-text-dim">Upvotes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-text-primary tabular-nums">{formatCount(post.downvote_count || 0)}</span>
              <span className="text-text-dim">Downvotes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-text-primary tabular-nums">{formatCount(post.comment_count || 0)}</span>
              <span className="text-text-dim">Comments</span>
            </div>
          </div>

          {/* ── Action bar ── */}
          <div className="flex items-center justify-around py-2 border-b border-border-subtle">
            <VoteButtons
              type="post"
              id={post.id}
              upvotes={post.upvote_count}
              downvotes={post.downvote_count}
              myVote={post.my_vote}
            />
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                text-text-muted hover:text-jw-accent hover:bg-jw-accent/5
                transition-all duration-200 text-xs font-medium"
            >
              <HiChatBubbleOvalLeft className="w-4 h-4" />
              <span>Comment</span>
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                text-text-muted hover:text-jw-accent hover:bg-jw-accent/5
                transition-all duration-200 text-xs font-medium cursor-pointer"
            >
              <HiArrowUpTray className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* ── View full post link ── */}
          <div className="pt-4 pb-2">
            <Link
              href={`/post/${post.id}`}
              className="flex items-center justify-center w-full py-2.5 rounded-xl
                border border-border-default text-sm font-semibold text-text-muted
                hover:text-jw-accent hover:border-jw-accent/30 hover:bg-jw-accent/5
                transition-all duration-200"
            >
              View full post & comments
            </Link>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

/* ── Main Lightbox Component ────────────────────────────────────── */

export default function ImageLightbox({ images, initialIndex = 0, onClose, post }) {
  const [idx, setIdx] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  /* drag-to-dismiss */
  const dragY = useMotionValue(0);
  const bgOpacity = useTransform(dragY, [-200, 0, 200], [0.3, 1, 0.3]);

  const multi = images.length > 1;
  const hasPostPanel = !!post;

  /* -- Navigation -- */
  const paginate = useCallback(
    (newDir) => {
      if (zoomed) return;
      setDirection(newDir);
      setIdx((i) => (i + newDir + images.length) % images.length);
    },
    [images.length, zoomed]
  );

  const goTo = useCallback(
    (target) => {
      setDirection(target > idx ? 1 : -1);
      setIdx(target);
      setZoomed(false);
    },
    [idx]
  );

  /* -- Keyboard -- */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, paginate]);

  /* -- Auto-hide controls -- */
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
    controlTimeoutRef.current = setTimeout(() => setControlsVisible(false), 3500);
  }, []);

  useEffect(() => {
    showControls();
    return () => {
      if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
    };
  }, [idx, showControls]);

  /* -- Drag end -- */
  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.y) > 100 || Math.abs(info.velocity.y) > 500) {
      onClose();
    }
  };

  /* -- Double-click zoom -- */
  const handleDoubleClick = () => {
    setZoomed((z) => !z);
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        /* On lg+ (when LeftSidebar is visible): offset left by 240px */
        className="fixed inset-0 lg:left-[240px] z-[60] flex select-none"
        onMouseMove={showControls}
        onTouchStart={showControls}
      >
        {/* ═══ Image Viewer Area ═══ */}
        <div className="flex-1 flex flex-col relative min-w-0">

          {/* ── Backdrop ── */}
          <motion.div
            className="absolute inset-0 bg-jw-base/97 backdrop-blur-xl"
            style={{ opacity: bgOpacity }}
            onClick={() => !zoomed && onClose()}
          />

          {/* ── Top bar ── */}
          <AnimatePresence>
            {controlsVisible && (
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { duration: 0.25 } }}
                exit={{ y: -30, opacity: 0, transition: { duration: 0.15 } }}
                className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between
                  px-4 sm:px-6 py-3 sm:py-4"
              >
                {/* Close button (left side on desktop for balance) */}
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full glass border border-white/8
                    text-white/80 hover:text-white hover:bg-white/15
                    transition-all duration-200 cursor-pointer shadow-lg
                    active:scale-90"
                >
                  <HiXMark className="w-5 h-5" />
                </button>

                {/* Counter */}
                {multi && (
                  <div className="px-3 py-1.5 rounded-full glass text-white/90 text-xs font-semibold tracking-wide
                    border border-white/8 shadow-lg">
                    {idx + 1} <span className="text-white/40 mx-0.5">/</span> {images.length}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main image area ── */}
          <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
            {/* Prev arrow */}
            <AnimatePresence>
              {multi && controlsVisible && (
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => paginate(-1)}
                  className="absolute left-2 sm:left-5 z-20 p-2.5 sm:p-3 rounded-full
                    glass border border-white/8 text-white/80 hover:text-white
                    hover:bg-white/15 transition-all duration-200 cursor-pointer shadow-lg
                    active:scale-90"
                >
                  <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Image with slide animation + drag-to-dismiss */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={idx}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag={zoomed ? false : "y"}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                style={{ y: zoomed ? 0 : dragY }}
                onDoubleClick={handleDoubleClick}
                className={cn(
                  "relative cursor-grab active:cursor-grabbing transition-[width,height] duration-300 ease-out",
                  zoomed
                    ? "w-[95vw] h-[90vh] lg:w-full lg:h-[90vh] cursor-zoom-out"
                    : "w-[92vw] h-[75vh] sm:w-[85vw] sm:h-[78vh] lg:w-[90%] lg:h-[80vh] cursor-zoom-in"
                )}
              >
                <Image
                  src={images[idx]}
                  alt={`Image ${idx + 1}`}
                  fill
                  className="object-contain transition-transform duration-300 ease-out rounded-lg sm:rounded-2xl"
                  sizes="(min-width: 1024px) 60vw, 95vw"
                  priority
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Next arrow */}
            <AnimatePresence>
              {multi && controlsVisible && (
                <motion.button
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => paginate(1)}
                  className="absolute right-2 sm:right-5 z-20 p-2.5 sm:p-3 rounded-full
                    glass border border-white/8 text-white/80 hover:text-white
                    hover:bg-white/15 transition-all duration-200 cursor-pointer shadow-lg
                    active:scale-90"
                >
                  <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ── Bottom controls: Zoom bar + Thumbnail strip ── */}
          <AnimatePresence>
            {controlsVisible && (
              <motion.div
                variants={controlBarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute bottom-0 left-0 right-0 z-20 pb-4 sm:pb-6"
              >
                <div className="flex flex-col items-center gap-3">

                  {/* Thumbnail strip */}
                  {multi && (
                    <motion.div
                      variants={thumbnailVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-2xl glass
                        border border-white/8 shadow-2xl max-w-[90vw] sm:max-w-lg overflow-x-auto scrollbar-none"
                    >
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => goTo(i)}
                          className={cn(
                            "relative shrink-0 rounded-lg overflow-hidden transition-all duration-250 cursor-pointer",
                            i === idx
                              ? "w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-jw-accent ring-offset-1 ring-offset-jw-base/80 scale-105"
                              : "w-10 h-10 sm:w-11 sm:h-11 opacity-50 hover:opacity-85 hover:scale-105"
                          )}
                        >
                          <Image
                            src={img}
                            alt={`Thumb ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                          {/* Active indicator dot */}
                          {i === idx && (
                            <motion.div
                              layoutId="thumb-indicator"
                              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5
                                bg-jw-accent rounded-full shadow-sm shadow-jw-accent/50"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* Zoom / fullscreen controls */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass
                    border border-white/8 shadow-xl">
                    <button
                      onClick={() => setZoomed(false)}
                      className={cn(
                        "p-2 rounded-lg transition-all duration-200 cursor-pointer",
                        !zoomed
                          ? "bg-white/10 text-white"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      )}
                      title="Fit to screen"
                    >
                      <HiArrowsPointingOut className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-white/10" />
                    <button
                      onClick={() => setZoomed((z) => !z)}
                      className={cn(
                        "p-2 rounded-lg transition-all duration-200 cursor-pointer",
                        zoomed
                          ? "bg-white/10 text-white"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      )}
                      title={zoomed ? "Zoom out" : "Zoom in"}
                    >
                      {zoomed ? (
                        <HiMagnifyingGlassMinus className="w-4 h-4" />
                      ) : (
                        <HiMagnifyingGlassPlus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mobile dot indicators ── */}
          {multi && images.length <= 6 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30
              flex items-center gap-1.5 sm:hidden pointer-events-none">
              <AnimatePresence>
                {!controlsVisible && images.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={cn(
                      "rounded-full transition-all duration-200",
                      i === idx
                        ? "w-2 h-2 bg-jw-accent shadow-sm shadow-jw-accent/50"
                        : "w-1.5 h-1.5 bg-white/30"
                    )}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ═══ Post Detail Panel (Desktop only) ═══ */}
        {hasPostPanel && <PostPanel post={post} />}
      </motion.div>
    </AnimatePresence>
  );
}
