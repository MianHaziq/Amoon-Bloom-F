"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { ArrowRight } from "@/components/icons";
import { useT } from "@/i18n/useT";

const SLIDE_MS = 6500;
const FADE_MS = 1100;
const KEN_BURNS_MS = 8500;

interface HeroCarouselProps {
  /** Banners pre-sorted by sortOrder by the parent server component. */
  slides: { id: string; url: string }[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const { t } = useT();
  const total = slides.length;
  const hasMultiple = total > 1;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const kenBurnsAnims = useRef<(Animation | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Restart Ken Burns on the active slide via WAAPI. The previous slide's
  // animation is left running so its zoom doesn't snap back during fade-out.
  useEffect(() => {
    if (reduceMotion) return;
    const el = slideRefs.current[active];
    if (!el) return;
    kenBurnsAnims.current[active]?.cancel();
    const anim = el.animate(
      [
        { transform: "scale(1.02) translate3d(0, 0, 0)" },
        { transform: "scale(1.12) translate3d(-1.5%, -1%, 0)" },
      ],
      {
        duration: KEN_BURNS_MS,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      }
    );
    kenBurnsAnims.current[active] = anim;
    return () => {
      // Don't cancel here — let the zoom continue through the fade-out so it
      // doesn't snap back to scale(1.02). It'll be cancelled the next time
      // this slot becomes active (above).
    };
  }, [active, reduceMotion]);

  // Pause/resume all running Ken Burns animations in sync with hover.
  useEffect(() => {
    if (reduceMotion) return;
    for (const anim of kenBurnsAnims.current) {
      if (!anim) continue;
      if (paused) anim.pause();
      else if (anim.playState === "paused") anim.play();
    }
  }, [paused, reduceMotion]);

  // Reduced-motion fallback advance — when there's no bar animation to drive
  // the cycle, fall back to a plain timer.
  useEffect(() => {
    if (!hasMultiple || paused || !reduceMotion) return;
    const id = window.setTimeout(
      () => setActive((a) => (a + 1) % total),
      SLIDE_MS
    );
    return () => window.clearTimeout(id);
  }, [active, paused, reduceMotion, hasMultiple, total]);

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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
      tabIndex={hasMultiple ? 0 : -1}
      className="relative isolate h-[78vh] min-h-[560px] max-h-[820px] w-full overflow-hidden bg-blush-50 outline-none focus-visible:ring-2 focus-visible:ring-bloom-500/40 md:min-h-[640px] lg:min-h-[700px]"
    >
      {/* Slides — absolute-stacked crossfade */}
      <div className="absolute inset-0">
        {slides.map((slide, i) => {
          const isActive = i === active;
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className="absolute inset-0 transform-gpu"
              style={{
                opacity: isActive ? 1 : 0,
                transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                zIndex: isActive ? 1 : 0,
                willChange: "opacity",
              }}
            >
              <div
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className="relative h-full w-full transform-gpu will-change-transform"
                style={{ transform: "scale(1.02) translate3d(0, 0, 0)" }}
              >
                <Image
                  src={slide.url}
                  alt=""
                  fill
                  priority={i === 0}
                  loading={i === 0 ? undefined : "eager"}
                  sizes="100vw"
                  className="object-cover"
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
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

      {/* Prev / Next */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label={t("hero.prevSlide")}
            className={cn(
              "absolute inset-s-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-3 text-white backdrop-blur-md transition-[opacity,background-color,color,box-shadow] duration-300 ease-out hover:bg-white hover:text-ink-900 hover:shadow-(--shadow-lift) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:flex lg:inset-s-6",
              paused ? "opacity-100" : "opacity-0"
            )}
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t("hero.nextSlide")}
            className={cn(
              "absolute inset-e-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-3 text-white backdrop-blur-md transition-[opacity,background-color,color,box-shadow] duration-300 ease-out hover:bg-white hover:text-ink-900 hover:shadow-(--shadow-lift) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:flex lg:inset-e-6",
              paused ? "opacity-100" : "opacity-0"
            )}
          >
            <Chevron direction="right" />
          </button>
        </>
      )}

      {/* Indicators — progress bar's animationend drives the slide advance,
          so timing is guaranteed in sync with the visible fill. */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6 sm:pb-14 lg:px-10 lg:pb-20">
        {/* Brand message + primary CTA — pinned bottom-left over the imagery */}
        <div className="mb-8 max-w-xl sm:mb-10">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-xs"
            style={{ animation: "hero-rise 800ms var(--ease-out-soft) both", animationDelay: "120ms" }}
          >
            {t("hero.eyebrow")}
          </p>
          <h1
            className="mt-3 font-display text-4xl font-medium leading-[1.05] text-white sm:text-5xl lg:text-6xl"
            style={{ animation: "hero-rise 800ms var(--ease-out-soft) both", animationDelay: "240ms" }}
          >
            {t("hero.title1")}{" "}
            <span className="italic">{t("hero.titleAccent")}</span>
          </h1>
          <p
            className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base"
            style={{ animation: "hero-rise 800ms var(--ease-out-soft) both", animationDelay: "380ms" }}
          >
            {t("hero.subtitle")}
          </p>
          <div
            className="mt-7 flex flex-wrap items-center gap-3"
            style={{ animation: "hero-rise 800ms var(--ease-out-soft) both", animationDelay: "520ms" }}
          >
            <Link
              href={ROUTES.shop}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-ink-900 shadow-(--shadow-lift) transition-transform hover:-translate-y-0.5 hover:bg-cream-50"
            >
              {t("hero.ctaPrimary")}
              <ArrowRight size={16} className="rtl:-scale-x-100" />
            </Link>
            <Link
              href={ROUTES.shop}
              className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
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
                      "relative h-1 overflow-hidden rounded-full transition-[width,background-color] duration-500 ease-out",
                      isActive
                        ? "w-12 bg-white/35 sm:w-16"
                        : "w-6 bg-white/25 hover:bg-white/45 sm:w-8"
                    )}
                  >
                    {isActive && !reduceMotion && (
                      <span
                        key={`progress-${active}`}
                        aria-hidden
                        onAnimationEnd={() =>
                          setActive((a) => (a + 1) % total)
                        }
                        className="absolute inset-y-0 inset-s-0 w-full origin-left bg-white will-change-transform"
                        style={{
                          animation: `hero-progress ${SLIDE_MS}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                      />
                    )}
                  </button>
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
