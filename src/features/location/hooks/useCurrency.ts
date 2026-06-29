"use client";

import { useAppSelector } from "@/store";
import { getCountry } from "@/features/location/data";
import { siteConfig } from "@/config/site";

/**
 * Currency + locale for the storefront. The backend stores a single price per
 * product in one currency and exposes no per-region pricing, so currency is a
 * single store-wide value (siteConfig.currency) — NOT derived from the chosen
 * delivery region. Region selection only scopes which products are visible.
 *
 * `countryCode`/`countryName` still reflect the delivery selection for any
 * location-aware copy, but they no longer drive the displayed currency.
 */
export function useCurrency() {
  const country = useAppSelector((s) => s.location.country);
  const def = getCountry(country);
  return {
    currency: siteConfig.currency,
    locale: siteConfig.locale,
    countryCode: def.code,
    countryName: def.name,
  };
}
