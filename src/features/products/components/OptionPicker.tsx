"use client";

import { cn } from "@/lib/cn";

interface OptionPickerProps {
  title: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
}

export function OptionPicker({
  title,
  options,
  value,
  onChange,
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
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              aria-pressed={selected}
              className={cn(
                "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-all",
                selected
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-900 hover:border-ink-400"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
