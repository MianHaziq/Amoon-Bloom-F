import type { Locale } from "@/store/slices/ui.slice";

/**
 * Compact relative time ("3h", "2d") for notification timestamps, localized via
 * Intl.RelativeTimeFormat. Falls back to a short absolute date past a week.
 */
export function relativeTime(iso: string, locale: Locale): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = then - Date.now();
  const absSec = Math.abs(diffMs) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "narrow" });

  const minute = 60;
  const hour = 3600;
  const day = 86_400;
  const week = day * 7;

  if (absSec < minute) return rtf.format(Math.round(diffMs / 1000), "second");
  if (absSec < hour) return rtf.format(Math.round(diffMs / 1000 / minute), "minute");
  if (absSec < day) return rtf.format(Math.round(diffMs / 1000 / hour), "hour");
  if (absSec < week) return rtf.format(Math.round(diffMs / 1000 / day), "day");

  return new Date(iso).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}
