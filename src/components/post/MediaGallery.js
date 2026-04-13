"use client";

/**
 * MediaGallery — displays 1-4 post images in a responsive grid (X/Twitter-style).
 * Clicking an image opens the premium fullscreen lightbox.
 */

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import ImageLightbox from "./ImageLightbox";
import { cn } from "@/lib/utils";

/**
 * @param {{ id: string, media_url: string, media_type: string }[]} media
 */
export default function MediaGallery({ media, post }) {
  const [lightboxIdx, setLightboxIdx] = useState(-1);

  if (!media || media.length === 0) return null;

  const count = media.length;

  /** Grid layout: 1→full, 2→2 cols, 3→2+1, 4→2x2 */
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2",
    4: "grid-cols-2",
  }[count] || "grid-cols-2";

  return (
    <>
      <div className={cn("grid gap-1 rounded-2xl overflow-hidden border border-border-subtle/50", gridClass)}>
        {media.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setLightboxIdx(idx)}
            className={cn(
              "relative overflow-hidden bg-bg-inset cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-jw-accent rounded-none",
              /* First item: top-left corner */
              idx === 0 && "rounded-tl-[14px]",
              /* Corner rounding based on count */
              count === 1 && "rounded-[14px]",
              count === 2 && idx === 0 && "rounded-l-[14px]",
              count === 2 && idx === 1 && "rounded-r-[14px]",
              count === 3 && idx === 0 && "row-span-2 rounded-l-[14px]",
              count === 3 && idx === 1 && "rounded-tr-[14px]",
              count === 3 && idx === 2 && "rounded-br-[14px]",
              count === 4 && idx === 0 && "rounded-tl-[14px]",
              count === 4 && idx === 1 && "rounded-tr-[14px]",
              count === 4 && idx === 2 && "rounded-bl-[14px]",
              count === 4 && idx === 3 && "rounded-br-[14px]",
              /* Aspect ratios */
              count === 1 && "aspect-video",
              count === 2 && "aspect-[4/3]",
              count === 3 && idx === 0 && "aspect-square",
              count === 3 && idx > 0 && "aspect-[4/3]",
              count === 4 && "aspect-square"
            )}
          >
            <Image
              src={item.media_url}
              alt={`Media ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            {/* Hover overlay — subtle gradient from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent
              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Multi-image count badge (only on last image when > 4) */}
            {count > 4 && idx === 3 && (
              <div className="absolute inset-0 bg-jw-base/60 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{count - 4}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx >= 0 && (
          <ImageLightbox
            images={media.map((m) => m.media_url)}
            initialIndex={lightboxIdx}
            onClose={() => setLightboxIdx(-1)}
            post={post}
          />
        )}
      </AnimatePresence>
    </>
  );
}
