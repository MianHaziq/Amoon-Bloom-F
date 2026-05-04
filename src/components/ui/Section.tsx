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
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-32",
  xl: "py-24 md:py-40",
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
        "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          align === "center" && "items-center"
        )}
      >
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-3xl font-medium leading-tight text-ink-900 md:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "max-w-2xl text-base leading-relaxed text-ink-500",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
