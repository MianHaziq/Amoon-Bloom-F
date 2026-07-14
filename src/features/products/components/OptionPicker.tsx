"use client";

import { cn } from "@/lib/cn";

interface OptionPickerProps {
  title: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  /** Optional per-value swatch colours (hex), aligned by index with `options`. When set, each pill gets a colour dot. */
  colors?: string[];
}

export function OptionPicker({
  title,
  options,
  value,
  onChange,
  colors,
}: OptionPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
          {title}
        </p>
        {value && <p className="text-xs text-ink-500">{value}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => {
          const selected = value === opt;
          const swatch = colors?.[i]?.trim();
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              aria-pressed={selected}
              title={opt}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all",
                selected
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-900 hover:border-ink-400"
              )}
            >
              {swatch ? (
                <span
                  aria-hidden
                  className={cn(
                    "inline-block h-3.5 w-3.5 shrink-0 rounded-full ring-1",
                    selected ? "ring-white/70" : "ring-ink-900/10"
                  )}
                  style={{ backgroundColor: swatch }}
                />
              ) : null}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
