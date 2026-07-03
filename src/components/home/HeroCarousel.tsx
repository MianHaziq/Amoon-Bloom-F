"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { ArrowRight } from "@/components/icons";
import { useT } from "@/i18n/useT";

interface HeroCarouselProps {
  /** Banners pre-sorted by sortOrder by the parent server component. */
  slides: { id: string; url: string }[];
}

/**
 * Hero banner — static (no animation). Banner images are shown at a fixed
 * 16:9 ratio at every breakpoint so admin-uploaded 16:9 art is never cropped.
 * When there are multiple banners they can be navigated manually (arrows,
 * indicators, or swipe); nothing auto-advances, zooms, or fades.
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  const { t } = useT();
  const total = slides.length;
  const hasMultiple = total > 1;

  const [active, setActive] = useState(0);

  const goTo = useCallback(
    (i: number) => setActive(((i % total) + total) % total),
    [total]
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  const touchStart = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 48) (dx < 0 ? next : prev)();
    touchStart.current = null;
  };

  if (total === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("hero.carouselLabel")}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
      tabIndex={hasMultiple ? 0 : -1}
      className="relative isolate aspect-video max-h-[780px] w-full overflow-hidden bg-blush-50 outline-none focus-visible:ring-2 focus-visible:ring-bloom-500/40"
    >
      {/* Slides — static; the active banner is shown, no transition/zoom. */}
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            aria-hidden={i !== active}
            className="absolute inset-0"
            style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
          >
            <Image
              src={slide.url}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Readability gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-ink-900/45 via-ink-900/10 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-48 bg-gradient-to-t from-ink-900/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 z-[2] h-[36rem] w-[36rem] rounded-full bg-bloom-300/20 blur-3xl"
      />

      {/* Prev / Next — manual navigation only (desktop) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label={t("hero.prevSlide")}
            className="absolute inset-s-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-3 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-ink-900 hover:shadow-(--shadow-lift) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:flex lg:inset-s-6"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t("hero.nextSlide")}
            className="absolute inset-e-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-3 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-ink-900 hover:shadow-(--shadow-lift) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:flex lg:inset-e-6"
          >
            <Chevron direction="right" />
          </button>
        </>
      )}

      {/* Content overlay — pinned bottom-start over the imagery */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-4 pb-6 sm:px-6 sm:pb-14 lg:px-10 lg:pb-20">
        <div className="mb-5 max-w-xl sm:mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-xs">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-2xl font-medium leading-[1.08] text-white sm:mt-3 sm:text-5xl sm:leading-[1.05] lg:text-6xl">
            {t("hero.title1")}{" "}
            <span className="italic">{t("hero.titleAccent")}</span>
          </h1>
          {/* Subtitle is hidden on the compact mobile banner to keep the 16:9
              box readable; it returns from the sm breakpoint up. */}
          <p className="mt-4 hidden max-w-md text-sm leading-relaxed text-white/80 sm:block sm:text-base">
            {t("hero.subtitle")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-7">
            <Link
              href={ROUTES.shop}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-ink-900 shadow-(--shadow-lift) transition-transform hover:-translate-y-0.5 hover:bg-cream-50 sm:h-12 sm:px-6"
            >
              {t("hero.ctaPrimary")}
              <ArrowRight size={16} className="rtl:-scale-x-100" />
            </Link>
            <Link
              href={ROUTES.shop}
              className="inline-flex h-11 items-center rounded-full border border-white/40 px-5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 sm:h-12 sm:px-6"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>

        {hasMultiple && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              {slides.map((s, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={t("hero.goToSlide", { n: i + 1 })}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "h-1 rounded-full transition-[width,background-color] duration-300 ease-out",
                      isActive
                        ? "w-12 bg-white sm:w-16"
                        : "w-6 bg-white/40 hover:bg-white/60 sm:w-8"
                    )}
                  />
                );
              })}
            </div>

            <div className="hidden items-center gap-3 text-xs font-semibold tracking-[0.18em] text-white/85 uppercase sm:flex">
              <span className="tabular-nums">
                {String(active + 1).padStart(2, "0")}
              </span>
              <span className="h-px w-8 bg-white/40" />
              <span className="tabular-nums text-white/55">
                {String(total).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={direction === "left" ? "rotate-180" : ""}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
