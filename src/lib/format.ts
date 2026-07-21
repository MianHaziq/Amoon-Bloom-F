import type { Locale } from "@/store/slices/ui.slice";

/**
 * Map the app locale ("en"/"ar") to a BCP-47 tag for Intl formatting. Arabic
 * uses the Latin numbering system (`-nu-latn`) so dates and prices keep Western
 * digits — matching Gulf e-commerce convention and the tabular-nums layout —
 * while month/label text still localizes to Arabic.
 */
export function intlLocale(locale: Locale = "en"): string {
  return locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE";
}

/**
 * Format just the numeric part of a price (no currency marker at all) —
 * shared by formatCurrency() and the <CurrencyAmount> component so the
 * digit formatting logic lives in exactly one place.
 */
export function formatAmount(amount: number, locale: string = "en-AE") {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/**
 * Format a number as a plain-text currency string, e.g. "AED 30.00". Neither
 * AED nor SAR has a symbol recognized by Intl's "currency" style (it already
 * falls back to the ISO code), so this just makes that explicit.
 *
 * This is for TEXT-ONLY contexts that can't render a React icon — toast
 * messages, i18n string interpolation, `title`/`aria-label` attributes,
 * printable receipts. For any visual/JSX price display, use <CurrencyAmount>
 * instead — it renders the real AED/SAR currency sign (traced from the
 * official CBUAE/SAMA artwork) rather than the 3-letter code.
 */
export function formatCurrency(
  amount: number,
  currency: string = "AED",
  locale: string = "en-AE"
) {
  return `${currency} ${formatAmount(amount, locale)}`;
}

/**
 * Abbreviated form for large aggregate figures — e.g. "AED 11.9K" instead of
 * "AED 11,883.85". For admin dashboard/analytics KPI tiles where the exact
 * cents don't matter and a big number reads faster abbreviated. Values under
 * 1000 render as-is (Intl's "compact" notation only kicks in once it helps),
 * so this is safe to use even when the figure might sometimes be small.
 * Never use this for a specific order/line-item amount — use formatCurrency
 * there, where exact cents matter.
 */
export function formatCompactCurrency(
  amount: number,
  currency: string = "AED",
  locale: string = "en-AE"
) {
  const compact = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
  return `${currency} ${compact}`;
}

export function formatDate(value: string | number | Date, locale = "en-AE") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

/** Like formatDate, but also renders the time — for anything with a customer-chosen
 * or otherwise time-specific moment (e.g. a Scheduled Delivery slot), where the date
 * alone would hide information the viewer actually needs. */
export function formatDateTime(value: string | number | Date, locale = "en-AE") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

/** Adds `days` whole days to `value`, returned as a new Date. Used to compute a
 * Standard Delivery's estimated arrival from its order date + snapshot lead time. */
export function addDays(value: string | number | Date, days: number): Date {
  const d = new Date(value);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Lightweight pluralisation helper.
 *   pluralize(1, "item") -> "1 item"
 *   pluralize(3, "item") -> "3 items"
 */
export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}
