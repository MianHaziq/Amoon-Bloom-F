"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { toUiProducts } from "@/features/products/adapters";
import { queryKeys } from "@/services/queryKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCart } from "@/features/cart/hooks/useCart";
import { useT } from "@/i18n/useT";
import { cartApi } from "../api/cart.api";

/**
 * "You may also like" — server-driven cart suggestions (`/cart/suggestions`).
 * The endpoint is auth-only and derives picks from the cart's categories, so we
 * only fetch when the user is signed in and the cart is non-empty. Renders
 * nothing when there's nothing to suggest.
 */
export function CartSuggestions() {
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { t, locale } = useT();

  const query = useQuery({
    queryKey: queryKeys.cart.suggestions({ discoverLimit: 4 }),
    queryFn: () => cartApi.suggestions({ discoverLimit: 4 }),
    enabled: isAuthenticated && itemCount > 0,
    staleTime: 60_000,
  });

  if (!isAuthenticated || itemCount === 0) return null;

  // Prefer the cross-category "discover" picks; fall back to the first
  // same-category section so the row still fills if discover came back empty.
  const apiProducts =
    query.data?.discover?.length
      ? query.data.discover
      : query.data?.sections?.[0]?.products ?? [];
  const products = toUiProducts(apiProducts, { locale }).slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-8 font-display text-2xl font-medium text-ink-900">
        {t("cart.youMayAlsoLike")}
      </h2>
      <ProductGrid products={products} columns={4} />
    </section>
  );
}
