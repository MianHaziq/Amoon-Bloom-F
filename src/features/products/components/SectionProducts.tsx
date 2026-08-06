"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import { ProductCard } from "./ProductCard";
import type { Product } from "../types";
import type { SectionDisplay } from "@/features/sections/types";

interface SectionProductsProps {
  products: Product[];
  /** Resolved per-breakpoint layout (see resolveSectionDisplay). */
  display: SectionDisplay;
  /** Stable unique id (the section id) used to scope the per-breakpoint limit CSS. */
  scopeId: string;
  /** First N cards get image `priority` (above-the-fold LCP). */
  priorityCount?: number;
  className?: string;
}

/**
 * CSS that hides the tail of the product list past each breakpoint's limit. The
 * component renders up to max(desktopLimit, mobileLimit) cards; this trims each
 * breakpoint down via `nth-child`, so both limits are honored in a single DOM tree
 * with no JS and no flash (media queries resolve before paint). Scoped to this
 * section by its id. Only emitted when there's actually a tail to hide.
 */
function limitStyle(scopeId: string, desktopLimit: number, mobileLimit: number): string {
  const sel = `[data-sp-scope="${scopeId}"] > .section-products__item`;
  return (
    `${sel}:nth-child(n+${mobileLimit + 1}){display:none}` +
    `@media (min-width:1024px){` +
    // Reset all visible first (equal specificity, later in source order → wins over
    // the mobile hide above), then hide past the desktop limit.
    `${sel}:nth-child(n+1){display:block}` +
    `${sel}:nth-child(n+${desktopLimit + 1}){display:none}` +
    `}`
  );
}

// Matches the Tailwind `lg` breakpoint used to switch mobile↔desktop in the CSS
// (globals.css `.section-products`). Kept in sync manually — both are 1024px.
const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Renders a home section's products as either a wrapped GRID or a horizontal
 * SCROLL rail, chosen independently for mobile and desktop by the admin. All four
 * mobile×desktop combinations render in a SINGLE DOM tree: the layout itself is
 * pure CSS (globals.css `.section-products`, driven by the data-attrs + column
 * custom properties set below), so it's correct on first server paint with no JS
 * and no double render.
 *
 * The only JS here is progressive enhancement for SCROLL mode: scroll-position
 * pagination dots that appear when — and only when — the *currently active*
 * breakpoint is a scroll layout and the content actually overflows. In GRID mode
 * they never show. Mirrors the proven ProductCarousel dot logic.
 */
export function SectionProducts({
  products,
  display,
  scopeId,
  priorityCount = 0,
  className,
}: SectionProductsProps) {
  const { dir, t } = useT();
  const rtl = dir === "rtl";
  const scrollerRef = useRef<HTMLDivElement>(null);

  // null until measured on the client, so we never diverge from the server paint.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [activePage, setActivePage] = useState(0);

  // Track the active breakpoint so the dots know whether the current layout scrolls.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const activeLayout =
    isDesktop === null ? null : isDesktop ? display.desktopLayout : display.mobileLayout;
  const isScroll = activeLayout === "SCROLL";

  const readActivePage = useCallback((el: HTMLDivElement) => {
    if (el.clientWidth <= 0) return 0;
    // Browsers report RTL scrollLeft as negative — abs() normalizes both.
    return Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
  }, []);

  const recompute = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // In grid mode there's no horizontal overflow, so pages collapses to ≤1 and no
    // dots render — the isScroll guard below is belt-and-suspenders.
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

    // Recompute page count when the scroller resizes (breakpoint / orientation /
    // a layout switch that changes card widths).
    const ro = new ResizeObserver(recompute);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [recompute, readActivePage, products.length, dir]);

  // Crossing the lg breakpoint can change which items the limit CSS hides (and thus
  // the scrollable width) without the scroller's own box necessarily resizing, so
  // recompute the dot count when the active breakpoint flips.
  useEffect(() => {
    recompute();
  }, [isDesktop, recompute]);

  const goToPage = (page: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: page * el.clientWidth * (rtl ? -1 : 1), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  const showDots = isScroll && pageCount > 1;
  // Only inject the limit CSS when the list actually overruns a breakpoint's cap.
  const needsLimit =
    products.length > display.mobileLimit || products.length > display.desktopLimit;

  return (
    <div className={className}>
      {needsLimit && (
        <style
          dangerouslySetInnerHTML={{
            __html: limitStyle(scopeId, display.desktopLimit, display.mobileLimit),
          }}
        />
      )}
      <div
        // Remount the container when direction flips: iOS Safari won't re-resolve an
        // existing overflow-x container's RTL/LTR scroll origin on a live language
        // switch, so rebuild the node (matches ProductCarousel).
        key={dir}
        ref={scrollerRef}
        role="region"
        aria-label={t("home.productsRegionLabel")}
        className="section-products no-scrollbar"
        data-sp-scope={scopeId}
        data-sp-m={display.mobileLayout.toLowerCase()}
        data-sp-d={display.desktopLayout.toLowerCase()}
        style={
          {
            "--sp-m-cols": display.mobileColumns,
            "--sp-d-cols": display.desktopColumns,
          } as CSSProperties
        }
      >
        {products.map((product, i) => (
          <div key={product.id} className="section-products__item">
            <ProductCard product={product} priority={i < priorityCount} />
          </div>
        ))}
      </div>

      {showDots && (
        <div className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={t("home.productsGoToSet", { n: i + 1 })}
              onClick={() => goToPage(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === activePage ? "w-6 bg-bloom-600" : "w-2 bg-ink-200 hover:bg-ink-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
