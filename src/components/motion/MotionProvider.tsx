"use client";

import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

/**
 * App-wide motion context.
 *
 *  • <LazyMotion features={domAnimation} strict> loads only the DOM animation
 *    feature bundle (~15kb) instead of the full feature set. `strict` makes the
 *    heavy `motion.*` components throw at dev time so we're forced to use the
 *    lightweight `m.*` components everywhere — keeping the bundle small.
 *  • <MotionConfig reducedMotion="user"> honours the OS "reduce motion" setting
 *    globally: transform/position animations collapse to opacity-only for users
 *    who opt out, so individual variants don't each need to branch. (A CSS
 *    fallback in globals.css covers the non-JS animations too.)
 *  • A default transition keeps any un-specified animation on the house easing.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ ease: EASE_OUT }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
