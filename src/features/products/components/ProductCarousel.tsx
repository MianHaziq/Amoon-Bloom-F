"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import { ProductCard } from "./ProductCard";
import type { Product } from "../types";

interface ProductCarouselProps {
  products: Product[];
  /** First N cards get image `priority` (above-the-fold LCP). */
  priorityCount?: number;
  className?: string;
}

/**
 * Horizontally-scrollable product rail (swipe / drag on touch, scroll on
 * desktop) with scroll-snap and pagination dots underneath. Replaces the static
 * grid for the home product sections so a customer can flick through more
 * products in place, with the dots signalling there's more to see.
 *
 * Pages are derived from the scroller's own width (clientWidth) rather than a
 * fixed items-per-view, so the dot count stays correct across breakpoints and
 * RTL without hardcoding how many cards are visible. Snap is per-card, which
 * feels natural on touch; the dots still map to full "screens" of content.
 */
export function ProductCarousel({
  products,
  priorityCount = 0,
  className,
}: ProductCarouselProps) {
  const { dir } = useT();
  const rtl = dir === "rtl";
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [activePage, setActivePage] = useState(0);

  const readActivePage = useCallback((el: HTMLDivElement) => {
    if (el.clientWidth <= 0) return 0;
    // Browsers report RTL scrollLeft as negative — abs() normalizes both.
    return Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
  }, []);

  const recompute = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const pages = el.clientWidth > 0 ? Math.round(el.scrollWidth / el.clientWidth) : 0;
    setPageCount(pages > 1 ? pages : 0);
    setActivePage(readActivePage(el));
  }, [readActivePage]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    recompute();

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActivePage(readActivePage(el)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    // Recompute page count when the scroller resizes (breakpoint / orientation).
    const ro = new ResizeObserver(recompute);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [recompute, readActivePage, products.length]);

  const goToPage = (page: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: page * el.clientWidth * (rtl ? -1 : 1), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className={className}>
      <div
        ref={scrollerRef}
        role="region"
        aria-label="Products — scroll horizontally to see more"
        className={cn(
          // Bleed to the screen edges on mobile so the last card peeks past the
          // gutter (a visual cue that the row scrolls); align to the container on lg+.
          // scroll-ps/pe matches the px so snap doesn't scroll the leading gutter
          // out of view on load (browsers snap flush to the scrollport otherwise).
          "-mx-4 flex snap-x snap-mandatory gap-x-3 overflow-x-auto scroll-smooth px-4 pb-1",
          "scroll-ps-4 scroll-pe-4 no-scrollbar sm:gap-x-6 lg:mx-0 lg:px-0 lg:scroll-ps-0 lg:scroll-pe-0"
        )}
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            // Fractional widths leave the next card peeking, so it's obvious the
            // row is swipeable: ~2 up on phones → 4 up on desktop.
            className="w-[44%] shrink-0 snap-start sm:w-[31%] md:w-[23%] lg:w-[22%]"
          >
            <ProductCard product={product} priority={i < priorityCount} />
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div
          className="mt-6 flex items-center justify-center gap-2"
          aria-hidden="true"
        >
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to product set ${i + 1}`}
              onClick={() => goToPage(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === activePage
                  ? "w-6 bg-bloom-600"
                  : "w-2 bg-ink-200 hover:bg-ink-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
