import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone =
  | "neutral"
  | "bloom"
  | "blush"
  | "gold"
  | "success"
  | "warning"
  | "danger"
  | "ink";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  bloom: "bg-bloom-100 text-bloom-800",
  blush: "bg-blush-100 text-blush-400",
  gold: "bg-[color:var(--color-gold-500)]/15 text-[color:var(--color-gold-600)]",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  ink: "bg-ink-900 text-cream-50",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  uppercase?: boolean;
}

export function Badge({
  tone = "neutral",
  uppercase = true,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.12em]",
        uppercase && "uppercase",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
