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

/**
 * A cart LINE's full discriminator: the variant (colour/size) PLUS the per-line
 * add-on selections that make a line distinct — the personalized custom name, the
 * "include a gift card?" toggle, and the gift card's message.
 *
 * These make a line distinct the same way a colour does — so buying the same
 * product+variant with a DIFFERENT name ("Osama" vs "Ali"), a DIFFERENT gift-card
 * message ("Happy Birthday" vs "Congrats"), or one line with a gift card and one
 * without, yields separate cart lines (each with its own quantity, name, message
 * and price) instead of the last add silently overwriting the first. This is what
 * makes personalization PER-UNIT: a quantity of N is added as N one-quantity
 * configs, and identical configs merge back into one line while distinct ones
 * stay separate. A blank name + no gift card falls back to the pure variant key,
 * so non-personalized products are completely unaffected and still merge as
 * before. Both add-ons also change the line price, so folding them into identity
 * keeps merged quantities correctly priced.
 *
 * Folded into the stored `variantKey` (rather than added as new dimensions) so
 * every existing line-targeting path — update quantity / remove / message, the
 * React keys, and the DB's `@@unique([cartId, productId, variantKey])` — keeps
 * working with no migration. Kept byte-for-byte identical to the backend's
 * `lineVariantKey()` so client and server always agree on line identity.
 */
export interface LineCashArrangement {
  cashAmount: number;
  denomination?: number | null;
  note?: string | null;
}

export function lineVariantKey(
  selectedOptions?: Record<string, string> | null,
  customName?: string | null,
  giftCardSelected?: boolean,
  giftMessage?: string | null,
  cashArrangement?: LineCashArrangement | null
): string {
  const base = variantKeyOf(selectedOptions);
  const segments: string[] = [];
  const name = (customName ?? "").trim();
  // Encode the free-text name/message so they can't contain the segment
  // delimiters ("|", "=") and forge another segment — e.g. a literal name
  // "X|__gc=1" must NOT collide with name "X" + gift card. encodeURIComponent is
  // identical in the browser and Node, preserving client/server key parity.
  if (name) segments.push(`__name=${encodeURIComponent(name)}`);
  if (giftCardSelected) segments.push("__gc=1");
  const message = (giftMessage ?? "").trim();
  if (message) segments.push(`__gm=${encodeURIComponent(message)}`);
  // Per-unit cash arrangement. Amount normalized to 2dp (integer-cents-then-back) so 500 and
  // 500.00 collapse to the same segment. MUST stay byte-for-byte identical to the backend's
  // lineVariantKey() (same segment order + encoding).
  if (cashArrangement && Number(cashArrangement.cashAmount) > 0) {
    const amt = Math.round(Number(cashArrangement.cashAmount) * 100) / 100;
    segments.push(`__ca=${amt}`);
    if (cashArrangement.denomination != null && Number(cashArrangement.denomination) > 0) {
      segments.push(`__cad=${Math.trunc(Number(cashArrangement.denomination))}`);
    }
    const cnote = (cashArrangement.note ?? "").trim();
    if (cnote) segments.push(`__can=${encodeURIComponent(cnote)}`);
  }
  if (segments.length === 0) return base;
  const extra = segments.join("|");
  return base ? `${base}|${extra}` : extra;
}

/** A cart line's stable identity for React keys and lookups: product + variant. */
export function cartLineKey(productId: string, variantKey?: string | null): string {
  return `${productId}::${variantKey ?? ""}`;
}
