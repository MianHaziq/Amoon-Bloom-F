"use client";

import Image from "next/image";
import { useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { useT } from "@/i18n/useT";
import { usePdpImage } from "./PdpImageContext";
import type { Image as ImageType } from "@/types";

interface ProductGalleryProps {
  images: ImageType[];
  title: string;
}

const ZOOM = 2; // magnification on hover (Amazon-style)

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Cursor-following zoom (desktop hover only; touch never fires these).
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const { t } = useT();
  // A colour selection (from the option picker) overrides the shown image.
  const { activeUrl, setActiveUrl } = usePdpImage();
  const active = activeUrl
    ? { url: activeUrl, alt: title }
    : images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div className="aspect-square w-full rounded-3xl bg-cream-100" aria-hidden />
    );
  }

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom((z) => ({ ...z, x, y }));
  };

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-24">
      <div
        className="group relative aspect-square overflow-hidden rounded-3xl bg-blush-50 lg:cursor-zoom-in"
        onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
        onMouseLeave={() => setZoom({ on: false, x: 50, y: 50 })}
        onMouseMove={onMove}
      >
        {/* Crossfade between gallery images; the inner <Image> also scales on
            hover, panning toward the cursor for a magnifier effect. */}
        <AnimatePresence initial={false}>
          <m.div
            key={active.url}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <Image
              src={active.url}
              alt={active.alt || title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-200 ease-out will-change-transform"
              style={{
                transform: zoom.on ? `scale(${ZOOM})` : "scale(1)",
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
              }}
            />
          </m.div>
        </AnimatePresence>

        {/* Subtle hint that the image is zoomable (desktop only) */}
        <span className="pointer-events-none absolute inset-e-3 top-3 z-10 hidden rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink-700 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 lg:block">
          {t("product.hoverToZoom")}
        </span>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setActiveUrl(null);
              }}
              onMouseEnter={() => {
                setActiveIndex(i);
                setActiveUrl(null);
              }}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl bg-cream-100 transition-all duration-200 active:scale-95",
                "ring-offset-2 ring-offset-cream-50",
                active.url === img.url
                  ? "ring-2 ring-bloom-500"
                  : "ring-1 ring-ink-100 hover:ring-ink-300"
              )}
              aria-label={t("product.viewImage", {
                n: i + 1,
                total: images.length,
              })}
            >
              <Image
                src={img.url}
                alt={img.alt || ""}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
