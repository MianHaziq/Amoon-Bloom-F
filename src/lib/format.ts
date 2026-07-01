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
 * Format a number as a currency string. Defaults to AED for the Amoon Bloom
 * boutique in Dubai; pass an explicit currency for other markets.
 */
export function formatCurrency(
  amount: number,
  currency: string = "AED",
  locale: string = "en-AE"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
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
