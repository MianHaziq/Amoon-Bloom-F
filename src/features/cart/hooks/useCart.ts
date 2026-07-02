"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addToCart,
  setCartQuantity,
  removeFromCart,
  emptyCart,
} from "@/features/cart/cart.thunks";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import type { Product } from "@/features/products/types";

/**
 * Centralised cart accessor. Every mutation goes through the auth-aware cart
 * thunks: local (instant) for guests, mirrored to the server `/cart` for
 * signed-in users. Feature components stay decoupled from store internals and
 * from the guest-vs-server distinction.
 */
export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const { currency, locale } = useCurrency();

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    // The backend charges no shipping (order totalAmount = items − discount),
    // so the storefront must not invent a shipping fee — otherwise the total
    // shown wouldn't match the order the backend records.
    return {
      subtotal,
      shipping: 0,
      total: subtotal,
      itemCount,
      currency,
      locale,
      qualifiesForFreeShipping: false,
    };
  }, [items, currency, locale]);

  return {
    items,
    ...totals,
    add: (product: Product, quantity = 1) =>
      dispatch(addToCart(product, quantity)),
    remove: (productId: string) => dispatch(removeFromCart(productId)),
    setQuantity: (productId: string, quantity: number) =>
      dispatch(setCartQuantity(productId, quantity)),
    clear: () => dispatch(emptyCart()),
  };
}
