import type { CartItem } from "@/store/slices/cart.slice";
import type { ApiCart } from "./api-types";

/**
 * Map the server cart (`/cart`) into the storefront's Redux `CartItem[]`.
 *
 * The storefront uses the product UUID as its URL slug (see products/adapters),
 * so `slug = product.id`. `unitPrice` is derived from the server's `lineTotal /
 * quantity` — that's the EFFECTIVE (discount-aware) price the backend actually
 * charges, so the storefront subtotal always matches the order the backend
 * records. Currency is left blank here; the cart UI formats via `useCurrency()`
 * (region-derived), never the per-item currency.
 */
export function apiCartToCartItems(cart: ApiCart): CartItem[] {
  return cart.items.map((it) => {
    const unitPrice =
      it.quantity > 0
        ? Math.round((it.lineTotal / it.quantity) * 100) / 100
        : it.product.discountedPrice ?? it.product.price;
    return {
      productId: it.productId,
      slug: it.product.id,
      title: it.product.title,
      imageUrl: it.product.image ?? it.product.images?.[0],
      unitPrice,
      currency: "",
      quantity: it.quantity,
      message: it.message,
      selectedOptions: it.selectedOptions ?? null,
    };
  });
}
