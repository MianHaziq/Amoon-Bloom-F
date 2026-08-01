"use client";

import { CurrencyAmount } from "@/components/ui";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { usePublicVat } from "@/features/vat/hooks/usePublicVat";
import { vatHint } from "@/features/vat/vatDisplay";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/cn";
import type { Product } from "../types";
import { usePdpImage } from "./PdpImageContext";

interface ProductPriceProps {
  product: Product;
  size?: "lg" | "md";
  className?: string;
}

/**
 * Currency-aware price block. Reads the active delivery currency from the
 * location slice so prices flip when the user switches country (mobile spec
 * §3.3). The product's stored `price.currency` is ignored — the storefront
 * always renders in the destination's currency.
 *
 * Only ever rendered on the PDP (inside PdpImageProvider), so it also reads the
 * currently selected variant (e.g. size) and shows THAT variant's price/discount
 * instead of the product's own once one is active — matching what AddToCartPanel
 * is about to charge.
 */
export function ProductPrice({ product, size = "lg", className }: ProductPriceProps) {
  const { currency, locale } = useCurrency();
  const { t } = useT();
  const { activeVariant } = usePdpImage();
  const amount = activeVariant
    ? activeVariant.discountedPrice != null && activeVariant.discountedPrice < activeVariant.price
      ? activeVariant.discountedPrice
      : activeVariant.price
    : product.price.amount;
  const compareAtAmount = activeVariant
    ? activeVariant.discountedPrice != null && activeVariant.discountedPrice < activeVariant.price
      ? activeVariant.price
      : null
    : (product.compareAtPrice?.amount ?? null);
  const hasDiscount = compareAtAmount != null && compareAtAmount > amount;

  // Same public VAT config the checkout preview reads (§ CheckoutClient.tsx).
  // Inclusive regions announce "VAT Inclusive" (no amount). Exclusive regions
  // say nothing here — the "+ X% VAT" preview only appears on the shop grid
  // and the real amount on checkout; showing it again on the PDP was noise.
  //
  // The config is client-fetched (react-query), so it's absent during SSR but may
  // be present (cached) on the first client render — rendering it immediately
  // caused a hydration mismatch. Gate it behind mount so SSR and the first client
  // render agree (no hint), then reveal it after hydration.
  const vat = usePublicVat();
  const hydrated = useIsHydrated();
  const hint = hydrated ? vatHint(vat) : null;

  return (
    <div className={cn("flex items-baseline gap-3", className)}>
      <CurrencyAmount
        amount={amount}
        currency={currency}
        locale={locale}
        className={cn(
          "font-display font-medium text-bloom-700",
          size === "lg" ? "text-3xl" : "text-xl"
        )}
      />
      {hasDiscount && compareAtAmount != null ? (
        <CurrencyAmount
          amount={compareAtAmount}
          currency={currency}
          locale={locale}
          className={cn(
            "text-ink-400 line-through",
            size === "lg" ? "text-base" : "text-sm"
          )}
        />
      ) : null}
      {hint?.kind === "inclusive" ? (
        <span className="text-sm font-medium text-bloom-600">
          {t("product.vatInclusive")}
        </span>
      ) : null}
    </div>
  );
}
