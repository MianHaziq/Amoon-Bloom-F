"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addItem,
  clearCart,
  removeItem,
  updateQuantity,
} from "@/store/slices/cart.slice";
import { siteConfig } from "@/config/site";
import type { Product } from "@/features/products/types";

/**
 * Centralised cart accessor. Wraps the redux slice so feature components
 * stay decoupled from store internals — useful when we move to server-side
 * carts later.
 */
export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const currency = items[0]?.currency ?? siteConfig.shipping.currency;
    const free = subtotal === 0 || subtotal >= siteConfig.shipping.freeOver;
    const shipping = free ? 0 : 25;
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      itemCount,
      currency,
      qualifiesForFreeShipping: free && subtotal > 0,
    };
  }, [items]);

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
