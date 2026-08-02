"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { m } from "motion/react";
import { IconButton, CurrencyAmount } from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { listItem, microTransition } from "@/lib/motion";
import { QuantitySelector } from "@/features/products/components/QuantitySelector";
import { SelectedOptions } from "@/features/products/components/SelectedOptions";
import { OrderItemExtras } from "@/features/orders/components/OrderItemExtras";
import { CashArrangementModal, type CashUnitEntry } from "@/features/products/components/CashArrangementModal";
import { ROUTES } from "@/constants/routes";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useAppDispatch } from "@/store";
import { removeFromCart, setCartQuantity, applyCashArrangementEntries } from "@/features/cart/cart.thunks";
import { type CartItem } from "@/store/slices/cart.slice";
import { cashArrangementApi } from "@/features/cash-arrangement/api/cash-arrangement.api";
import { computeCashArrangementFee } from "@/features/cash-arrangement/cashArrangementFee";
import { queryKeys } from "@/services/queryKeys";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";

interface CartLineItemProps {
  item: CartItem;
  variant?: "drawer" | "page";
  onNavigate?: () => void;
}

export function CartLineItem({
  item,
  variant = "drawer",
  onNavigate,
}: CartLineItemProps) {
  const dispatch = useAppDispatch();
  const { currency, locale, countryCode: regionCode } = useCurrency();
  const { t } = useT();

  // Raising quantity on a line that already has a cash arrangement needs the shopper
  // to say whether the new unit(s) get one too (and if so, what amount) — reopen the
  // same per-unit modal the product page uses, rather than silently scaling the
  // existing amount/fee to units nobody confirmed it for. Only fetched for lines that
  // actually carry a cash arrangement (usually cache-warm already from the PDP visit).
  const hasCash = Boolean(item.cashArrangement);
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [pendingQty, setPendingQty] = useState<number | null>(null);
  const cashQuery = useQuery({
    queryKey: queryKeys.cashArrangement.resolve(regionCode, undefined, [item.productId]),
    queryFn: () => cashArrangementApi.resolve({ cartLines: [{ productId: item.productId }] }),
    enabled: hasCash && Boolean(regionCode),
  });
  const cashConfig = cashQuery.data;
  // Surfaced in the cart line (via OrderItemExtras) so the fee is visible here too, not
  // only at checkout — the resolve config is already fetched above for the quantity-raise
  // flow, so this just reuses it (no extra request).
  const cashFeeAmount =
    item.cashArrangement && cashConfig?.feeStepAmount != null && cashConfig?.feeMarginPercent != null
      ? computeCashArrangementFee(item.cashArrangement.cashAmount, {
          feeStepAmount: cashConfig.feeStepAmount,
          feeMarginPercent: cashConfig.feeMarginPercent,
        })
      : null;

  const handleQuantityChange = (q: number) => {
    if (item.cashArrangement && q > item.quantity && cashConfig) {
      setPendingQty(q);
      setCashModalOpen(true);
      return;
    }
    dispatch(setCartQuantity(item.productId, q, item.variantKey));
  };

  const cashInitialEntries: CashUnitEntry[] = item.cashArrangement
    ? Array.from({ length: item.quantity }, () => ({
        included: true,
        cashAmount: String(item.cashArrangement!.cashAmount),
        denomination: item.cashArrangement!.denomination,
        note: item.cashArrangement!.note,
      }))
    : [];

  return (
    <m.article
      variants={listItem}
      initial="hidden"
      animate="show"
      exit="exit"
      className={cn(
        "flex gap-4",
        variant === "page" &&
          "rounded-2xl border border-ink-100 bg-white p-4"
      )}
    >
      <LocalizedLink
        href={ROUTES.product(item.slug)}
        onClick={onNavigate}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-blush-50",
          variant === "drawer" ? "h-20 w-20" : "h-24 w-24 md:h-28 md:w-28"
        )}
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="120px"
            className="object-cover"
          />
        )}
      </LocalizedLink>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <LocalizedLink
            href={ROUTES.product(item.slug)}
            onClick={onNavigate}
            className="min-w-0 font-display text-base font-medium leading-tight text-ink-900 hover:text-bloom-700"
          >
            {item.title}
          </LocalizedLink>
          <m.p
            key={item.unitPrice * item.quantity}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={microTransition}
            className="shrink-0 text-sm font-semibold tabular-nums text-ink-900"
          >
            <CurrencyAmount
              amount={item.unitPrice * item.quantity}
              currency={currency}
              locale={locale}
            />
          </m.p>
        </div>
        <p className="mt-1 text-xs text-ink-500">
          <CurrencyAmount amount={item.unitPrice} currency={currency} locale={locale} />{" "}
          {t("cart.each")}
        </p>
        <SelectedOptions options={item.selectedOptions} className="mt-1.5" />
        <OrderItemExtras
          giftCardSelected={item.giftCardSelected}
          customName={item.customName}
          message={item.message}
          cashArrangement={
            item.cashArrangement ? { ...item.cashArrangement, feeAmount: cashFeeAmount } : null
          }
          currency={currency}
          locale={locale}
          className="mt-2"
        />
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantitySelector
            size="sm"
            value={item.quantity}
            onChange={handleQuantityChange}
          />
          <IconButton
            label={t("common.remove")}
            variant="ghost"
            size="sm"
            onClick={() => dispatch(removeFromCart(item.productId, item.variantKey))}
            className="text-ink-400"
          >
            <TrashIcon size={16} />
          </IconButton>
        </div>
      </div>

      {hasCash && cashConfig && (
        <CashArrangementModal
          open={cashModalOpen}
          quantity={pendingQty ?? item.quantity}
          config={cashConfig}
          initial={cashInitialEntries}
          currency={currency}
          locale={locale}
          onCancel={() => {
            setCashModalOpen(false);
            setPendingQty(null);
          }}
          onSave={(entries) => {
            setCashModalOpen(false);
            setPendingQty(null);
            dispatch(applyCashArrangementEntries(item.productId, item.variantKey, entries));
          }}
        />
      )}
    </m.article>
  );
}
