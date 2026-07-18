"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { siteConfig } from "@/config/site";

/**
 * Currency + region name for the storefront. The backend supports a per-product
 * manual SAR price override (Product.priceSar) and resolves `price`/
 * `discountedPrice` to the requesting region's currency server-side — so the
 * NUMBER already reflects the region. This hook supplies the matching
 * currency LABEL for formatting, resolved from the live `GET /regions` list
 * (same query key `CheckoutClient`/`CartSummary`/admin already use — cache-
 * shared, not a new network call in most flows) instead of a static map.
 *
 * `locale` stays store-wide (siteConfig.locale) — it only affects digit
 * grouping/formatting style and is independent of region.
 */
export function useCurrency() {
  const country = useAppSelector((s) => s.location.country);
  const query = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
    staleTime: 5 * 60_000,
  });
  const region = query.data?.find((r) => r.code === country);
  return {
    currency: region?.currency ?? siteConfig.currency,
    locale: siteConfig.locale,
    countryCode: country,
    countryName: region?.name ?? country,
  };
}
