"use client";

import Image from "next/image";
import { useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { useT } from "@/i18n/useT";
import type { Image as ImageType } from "@/types";

interface ProductGalleryProps {
  images: ImageType[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useT();
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div className="aspect-square w-full rounded-3xl bg-cream-100" aria-hidden />
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-24">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-blush-50">
        {/* Crossfade + subtle zoom between gallery images. Both frames overlap
            (absolute fill) so there's no flash of empty background. */}
        <AnimatePresence initial={false}>
          <m.div
            key={active.url}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <Image
              src={active.url}
              alt={active.alt || title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </m.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl bg-cream-100 transition-all duration-200 active:scale-95",
                "ring-offset-2 ring-offset-cream-50",
                i === activeIndex
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
