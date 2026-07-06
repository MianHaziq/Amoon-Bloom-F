"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { ArrowRight } from "@/components/icons";
import { useT } from "@/i18n/useT";

export interface HeroSlide {
  id: string;
  url: string;
  kind: "image" | "video";
}

interface HeroCarouselProps {
  /** Slides pre-sorted by the parent server component. Images or videos. */
  slides: HeroSlide[];
}

/**
 * Hero — full-bleed slideshow supporting video and image slides. Video slides
 * autoplay muted (only the active one plays) and advance to the next slide when
 * they end; images auto-advance on a timer. Manual nav (arrows/dots/swipe) is
 * always available. Respects prefers-reduced-motion (no autoplay / no auto-
 * advance; the first frame is shown as a still).
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  const { t } = useT();
  const total = slides.length;
  const hasMultiple = total > 1;

  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goTo = useCallback(
    (i: number) => setActive(((i % total) + total) % total),
    [total]
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Honour reduced-motion: pause autoplay + auto-advance.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Play only the active video; pause + rewind the rest.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && !reduced) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active, reduced, slides]);

  // Auto-advance image slides (videos advance via onEnded).
  useEffect(() => {
    if (!hasMultiple || reduced) return;
    if (slides[active]?.kind === "video") return;
    const id = setTimeout(next, 6000);
    return () => clearTimeout(id);
  }, [active, hasMultiple, reduced, slides, next]);

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
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            aria-hidden={i !== active}
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
          >
            {slide.kind === "video" ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={slide.url}
                muted
                playsInline
                loop={total === 1}
                autoPlay={i === 0}
                preload={i === 0 ? "auto" : "metadata"}
                onEnded={hasMultiple ? next : undefined}
                className="h-full w-full object-cover"
                aria-hidden
              />
            ) : (
              <Image
                src={slide.url}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
                draggable={false}
              />
            )}
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

      {/* Prev / Next — manual navigation (desktop) */}
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

      {/* Content overlay */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-4 pb-6 sm:px-6 sm:pb-14 lg:px-10 lg:pb-20">
        <div className="mb-5 max-w-xl sm:mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-xs">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-2xl font-medium leading-[1.08] text-white sm:mt-3 sm:text-5xl sm:leading-[1.05] lg:text-6xl">
            {t("hero.title1")}{" "}
            <span className="italic">{t("hero.titleAccent")}</span>
          </h1>
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
