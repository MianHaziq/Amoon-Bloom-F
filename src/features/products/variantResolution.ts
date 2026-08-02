import type { Product, ProductOptionGroup, ProductVariant } from "./types";

/**
 * Resolves which `ProductVariant` a `selectedOptions` map (e.g. `{Size: "Medium"}`,
 * keyed by the option group's title like `AddToCartPanel` sends to the API) picks —
 * the single source of truth for BOTH the PDP's live price/photo swap
 * (`PdpImageContext`) and the guest (not-signed-in) local cart reducer
 * (`cart.slice.ts`), which has no server round-trip to resolve it for. Always
 * returns a variant when the product has any (falling back to the row flagged
 * `isDefault`, else the first) so a line always has a definite price even if the
 * selection is missing/stale — mirrors `resolveVariantPricing` in the backend's
 * product.service.js.
 */
export function resolveVariantForSelection(
  product: Pick<Product, "options" | "variants">,
  selectedOptions?: Record<string, string> | null
): ProductVariant | null {
  if (!product.variants?.length) return null;
  const fallback = product.variants.find((v) => v.isDefault) ?? product.variants[0] ?? null;

  const axisGroup = product.options?.find((o) => o.isVariantAxis);
  if (!axisGroup || !selectedOptions) return fallback;

  const chosen = selectedOptions[axisGroup.title];
  if (!chosen) return fallback;

  const match = product.variants.find(
    (v) => v.optionValue === chosen || v.optionValue_ar === chosen
  );
  return match ?? fallback;
}

/** Effective per-unit price for a variant (discounted only when it's actually lower —
 *  same rule used everywhere else in this codebase, client and server). */
export function effectiveVariantPrice(variant: ProductVariant): number {
  return variant.discountedPrice != null && variant.discountedPrice < variant.price
    ? variant.discountedPrice
    : variant.price;
}

/**
 * Photo-swap resolution for a product's option groups — the single source of truth
 * shared by `PdpImageContext` (the PDP gallery) and `AddToCartPanel` (the cart-line
 * thumbnail), so they can never drift into two different ideas of "which photo
 * matches this selection."
 *
 * A product can have ANY NUMBER of option groups carrying their own photos — not just
 * one. E.g. a priced "Size" axis with its own per-size box photos, AND a separate
 * "Colour"/"Color Theme" group with its own per-colour photos, on the SAME product.
 * There's no per-COMBINATION photo (no "Small+Red" photo distinct from "Small" and
 * "Red" individually) — that would need a real variant-matrix redesign. Instead,
 * groups are ordered by their own order in `product.options` (however the admin
 * arranged them) as the DEFAULT/fallback priority, but whichever group the shopper
 * MOST RECENTLY picked a photo-bearing value from wins over that default — matches
 * what a shopper actually expects (pick a new colour, the photo updates to it; pick
 * a new size, the photo updates to that instead) rather than one axis's photo being
 * permanently stuck in front of the other's. Falls through to the next photo-bearing
 * group (by the default order) whenever neither the preferred nor current pick has a
 * photo of its own, so a size with no photo of its own never blanks out a colour's
 * photo, and vice versa.
 */

/** Every option group that carries at least one photo, in priority order (their
 *  order in `options`). Groups with no photos at all (e.g. a plain informational
 *  "Color Theme: Pink/Red" with no swatch images) are simply not photo-bearing and
 *  never compete for the gallery. */
export function photoBearingGroups(
  options: ProductOptionGroup[] | undefined
): ProductOptionGroup[] {
  return (options ?? []).filter(
    (o) =>
      o.optionImages?.some((u) => u?.trim()) ||
      o.optionImageSets?.some((set) => set.some((u) => u?.trim()))
  );
}

/** The photo set for one specific value within one group — its multi-photo
 *  `optionImageSets` entry when present, else its single `optionImages` entry. */
function imagesForValue(group: ProductOptionGroup, value: string | undefined): string[] {
  if (!value) return [];
  const idx = group.options.indexOf(value);
  if (idx < 0) return [];
  const set = (group.optionImageSets?.[idx] ?? [])
    .map((u) => u?.trim())
    .filter(Boolean) as string[];
  if (set.length > 0) return set;
  const single = group.optionImages?.[idx]?.trim();
  return single ? [single] : [];
}

/** Resolves the ACTIVE photo-bearing group for the current selection.
 *
 * @param preferredGroupId the group the shopper most recently picked a
 *   photo-bearing value from (see the PdpImageContext `lastPickedPhotoGroupId`
 *   tracker) — wins over the default order when it still has a photo for its
 *   current selection. Omit for a one-shot "what does the current selection look
 *   like" read with no recency preference (e.g. a cart-line thumbnail).
 * @returns null when no photo-bearing group's current selection has a photo at
 *   all (caller should fall back to the plain product images).
 */
export function resolveActivePhotoGroup(
  options: ProductOptionGroup[] | undefined,
  selected: Record<string, string>,
  preferredGroupId?: string | null
): { group: ProductOptionGroup; images: string[] } | null {
  const groups = photoBearingGroups(options);
  if (preferredGroupId) {
    const preferred = groups.find((g) => g.id === preferredGroupId);
    if (preferred) {
      const images = imagesForValue(preferred, selected[preferred.id]);
      if (images.length > 0) return { group: preferred, images };
    }
  }
  for (const group of groups) {
    const images = imagesForValue(group, selected[group.id]);
    if (images.length > 0) return { group, images };
  }
  return null;
}

/** One representative photo for a specific value in a specific group — used where
 *  only a single thumbnail is needed (e.g. a cart-line icon), not the full gallery. */
export function firstImageForValue(
  group: ProductOptionGroup,
  value: string | undefined
): string | undefined {
  return imagesForValue(group, value)[0];
}
