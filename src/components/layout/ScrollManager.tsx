"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * How long after a back/forward (popstate) a pathname change is still treated as
 * that same back/forward. Real pops resolve the pathname effect within a few ms
 * (the route commits / loading.tsx shows immediately), so a small window is
 * plenty — and using a timestamp instead of a sticky boolean means a pop that
 * changed ONLY the query string (which never fires the pathname effect) can't
 * leave a stale flag that swallows the next forward navigation's scroll reset.
 */
const POP_GRACE_MS = 500;

/**
 * Resets scroll to the top of the page on FORWARD (Link/push) navigations.
 *
 * Why this is needed: both the storefront and admin wrap every page in a
 * `template.tsx` transition — `<m.div initial="hidden">`, which starts at
 * opacity 0 (storefront also slides via a transform). That wrapper is the route
 * segment's first/only top-level element, and Next's built-in scroll restoration
 * walks the new page's top-level elements looking for a "scrollable element
 * visible in the viewport", skipping non-visible ones (inspected via
 * getBoundingClientRect). Because the wrapper begins at opacity 0 / transformed,
 * Next bypasses it, finds no valid scroll anchor, and falls back to MAINTAINING
 * the previous scroll position — so clicking a product while scrolled down a long
 * listing left you deep in the new page (e.g. at the footer). Explicitly
 * scrolling to the top on navigation restores the expected "a new page starts at
 * the top" behaviour, without removing the page-transition animation.
 *
 * Back/forward (POP) navigations are deliberately left untouched so the browser
 * can restore the previous scroll position — e.g. returning to your exact place
 * in a product listing after viewing a product. In-page #hash links are also
 * skipped so anchor jumps still work, and the very first mount is skipped so
 * first-paint / reload restoration is left to the browser.
 *
 * Mounted in the persistent layout (not the template, which remounts each route)
 * so the popstate timestamp survives across navigations.
 */
export function ScrollManager() {
  const pathname = usePathname();
  const lastPopAt = useRef(Number.NEGATIVE_INFINITY);
  const hasMounted = useRef(false);

  useEffect(() => {
    // popstate fires synchronously on back/forward, before the pathname effect
    // below runs, so the timestamp is reliably fresh when that effect checks it.
    const onPopState = () => {
      lastPopAt.current = performance.now();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    // Skip the initial load: the browser handles first-paint / reload scroll
    // restoration, and a fresh load is already at the top anyway.
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    // Anchor navigation (#section) should jump to its target, not the top.
    if (window.location.hash) return;
    // A recent popstate means this is a back/forward — let the browser restore
    // the saved position rather than forcing the top.
    if (performance.now() - lastPopAt.current < POP_GRACE_MS) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
