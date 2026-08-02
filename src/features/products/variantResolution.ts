import type { Product, ProductVariant } from "./types";

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
