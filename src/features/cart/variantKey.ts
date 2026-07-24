/**
 * Stable, normalized serialization of a `selectedOptions` map — the cart's
 * variant discriminator so the SAME product chosen in different variants (e.g.
 * Black vs White) is a separate cart line, Amazon/Shopify-style, instead of one
 * line whose selection gets overwritten.
 *
 * Deterministic (keys sorted, empty values dropped) and byte-for-byte identical
 * to the backend's `variantKeyOf()` so client and server agree on line identity.
 * Returns "" when there's no meaningful selection (matches no-variant products).
 */
export function variantKeyOf(
  selectedOptions?: Record<string, string> | null
): string {
  if (!selectedOptions || typeof selectedOptions !== "object") return "";
  const keys = Object.keys(selectedOptions)
    .filter((k) => selectedOptions[k] != null && String(selectedOptions[k]).trim() !== "")
    .sort();
  if (keys.length === 0) return "";
  return keys.map((k) => `${k}=${String(selectedOptions[k]).trim()}`).join("|");
}

/** A cart line's stable identity for React keys and lookups: product + variant. */
export function cartLineKey(productId: string, variantKey?: string | null): string {
  return `${productId}::${variantKey ?? ""}`;
}
