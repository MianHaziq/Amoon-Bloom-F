"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addItem,
  clearCart,
  removeItem,
  updateQuantity,
} from "@/store/slices/cart.slice";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import type { Product } from "@/features/products/types";

/**
 * Centralised cart accessor. Wraps the redux slice so feature components
 * stay decoupled from store internals — useful when we move to server-side
 * carts later.
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
      dispatch(addItem({ product, quantity })),
    remove: (productId: string) => dispatch(removeItem(productId)),
    setQuantity: (productId: string, quantity: number) =>
      dispatch(updateQuantity({ productId, quantity })),
    clear: () => dispatch(clearCart()),
  };
}
