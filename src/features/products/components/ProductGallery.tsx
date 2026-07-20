"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { ChevronLeft, ChevronRight, ZoomInIcon } from "@/components/icons";
import { useT } from "@/i18n/useT";
import { usePdpImage } from "./PdpImageContext";

interface ProductGalleryProps {
  title: string;
}

const ZOOM = 2; // magnification on hover (Amazon-style)

export function ProductGallery({ title }: ProductGalleryProps) {
  // Cursor-following zoom (desktop hover only; touch never fires these).
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const { t, dir } = useT();
  const touchStartX = useRef<number | null>(null);
  // Gallery + selection both come from PdpImageProvider — computed from the product
  // up front, so the first paint already matches the default variant (see the
  // provider's doc comment for why that used to be wrong).
  const { activeUrl, setActiveUrl, gallery } = usePdpImage();

  if (!activeUrl) {
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

  // Step to the previous/next gallery photo, wrapping around at either end.
  const step = (delta: 1 | -1) => {
    if (gallery.length < 2) return;
    const currentIndex = Math.max(0, gallery.findIndex((g) => g.url === activeUrl));
    const nextIndex = (currentIndex + delta + gallery.length) % gallery.length;
    setActiveUrl(gallery[nextIndex].url);
  };

  // Mobile swipe-to-advance. Direction is flipped in RTL so a swipe toward
  // the start of reading order always means "next", matching the prev/next
  // buttons above (which are positioned via logical inset-s/e, not left/right).
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    const SWIPE_THRESHOLD = 40;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    const swipedTowardStart = delta < 0;
    const goNext = dir === "rtl" ? !swipedTowardStart : swipedTowardStart;
    step(goNext ? 1 : -1);
  };

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-24">
      <div
        className="group relative aspect-square touch-pan-y overflow-hidden rounded-3xl bg-blush-50 lg:cursor-zoom-in"
        onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
        onMouseLeave={() => setZoom({ on: false, x: 50, y: 50 })}
        onMouseMove={onMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Crossfade between gallery images; the inner <Image> also scales on
            hover, panning toward the cursor for a magnifier effect. */}
        <AnimatePresence initial={false}>
          <m.div
            key={activeUrl}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <Image
              src={activeUrl}
              alt={title}
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

        {/* Always-on hint that the image is zoomable (desktop only) — visible up
            front rather than only appearing once already hovering, which would
            defeat the point of a "hover to zoom" hint. */}
        <span className="pointer-events-none absolute inset-e-3 top-3 z-10 hidden items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink-700 backdrop-blur-sm lg:flex">
          <ZoomInIcon size={14} />
          {t("product.hoverToZoom")}
        </span>

        {gallery.length > 1 && (
          <>
            {/* onMouseEnter/Leave here suspend the magnifier while the cursor is
                over a nav button — otherwise the image kept zooming/panning
                underneath the button the shopper is trying to click. */}
            <button
              type="button"
              onClick={() => step(-1)}
              onMouseEnter={() => setZoom((z) => ({ ...z, on: false }))}
              onMouseLeave={() => setZoom((z) => ({ ...z, on: true }))}
              aria-label={t("product.previousImage")}
              className="absolute inset-s-3 bottom-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-bloom-300 bg-white/90 text-bloom-600 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-bloom-500 hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2"
            >
              <ChevronLeft size={20} className="rtl:-scale-x-100" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              onMouseEnter={() => setZoom((z) => ({ ...z, on: false }))}
              onMouseLeave={() => setZoom((z) => ({ ...z, on: true }))}
              aria-label={t("product.nextImage")}
              className="absolute inset-e-3 bottom-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-bloom-300 bg-white/90 text-bloom-600 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-bloom-500 hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2"
            >
              <ChevronRight size={20} className="rtl:-scale-x-100" />
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((photo, i) => {
            const selected = activeUrl === photo.url;
            return (
              <button
                key={photo.url}
                type="button"
                onClick={() => setActiveUrl(photo.url)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-xl bg-cream-100 transition-all duration-200 active:scale-95",
                  "ring-offset-2 ring-offset-cream-50",
                  selected
                    ? "ring-2 ring-bloom-500"
                    : "ring-1 ring-ink-100 hover:ring-ink-300"
                )}
                aria-label={
                  photo.value
                    ? t("product.viewVariantImage", { value: photo.value })
                    : t("product.viewImage", { n: i + 1, total: gallery.length })
                }
              >
                <Image
                  src={photo.url}
                  alt={photo.value || ""}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
