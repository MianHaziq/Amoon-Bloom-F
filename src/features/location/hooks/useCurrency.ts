"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { siteConfig } from "@/config/site";
import { intlLocale } from "@/lib/format";

/**
 * Currency + region name for the storefront. The backend supports a per-product
 * manual SAR price override (Product.priceSar) and resolves `price`/
 * `discountedPrice` to the requesting region's currency server-side — so the
 * NUMBER already reflects the region. This hook supplies the matching
 * currency LABEL for formatting, resolved from the live `GET /regions` list
 * (same query key `CheckoutClient`/`CartSummary`/admin already use — cache-
 * shared, not a new network call in most flows) instead of a static map.
 *
 * `locale` follows the active UI language (via intlLocale) so price grouping/
 * formatting matches the rest of the localized UI. Arabic maps to
 * `ar-AE-u-nu-latn` (Latin digits, Arabic label conventions) — independent of
 * the region, which only drives the currency symbol.
 */
export function useCurrency() {
  const country = useAppSelector((s) => s.location.country);
  const uiLocale = useAppSelector((s) => s.ui.locale);
  const query = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
    staleTime: 5 * 60_000,
  });
  const region = query.data?.find((r) => r.code === country);
  return {
    currency: region?.currency ?? siteConfig.currency,
    locale: intlLocale(uiLocale),
    countryCode: country,
    countryName: region?.name ?? country,
  };
}
