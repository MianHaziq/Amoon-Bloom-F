"use client";

import { m } from "motion/react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  inViewProps,
  hoverLift,
  type Direction,
} from "@/lib/motion";
import { useT } from "@/i18n/useT";

/**
 * Thin "use client" motion wrappers so server components can animate their
 * subtrees without themselves becoming client components — the server-rendered
 * `children` are passed straight through. Everything here uses `m.*` (required
 * by LazyMotion `strict`) and pulls timing/variants from lib/motion.ts.
 */

type MotionTag = "div" | "section" | "ul" | "li" | "article" | "span";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Which element to render. Defaults to a div. */
  as?: MotionTag;
  /** Stagger delay applied to this single reveal (seconds). */
  delay?: number;
  /** Use a scale entrance instead of the default fade-up. */
  variant?: "up" | "scale";
}

/**
 * Scroll reveal: fades + rises into place once when ~20% enters the viewport.
 * The house default for section entrances and standalone blocks.
 */
export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  variant = "up",
}: RevealProps) {
  const Tag = m[as];
  const variants = variant === "scale" ? scaleIn : fadeInUp;
  return (
    <Tag
      className={className}
      variants={variants}
      {...inViewProps}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Tag>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  as?: MotionTag;
  /** Seconds between each child. */
  stagger?: number;
  /** Reveal on scroll (default) or immediately on mount. */
  trigger?: "inView" | "mount";
}

/**
 * Stagger container — reveals its <StaggerItem> children in sequence. Wrap a
 * grid/list with this and each cell in <StaggerItem>.
 */
export function StaggerGroup({
  children,
  className,
  as = "div",
  stagger = 0.07,
  trigger = "inView",
}: StaggerProps) {
  const Tag = m[as];
  const triggerProps =
    trigger === "mount"
      ? { initial: "hidden" as const, animate: "show" as const }
      : inViewProps;
  return (
    <Tag className={className} variants={staggerContainer(stagger)} {...triggerProps}>
      {children}
    </Tag>
  );
}

/** A child of <StaggerGroup>. Inherits the container's reveal orchestration. */
export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: MotionTag;
}) {
  const Tag = m[as];
  return (
    <Tag className={className} variants={staggerItem}>
      {children}
    </Tag>
  );
}

/**
 * Card hover-lift wrapper. Adds a transform-only lift on hover + press feedback.
 * Also reveals on scroll so it composes as a standalone animated card.
 */
export function HoverCard({
  children,
  className,
  as = "div",
  reveal = true,
}: {
  children: ReactNode;
  className?: string;
  as?: MotionTag;
  reveal?: boolean;
}) {
  const Tag = m[as];
  const revealProps = reveal
    ? { variants: fadeInUp, ...inViewProps }
    : {};
  return (
    <Tag className={className} {...revealProps} {...hoverLift}>
      {children}
    </Tag>
  );
}

/**
 * Escape hatch: a plain `m.<tag>` with the current reading direction supplied,
 * for one-off client-side animations that need `dir` (RTL-aware slides).
 * `render` receives the resolved direction.
 */
export function WithDirection({
  render,
}: {
  render: (dir: Direction) => ReactNode;
}) {
  const { dir } = useT();
  return <>{render(dir)}</>;
}

/** Re-export the low-level `m` for components that already are "use client". */
export { m } from "motion/react";
export type MotionElementProps<T extends ElementType> =
  ComponentPropsWithoutRef<T>;
