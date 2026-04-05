"use client";

/**
 * MediaGallery — displays 1-4 post images in a responsive grid.
 * Clicking an image opens the fullscreen lightbox.
 */

import { useState } from "react";
import Image from "next/image";
import ImageLightbox from "./ImageLightbox";
import { cn } from "@/lib/utils";

/**
 * @param {{ id: string, media_url: string, media_type: string }[]} media
 */
export default function MediaGallery({ media }) {
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
      <div className={cn("grid gap-1 rounded-2xl overflow-hidden", gridClass)}>
        {media.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setLightboxIdx(idx)}
            className={cn(
              "relative overflow-hidden bg-surface-hover cursor-pointer group",
              count === 1 && "aspect-video",
              count === 2 && "aspect-[4/3]",
              count === 3 && idx === 0 && "row-span-2 aspect-square",
              count === 3 && idx > 0 && "aspect-[4/3]",
              count === 4 && "aspect-square"
            )}
          >
            <Image
              src={item.media_url}
              alt={`Media ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx >= 0 && (
        <ImageLightbox
          images={media.map((m) => m.media_url)}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(-1)}
        />
      )}
    </>
  );
}
