/**
 * ============================================================================
 * Amoon Bloom — Motion System
 * ----------------------------------------------------------------------------
 * The single source of truth for animation timing, easing, and reusable
 * variants across the storefront. Every animated component pulls its
 * transitions and variants from here so motion feels uniform — no per-component
 * hardcoded durations or easings.
 *
 * Principles (see the spec / README motion note):
 *   • Animate ONLY `transform` and `opacity` — never width/height/top/left/
 *     box-shadow. Everything below stays on the compositor for a steady 60fps.
 *   • Micro-interactions 0.2–0.4s · page/scroll reveals 0.3–0.6s.
 *   • Easing is the boutique's `--ease-out-soft` curve, [0.22, 1, 0.36, 1],
 *     mirrored from globals.css so CSS and JS motion match exactly.
 *   • Direction-aware slides flip with the reading direction (RTL-safe) — use
 *     `slideVariants(dir)` / `pageVariants(dir)` and pass the `dir` from useT().
 *   • Reduced motion is handled globally by <MotionConfig reducedMotion="user">
 *     in MotionProvider plus a CSS fallback, so variants here don't each need
 *     to branch on the preference.
 * ============================================================================
 */

import type { Transition, Variants } from "motion/react";

export type Direction = "ltr" | "rtl";

/* --- Easing curves (kept in lockstep with globals.css) --------------------- */

/** easeOut-style — the house curve. Matches `--ease-out-soft`. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Symmetric in/out — for reversible states (matches `--ease-in-out-soft`). */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/* --- Duration tokens ------------------------------------------------------- */

export const DURATION = {
  /** Micro-interactions: hovers, taps, small feedback. */
  micro: 0.22,
  /** Default UI transitions: overlays, content fades. */
  base: 0.32,
  /** Page / scroll reveals, larger entrances. */
  reveal: 0.5,
} as const;

/* --- Shared transition presets --------------------------------------------- */

/** Fast, snappy — buttons, icons, tap feedback. */
export const microTransition: Transition = {
  duration: DURATION.micro,
  ease: EASE_OUT,
};

/** The default for most enter/reveal animations. */
export const baseTransition: Transition = {
  duration: DURATION.base,
  ease: EASE_OUT,
};

/** Slower, editorial — heroes, section reveals, route transitions. */
export const revealTransition: Transition = {
  duration: DURATION.reveal,
  ease: EASE_OUT,
};

/* --- Core variants --------------------------------------------------------- */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: baseTransition },
};

/** The workhorse scroll-reveal: fade + gentle rise. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: revealTransition },
};

/** Subtle scale entrance — good for cards, badges, media. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: baseTransition },
};

/* --- Stagger orchestration -------------------------------------------------- */

/**
 * Container that reveals its children one after another. Pair with
 * `staggerItem` on each child. Defaults tuned for lists/grids.
 */
export function staggerContainer(
  stagger = 0.07,
  delayChildren = 0.04
): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/** Child item for a `staggerContainer`. Fade + rise. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: baseTransition },
};

/* --- Direction-aware slides (RTL-safe) ------------------------------------- */

/**
 * Horizontal slide-in that respects reading direction. In RTL the entrance
 * comes from the opposite side so it always reads as "in from the leading
 * edge". Pass `dir` from `useT()`.
 */
export function slideVariants(dir: Direction, distance = 24): Variants {
  const sign = dir === "rtl" ? -1 : 1;
  return {
    hidden: { opacity: 0, x: sign * distance },
    show: { opacity: 1, x: 0, transition: baseTransition },
    exit: { opacity: 0, x: sign * -distance, transition: microTransition },
  };
}

/* --- Route / page transitions ---------------------------------------------- */

/**
 * Enter transition for route changes: fade + a small directional slide.
 * Wired via the storefront `template.tsx`, which remounts per navigation, so
 * only the enter state runs (App Router unmounts the old page before the new
 * one mounts — enter-only is the jank-free choice). RTL flips the slide.
 */
export function pageVariants(dir: Direction): Variants {
  const sign = dir === "rtl" ? -1 : 1;
  return {
    hidden: { opacity: 0, y: 8, x: sign * 6 },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: DURATION.reveal, ease: EASE_OUT },
    },
  };
}

/* --- Overlay variants (modals, drawers, dropdowns, toasts) ----------------- */

/** Backdrop scrim fade. */
export const overlayBackdrop: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: baseTransition },
  exit: { opacity: 0, transition: microTransition },
};

/** Centered dialog: fade + subtle scale + tiny rise. */
export const dialogPanel: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: baseTransition },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: microTransition },
};

/**
 * Slide-over drawer panel. `side` is the logical edge ("right" = inline-end).
 * The physical slide direction is resolved against `dir` so it hides toward
 * its own edge in both LTR and RTL. Uses percentage transform (compositor-only).
 */
export function drawerPanel(side: "left" | "right", dir: Direction): Variants {
  // inline-end in LTR = right (+100%); in RTL inline-end = left (-100%).
  const endIsRight = dir === "ltr";
  const isEndSide = side === "right";
  const offscreen = (isEndSide ? endIsRight : !endIsRight) ? "100%" : "-100%";
  return {
    hidden: { x: offscreen },
    show: { x: 0, transition: { duration: 0.4, ease: EASE_OUT } },
    exit: { x: offscreen, transition: { duration: 0.32, ease: EASE_OUT } },
  };
}

/* --- List presence (cart line items, toasts, filters) ---------------------- */

/**
 * Enter/exit for items that appear and disappear in place — cart lines,
 * toasts, applied filters. Uses opacity + x-slide + scale only (no height
 * animation, so it stays on the compositor). Wrap the list in <AnimatePresence>.
 */
export const listItem: Variants = {
  hidden: { opacity: 0, x: -8, scale: 0.98 },
  show: { opacity: 1, x: 0, scale: 1, transition: baseTransition },
  exit: { opacity: 0, x: 8, scale: 0.97, transition: microTransition },
};

/* --- Reusable gesture props (spread onto <m.*> elements) -------------------- */

/** Hover lift + tap press for cards. Transform-only. */
export const hoverLift = {
  whileHover: { y: -4, transition: microTransition },
  whileTap: { scale: 0.99, transition: microTransition },
} as const;

/** Press feedback for buttons / icon buttons. */
export const tapScale = {
  whileTap: { scale: 0.96, transition: microTransition },
} as const;

/** A "pop" used to acknowledge an action (e.g. added-to-cart badge). */
export const popFeedback: Variants = {
  hidden: { scale: 0 },
  show: { scale: 1, transition: { duration: 0.3, ease: EASE_OUT } },
  exit: { scale: 0, transition: microTransition },
};

/* --- Admin (Phase 2): lighter touch, responsiveness over flourish ---------- */

/**
 * Small, quick rise for admin surfaces (table rows, stat cards). Shorter travel
 * and micro timing so dense data feels responsive, not showy. Pair with
 * `staggerContainer(0.03)` for a fast cascade.
 */
export const subtleRise: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: microTransition },
};

/* --- Standard whileInView props for scroll reveals ------------------------- */

/** Spread onto a scroll-revealed <m.*>: reveals once when 20% enters view. */
export const inViewProps = {
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: { once: true, amount: 0.2 },
};
