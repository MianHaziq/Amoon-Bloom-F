"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { pageVariants } from "@/lib/motion";
import { useT } from "@/i18n/useT";

/**
 * Storefront route transition. A `template.tsx` is re-created with a fresh key
 * on every navigation (unlike a layout, which persists), so this component
 * remounts per route change and its enter animation plays each time.
 *
 * We do enter-only (fade + a small directional slide): the App Router unmounts
 * the outgoing page before the incoming one mounts, so a cross-route exit
 * animation isn't reliable — enter-only is the standard, jank-free choice. The
 * slide direction flips for RTL via `pageVariants(dir)`. Header/Footer live in
 * the layout, so they stay put; only the page body transitions.
 */
export default function StorefrontTemplate({
  children,
}: {
  children: ReactNode;
}) {
  const { dir } = useT();
  return (
    <m.div
      variants={pageVariants(dir)}
      initial="hidden"
      animate="show"
      className="flex flex-1 flex-col"
    >
      {children}
    </m.div>
  );
}
