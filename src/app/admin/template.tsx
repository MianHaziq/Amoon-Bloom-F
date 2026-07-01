"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { baseTransition } from "@/lib/motion";

/**
 * Admin route transition — a plain, quick fade (no slide). Lighter than the
 * storefront's fade+slide: admin is dense and utilitarian, so navigation should
 * feel instant and settled, not theatrical. Remounts per route via `template`.
 */
export default function AdminTemplate({ children }: { children: ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={baseTransition}
    >
      {children}
    </m.div>
  );
}
