import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "elevated" | "flat" | "ghost" | "outlined";
type Padding = "none" | "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  elevated: "bg-white shadow-(--shadow-soft) hover:shadow-(--shadow-lift)",
  flat: "bg-white border border-ink-100",
  ghost: "bg-cream-50",
  outlined: "border border-ink-200 bg-transparent",
};

const paddingStyles: Record<Padding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  interactive?: boolean;
}

export function Card({
  variant = "elevated",
  padding = "md",
  interactive,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300",
        variantStyles[variant],
        paddingStyles[padding],
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 active:translate-y-0",
        className
      )}
      {...props}
    />
  );
}
