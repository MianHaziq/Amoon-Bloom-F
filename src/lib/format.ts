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

export function formatDate(value: string | number | Date, locale = "en-AE") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

/**
 * Lightweight pluralisation helper.
 *   pluralize(1, "item") -> "1 item"
 *   pluralize(3, "item") -> "3 items"
 */
export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}
