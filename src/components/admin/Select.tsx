"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  triggerClassName?: string;
  "aria-label"?: string;
}

/**
 * Custom listbox to replace native `<select>` in admin filter toolbars — a
 * native select's option list is rendered by the OS and can't be restyled
 * (stuck with the browser's default blue highlight), which read as out of
 * place next to the rest of the admin UI.
 */
export function Select({
  value,
  onChange,
  options,
  className,
  triggerClassName,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          "flex min-w-32 items-center justify-between gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:border-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500/40",
          open && "border-bloom-500 ring-2 ring-bloom-500/20",
          triggerClassName
        )}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-ink-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute inset-s-0 top-full z-30 mt-2 min-w-full overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-(--shadow-lift) animate-fade-in-up"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 whitespace-nowrap px-3.5 py-2 text-start text-sm transition-colors",
                  isSelected
                    ? "bg-bloom-50 font-medium text-bloom-700"
                    : "text-ink-700 hover:bg-bloom-50 hover:text-bloom-700"
                )}
              >
                {opt.label}
                {isSelected ? <CheckIcon size={14} className="shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
