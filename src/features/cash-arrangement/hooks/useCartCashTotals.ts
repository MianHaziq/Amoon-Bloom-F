"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cashArrangementApi } from "@/features/cash-arrangement/api/cash-arrangement.api";
import { computeCashArrangementFee } from "@/features/cash-arrangement/cashArrangementFee";
import { queryKeys } from "@/services/queryKeys";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import type { CartItem } from "@/store/slices/cart.slice";

/**
 * Rolls up the raw cash amount + service fee across every cart line's cash
 * arrangement (each × quantity) — the same math CheckoutClient's total already
 * uses, so the cart drawer/page preview never shows a lower running total than
 * what checkout will actually charge. Region-only resolve (no zone yet, mirrors
 * the PDP) — checkout re-resolves with the real zone once one is chosen.
 */
export function useCartCashTotals(items: CartItem[]) {
  const { countryCode: regionCode } = useCurrency();
  const cashProductIds = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .filter((i) => i.cashArrangement && i.cashArrangement.cashAmount > 0)
            .map((i) => i.productId)
        )
      ).sort(),
    [items]
  );

  const query = useQuery({
    queryKey: queryKeys.cashArrangement.resolve(regionCode, undefined, cashProductIds),
    queryFn: () =>
      cashArrangementApi.resolve({
        cartLines: cashProductIds.map((productId) => ({ productId })),
      }),
    enabled: Boolean(regionCode) && cashProductIds.length > 0,
  });

  return useMemo(() => {
    if (cashProductIds.length === 0) return { cashRawTotal: 0, cashFeeTotal: 0 };
    const scheduleByProduct = new Map((query.data?.lines ?? []).map((l) => [l.productId, l]));
    let cashRawTotal = 0;
    let cashFeeTotal = 0;
    for (const item of items) {
      const cash = item.cashArrangement;
      if (!cash || !(cash.cashAmount > 0)) continue;
      cashRawTotal += cash.cashAmount * item.quantity;
      const sched = scheduleByProduct.get(item.productId);
      if (sched?.feeStepAmount != null && sched.feeMarginPercent != null) {
        cashFeeTotal +=
          computeCashArrangementFee(cash.cashAmount, {
            feeStepAmount: sched.feeStepAmount,
            feeMarginPercent: sched.feeMarginPercent,
          }) * item.quantity;
      }
    }
    return {
      cashRawTotal: Math.round(cashRawTotal * 100) / 100,
      cashFeeTotal: Math.round(cashFeeTotal * 100) / 100,
    };
  }, [items, query.data, cashProductIds.length]);
}
