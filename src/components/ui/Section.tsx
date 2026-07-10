import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

type Tone = "default" | "cream" | "blush" | "ink";
type Spacing = "sm" | "md" | "lg" | "xl";

const toneMap: Record<Tone, string> = {
  default: "bg-white",
  cream: "bg-cream-50",
  blush: "bg-blush-50",
  ink: "bg-ink-900 text-cream-50",
};

const spacingMap: Record<Spacing, string> = {
  sm: "py-8 sm:py-10 md:py-12",
  md: "py-10 sm:py-12 md:py-16",
  lg: "py-12 sm:py-16 md:py-20",
  xl: "py-14 sm:py-20 md:py-28",
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: Tone;
  spacing?: Spacing;
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
  containerClassName?: string;
}

export function Section({
  tone = "default",
  spacing = "md",
  containerSize = "lg",
  containerClassName,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(toneMap[tone], spacingMap[spacing], className)} {...props}>
      <Container size={containerSize} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        // Center-aligned sections (editorial blocks) keep the column layout
        // Left-aligned sections: title + action sit on the same row on ALL
        // viewports — matches the Shopify / H&M mobile pattern where "View all"
        // appears inline-right of the heading instead of stacking below it.
        align === "center"
          ? "flex flex-col items-center gap-3 text-center"
          : "flex items-center justify-between gap-4 md:items-end",
        className
      )}
    >
      <div className={cn("flex flex-col gap-2", align === "center" && "items-center")}>
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-2xl font-medium leading-tight text-ink-900 sm:text-3xl md:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              // Hide description on mobile — keeps the header compact and
              // consistent across regions (some sections ship with a desc,
              // others don't, causing uneven mobile layouts per region).
              "hidden max-w-2xl text-base leading-relaxed text-ink-500 md:block",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </div>
  );
}
