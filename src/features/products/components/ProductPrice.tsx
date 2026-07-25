"use client";

import { CurrencyAmount } from "@/components/ui";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { usePublicVat } from "@/features/vat/hooks/usePublicVat";
import { vatHint } from "@/features/vat/vatDisplay";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/cn";
import type { Product } from "../types";

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
 */
export function ProductPrice({ product, size = "lg", className }: ProductPriceProps) {
  const { currency, locale } = useCurrency();
  const { t } = useT();
  const hasDiscount =
    product.compareAtPrice &&
    product.compareAtPrice.amount > product.price.amount;

  // Same public VAT config the checkout preview reads (§ CheckoutClient.tsx).
  // Inclusive regions announce "VAT Inclusive" (no amount); exclusive regions
  // (whole-catalogue scope) announce "+ X% VAT" so the addition is visible
  // before checkout.
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
        amount={product.price.amount}
        currency={currency}
        locale={locale}
        className={cn(
          "font-display font-medium text-bloom-700",
          size === "lg" ? "text-3xl" : "text-xl"
        )}
      />
      {hasDiscount && product.compareAtPrice ? (
        <CurrencyAmount
          amount={product.compareAtPrice.amount}
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
      ) : hint?.kind === "exclusive" ? (
        <span className="text-sm font-medium text-ink-500">
          {t("product.vatExclusiveNote", { rate: hint.rate })}
        </span>
      ) : null}
    </div>
  );
}
