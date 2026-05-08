"use client";

import { formatCurrency } from "@/lib/format";
import { useCurrency } from "@/features/location/hooks/useCurrency";
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
  const hasDiscount =
    product.compareAtPrice &&
    product.compareAtPrice.amount > product.price.amount;

  return (
    <div className={cn("flex items-baseline gap-3", className)}>
      <span
        className={cn(
          "font-display font-medium text-ink-900",
          size === "lg" ? "text-3xl" : "text-xl"
        )}
      >
        {formatCurrency(product.price.amount, currency, locale)}
      </span>
      {hasDiscount && product.compareAtPrice ? (
        <span
          className={cn(
            "text-ink-400 line-through",
            size === "lg" ? "text-base" : "text-sm"
          )}
        >
          {formatCurrency(product.compareAtPrice.amount, currency, locale)}
        </span>
      ) : null}
    </div>
  );
}
