"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";

interface PriceRangeSliderProps {
  /** Absolute bounds of the whole catalogue set. */
  min: number;
  max: number;
  /** Current selection. */
  value: { min: number; max: number };
  onChange: (next: { min: number; max: number }) => void;
  step?: number;
  /** Formats an amount for the value labels (e.g. currency). */
  format: (amount: number) => ReactNode;
  className?: string;
}

/**
 * Accessible dual-thumb price slider. Two range inputs share a track; the fill
 * between the thumbs is drawn with `inset-inline` percentages so it flips
 * automatically under RTL. Thumbs are kept at least one step apart.
 */
export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  format,
  className,
}: PriceRangeSliderProps) {
  const { t } = useT();
  const span = Math.max(max - min, 1);
  const lowPct = ((value.min - min) / span) * 100;
  const highPct = ((value.max - min) / span) * 100;

  const setLow = useCallback(
    (next: number) => onChange({ min: Math.min(next, value.max - step), max: value.max }),
    [onChange, value.max, step]
  );
  const setHigh = useCallback(
    (next: number) => onChange({ min: value.min, max: Math.max(next, value.min + step) }),
    [onChange, value.min, step]
  );

  const fill = useMemo(
    () => ({
      insetInlineStart: `${Math.max(0, Math.min(lowPct, 100))}%`,
      insetInlineEnd: `${Math.max(0, Math.min(100 - highPct, 100))}%`,
    }),
    [lowPct, highPct]
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative h-5">
        {/* Rail */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-100" />
        {/* Selected fill */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-bloom-500"
          style={fill}
        />
        <input
          type="range"
          className="range-input"
          min={min}
          max={max}
          step={step}
          value={value.min}
          aria-label={t("a11y.minimumPrice")}
          onChange={(e) => setLow(Number(e.target.value))}
        />
        <input
          type="range"
          className="range-input"
          min={min}
          max={max}
          step={step}
          value={value.max}
          aria-label={t("a11y.maximumPrice")}
          onChange={(e) => setHigh(Number(e.target.value))}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="rounded-lg bg-cream-100 px-2.5 py-1 font-medium tabular-nums text-ink-800">
          {format(value.min)}
        </span>
        <span className="text-ink-300">—</span>
        <span className="rounded-lg bg-cream-100 px-2.5 py-1 font-medium tabular-nums text-ink-800">
          {format(value.max)}
        </span>
      </div>
    </div>
  );
}
