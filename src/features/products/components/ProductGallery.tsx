"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
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
      <div className="aspect-4/5 w-full rounded-3xl bg-cream-100" aria-hidden />
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-24">
      <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-blush-50">
        <Image
          key={active.url}
          src={active.url}
          alt={active.alt || title}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover animate-fade-in"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl bg-cream-100 transition-all",
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
