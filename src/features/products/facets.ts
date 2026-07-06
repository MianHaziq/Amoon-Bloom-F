/**
 * Facet derivation for the shop PLP. The backend has no dedicated colour or
 * price-bucket model, so we derive both from the product set already loaded for
 * the page:
 *  - Colour comes from a product-option group whose title reads like "Colour"
 *    (EN or AR). If no product carries one, the colour facet renders nothing.
 *  - Price bounds come from the min/max sell price across the visible set.
 *
 * Everything here is pure and defensive — missing/odd data degrades to an empty
 * facet rather than throwing.
 */

import type { Product } from "./types";

/** Normalise an option label/value for matching: trimmed, lowercased, spaces
 *  and separators collapsed. Handles EN + AR. */
const norm = (s: string): string =>
  s.trim().toLowerCase().replace(/[\s_-]+/g, "");

/** Titles that mark an option group as "colour" (English + Arabic variants). */
const COLOR_TITLE = /^(colou?rs?|shade|اللون|لون|الألوان)$/;

/** Known colour name → swatch hex. Keys are normalised (see `norm`). Values not
 *  found here fall back to a neutral chip with the first letter shown. */
const SWATCHES: Record<string, string> = {
  black: "#131110",
  أسود: "#131110",
  white: "#ffffff",
  أبيض: "#ffffff",
  ivory: "#fffff0",
  عاجي: "#fffff0",
  cream: "#f9f3e6",
  كريمي: "#f9f3e6",
  beige: "#e7d8bf",
  بيج: "#e7d8bf",
  pink: "#f173a0",
  وردي: "#f173a0",
  زهري: "#f173a0",
  rose: "#e94c84",
  blush: "#f1bba6",
  red: "#dc2626",
  أحمر: "#dc2626",
  burgundy: "#7a1c40",
  نبيذي: "#7a1c40",
  maroon: "#7a1c40",
  orange: "#ea580c",
  برتقالي: "#ea580c",
  peach: "#ffcba4",
  خوخي: "#ffcba4",
  yellow: "#eab308",
  أصفر: "#eab308",
  gold: "#c9a35b",
  ذهبي: "#c9a35b",
  green: "#16a34a",
  أخضر: "#16a34a",
  sage: "#9caf88",
  teal: "#0d9488",
  blue: "#3b82f6",
  أزرق: "#3b82f6",
  navy: "#1e3a5f",
  كحلي: "#1e3a5f",
  purple: "#9333ea",
  بنفسجي: "#9333ea",
  lavender: "#c4b5fd",
  لافندر: "#c4b5fd",
  brown: "#92400e",
  بني: "#92400e",
  gray: "#6b7280",
  grey: "#6b7280",
  رمادي: "#6b7280",
  silver: "#cbd5e1",
  فضي: "#cbd5e1",
  multicolor: "conic-gradient(from 0deg,#f173a0,#eab308,#16a34a,#3b82f6,#9333ea,#f173a0)",
  متعدد: "conic-gradient(from 0deg,#f173a0,#eab308,#16a34a,#3b82f6,#9333ea,#f173a0)",
};

export interface ColorFacet {
  /** The colour value exactly as stored on the product option. */
  value: string;
  /** How many products in the set offer this colour. */
  count: number;
  /** CSS colour/gradient for the swatch, or undefined for unknown values. */
  swatch?: string;
  /** True when the swatch is pale and needs a visible ring (white/cream/etc). */
  needsRing: boolean;
}

const PALE = new Set([
  "white",
  "ivory",
  "cream",
  "beige",
  "أبيض",
  "عاجي",
  "كريمي",
  "بيج",
]);

/** Distinct colour values across the set, with counts and swatches. Sorted by
 *  descending frequency then alphabetically. Empty when no colour options. */
export function deriveColorFacets(products: Product[]): ColorFacet[] {
  const counts = new Map<string, number>();

  for (const p of products) {
    const group = p.options?.find((g) => COLOR_TITLE.test(norm(g.title)));
    if (!group) continue;
    // A product may list several colours; count each distinct one once.
    const seen = new Set<string>();
    for (const raw of group.options) {
      const value = raw.trim();
      if (!value || seen.has(value)) continue;
      seen.add(value);
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([value, count]) => {
      const key = norm(value);
      return {
        value,
        count,
        swatch: SWATCHES[key],
        needsRing: PALE.has(key),
      };
    })
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** True if this product offers any of the selected colours. */
export function productHasColor(product: Product, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const group = product.options?.find((g) => COLOR_TITLE.test(norm(g.title)));
  if (!group) return false;
  const owned = new Set(group.options.map((o) => norm(o)));
  return selected.some((c) => owned.has(norm(c)));
}

export interface ProductColor {
  value: string;
  swatch?: string;
  needsRing: boolean;
  /** Product photo assigned to this colour (from ProductOption.optionImages). */
  image?: string;
}

/** A single product's colour variants, mapped to swatches (and per-colour
 *  images when available) — for the dots on product cards. Empty when the
 *  product has no colour option. */
export function productColorSwatches(product: Product): ProductColor[] {
  const group = product.options?.find((g) => COLOR_TITLE.test(norm(g.title)));
  if (!group) return [];
  const seen = new Set<string>();
  const out: ProductColor[] = [];
  group.options.forEach((raw, i) => {
    const value = raw.trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    const key = norm(value);
    const image = group.optionImages?.[i]?.trim() || undefined;
    out.push({ value, swatch: SWATCHES[key], needsRing: PALE.has(key), image });
  });
  return out;
}

export interface PriceBounds {
  min: number;
  max: number;
}

/** Min/max sell price across the set, rounded outward to whole units. Returns
 *  null when the set is empty or degenerate (all one price). */
export function derivePriceBounds(products: Product[]): PriceBounds | null {
  if (products.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const p of products) {
    const a = p.price.amount;
    if (a < min) min = a;
    if (a > max) max = a;
  }
  min = Math.floor(min);
  max = Math.ceil(max);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return null;
  return { min, max };
}
