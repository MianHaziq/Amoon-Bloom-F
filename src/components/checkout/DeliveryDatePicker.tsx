"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ChevronLeft, ChevronRight, CalendarIcon } from "@/components/icons";
import { intlLocale } from "@/lib/format";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { useT } from "@/i18n/useT";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Build a "YYYY-MM-DD" key from explicit calendar parts — pure string math, no Date
 *  instant, so it is timezone-neutral (never shifts a day the way local/UTC getters can). */
function dateKey(year: number, month0: number, day: number): string {
  return `${year}-${pad(month0 + 1)}-${pad(day)}`;
}

/** { year, month0 } of a "YYYY-MM-DD" key. */
function partsOf(key: string): { year: number; month0: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month0: m - 1 };
}

// A fixed reference week (Jan 1-7, 2023: Sun-Sat) purely to read each weekday's
// localized narrow label — the actual date is irrelevant, only day-of-week matters.
const WEEKDAY_REFERENCE = Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + i));

interface DeliveryDatePickerProps {
  /** Selected day as "YYYY-MM-DD", or "" for no selection (optional field). */
  value: string;
  onChange: (v: string) => void;
  /** Earliest selectable day, as a "YYYY-MM-DD" key anchored to the business timezone
   *  (Asia/Dubai) — see CheckoutClient. Keys are compared as strings, so the picker's
   *  selectable window always matches the backend's day-boundary check regardless of
   *  the customer's own device timezone. */
  minKey: string;
  maxKey: string;
  /** Today, as a business-timezone "YYYY-MM-DD" key (for the "today" ring only). */
  todayKey: string;
  "aria-label"?: string;
  hasError?: boolean;
}

/**
 * Custom date-only calendar for "reserve delivery for a future date" — replaces the
 * OS-native <input type="datetime-local"> (unstylable, and collected a time-of-day
 * the business never actually uses; a booking only ever needs a day). Operates purely
 * on "YYYY-MM-DD" string keys so it is timezone-safe. Responsive: the popover clamps to
 * the viewport width so it never overflows on narrow phones.
 */
export function DeliveryDatePicker({
  value,
  onChange,
  minKey,
  maxKey,
  todayKey,
  hasError,
  ...rest
}: DeliveryDatePickerProps) {
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  // Calendar cursor — only its year/month are ever read (never converted to an instant).
  const [view, setView] = useState<{ year: number; month0: number }>(() =>
    partsOf(value || minKey)
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const tag = intlLocale(locale);

  // Static per-locale — narrow weekday labels for the header row.
  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(tag, { weekday: "narrow" });
    return WEEKDAY_REFERENCE.map((d) => fmt.format(d));
  }, [tag]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(tag, { month: "long", year: "numeric" }).format(
        new Date(view.year, view.month0, 1)
      ),
    [tag, view.year, view.month0]
  );

  const daysInMonth = new Date(view.year, view.month0 + 1, 0).getDate();
  // Day-of-week of the 1st: constructed and read in the same (local) frame, so the
  // weekday is the true weekday of that calendar date regardless of timezone.
  const leadingBlanks = new Date(view.year, view.month0, 1).getDay();

  const firstOfViewKey = dateKey(view.year, view.month0, 1);
  const lastOfViewKey = dateKey(view.year, view.month0, daysInMonth);
  const canGoPrev = firstOfViewKey > minKey;
  const canGoNext = lastOfViewKey < maxKey;

  const selectedLabel = value
    ? new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(`${value}T00:00:00`)
      )
    : t("checkout.selectDatePlaceholder");

  const goMonth = (delta: number) =>
    setView((v) => {
      const next = new Date(v.year, v.month0 + delta, 1);
      return { year: next.getFullYear(), month0: next.getMonth() };
    });

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-2 rounded-2xl border bg-white px-4 text-start text-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bloom-100",
          hasError
            ? "border-(--color-danger)"
            : "border-ink-200 hover:border-ink-300 focus-visible:border-bloom-400",
          value ? "text-ink-900" : "text-ink-400"
        )}
        {...rest}
      >
        <span className="truncate">{selectedLabel}</span>
        <CalendarIcon size={16} className="shrink-0 text-ink-400" />
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            role="dialog"
            aria-label={t("checkout.scheduledDelivery")}
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
            className="absolute start-0 top-[calc(100%+0.5rem)] z-50 w-[min(20rem,calc(100vw-2.5rem))] origin-top rounded-2xl border border-ink-100 bg-white p-4 shadow-(--shadow-lift)"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => goMonth(-1)}
                aria-label={t("product.previousImage")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft size={16} className="rtl:-scale-x-100" />
              </button>
              <p className="font-display text-sm font-medium text-ink-900">{monthLabel}</p>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => goMonth(1)}
                aria-label={t("product.nextImage")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight size={16} className="rtl:-scale-x-100" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              {weekdayLabels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlanks }, (_, i) => (
                <span key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const key = dateKey(view.year, view.month0, day);
                const disabled = key < minKey || key > maxKey;
                const selected = key === value;
                const isToday = key === todayKey;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors",
                      disabled
                        ? "cursor-not-allowed text-ink-300"
                        : selected
                          ? "bg-bloom-600 font-semibold text-white"
                          : "text-ink-700 hover:bg-bloom-50",
                      isToday && !selected && "ring-1 ring-inset ring-ink-300"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {value ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="mt-3 text-xs font-medium text-bloom-700 underline underline-offset-2 hover:text-bloom-800"
              >
                {t("checkout.clearDate")}
              </button>
            ) : null}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
