"use client";

import { MinusIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  const sizeClasses =
    size === "sm"
      ? "h-9 w-9 text-sm"
      : "h-11 w-11 text-base";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-ink-200 bg-white",
        className
      )}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          "inline-flex items-center justify-center rounded-l-full text-ink-700 transition-colors hover:text-bloom-700 disabled:cursor-not-allowed disabled:opacity-40",
          sizeClasses
        )}
      >
        <MinusIcon size={14} />
      </button>
      <span
        className={cn(
          "min-w-10 text-center font-medium tabular-nums text-ink-900",
          size === "sm" && "min-w-8 text-sm"
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          "inline-flex items-center justify-center rounded-r-full text-ink-700 transition-colors hover:text-bloom-700 disabled:cursor-not-allowed disabled:opacity-40",
          sizeClasses
        )}
      >
        <PlusIcon size={14} />
      </button>
    </div>
  );
}
