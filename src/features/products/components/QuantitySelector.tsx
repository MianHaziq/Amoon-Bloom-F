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

  // A clean rounded box (not a stretched pill); md matches the xl button's height so it can
  // sit inline with Add to cart, sm is the compact cart-drawer stepper.
  const boxH = size === "sm" ? "h-9" : "h-14";
  const btnW = size === "sm" ? "w-9" : "w-12";
  const numW = size === "sm" ? "min-w-7 text-sm" : "min-w-10 text-base";
  const iconSize = size === "sm" ? 14 : 16;
  const btn =
    "inline-flex items-center justify-center text-ink-600 transition-colors duration-150 hover:bg-cream-50 hover:text-bloom-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-2xl border border-ink-200 bg-white",
        boxH,
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
        className={cn(btn, btnW, "border-e border-ink-100")}
      >
        <MinusIcon size={iconSize} />
      </button>
      <span className={cn("flex items-center justify-center text-center font-semibold tabular-nums text-ink-900", numW)} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label={t("product.increaseQty")}
        className={cn(btn, btnW, "border-s border-ink-100")}
      >
        <PlusIcon size={iconSize} />
      </button>
    </div>
  );
}
