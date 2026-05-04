"use client";

import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addItem,
  clearCart,
  removeItem,
  updateQuantity,
} from "@/store/slices/cart.slice";
import type { Product } from "@/features/products/types";

export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const currency = items[0]?.currency ?? "USD";
    return { subtotal, itemCount, currency };
  }, [items]);

  const add = useCallback(
    (product: Product, quantity = 1) =>
      dispatch(addItem({ product, quantity })),
    [dispatch]
  );
  const update = useCallback(
    (productId: string, quantity: number) =>
      dispatch(updateQuantity({ productId, quantity })),
    [dispatch]
  );
  const remove = useCallback(
    (productId: string) => dispatch(removeItem(productId)),
    [dispatch]
  );
  const clear = useCallback(() => dispatch(clearCart()), [dispatch]);

  return { items, totals, add, update, remove, clear };
}
