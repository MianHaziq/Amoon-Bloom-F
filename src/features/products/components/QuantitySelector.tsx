"use client";

import { MinusIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";

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
  const { t } = useT();
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
      aria-label={t("product.quantity")}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label={t("product.decreaseQty")}
        className={cn(
          "inline-flex items-center justify-center rounded-s-full text-ink-700 transition-colors hover:text-bloom-700 disabled:cursor-not-allowed disabled:opacity-40",
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
        aria-label={t("product.increaseQty")}
        className={cn(
          "inline-flex items-center justify-center rounded-e-full text-ink-700 transition-colors hover:text-bloom-700 disabled:cursor-not-allowed disabled:opacity-40",
          sizeClasses
        )}
      >
        <PlusIcon size={14} />
      </button>
    </div>
  );
}
