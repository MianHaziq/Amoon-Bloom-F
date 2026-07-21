"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { siteConfig } from "@/config/site";
import { intlLocale } from "@/lib/format";
import { getCallingCode } from "@/features/regions/countries";

/**
 * Currency + region name for the storefront. The backend supports a per-region
 * manual price override per product (ProductRegion.price/discountedPrice) and
 * resolves `price`/`discountedPrice` to the requesting region server-side — so
 * the NUMBER already reflects the region. This hook supplies the matching
 * currency LABEL for formatting, resolved from the live `GET /regions` list
 * (same query key `CheckoutClient`/`CartSummary`/admin already use — cache-
 * shared, not a new network call in most flows) instead of a static map.
 *
 * `locale` follows the active UI language (via intlLocale) so price grouping/
 * formatting matches the rest of the localized UI. Arabic maps to
 * `ar-AE-u-nu-latn` (Latin digits, Arabic label conventions) — independent of
 * the region, which only drives the currency symbol.
 *
 * `dialCode` is the phone field's country-calling-code prefix (e.g. "+212"
 * for Morocco), derived automatically from the region's `iso2` — never a
 * manually-maintained per-region map, so a brand-new region (Pakistan,
 * Morocco, ...) gets the right prefix the moment its `iso2` is set, with no
 * extra admin step. Empty string when the region has no `iso2` set, matching
 * how the phone field showed no prefix before this existed.
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
    iso2: region?.iso2 ?? null,
    dialCode: getCallingCode(region?.iso2) ?? "",
  };
}
