"use client";

import { useAppSelector } from "@/store";
import { getCountry } from "@/features/location/data";
import { siteConfig } from "@/config/site";

/**
 * Currency + locale for the storefront. The backend supports a per-product
 * manual SAR price override (Product.priceSar) and resolves `price`/
 * `discountedPrice` to the requesting region's currency server-side — so the
 * NUMBER already reflects the region. This hook supplies the matching
 * currency LABEL for formatting, derived from the same country→currency map
 * used by the region/location picker (UAE→AED, Saudi Arabia→SAR).
 *
 * `locale` stays store-wide (siteConfig.locale) — it only affects digit
 * grouping/formatting style and is independent of region.
 */
export function useCurrency() {
  const country = useAppSelector((s) => s.location.country);
  const def = getCountry(country);
  return {
    currency: def.currency,
    locale: siteConfig.locale,
    countryCode: def.code,
    countryName: def.name,
  };
}
