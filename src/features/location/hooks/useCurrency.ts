"use client";

import { useAppSelector } from "@/store";
import { getCountry } from "@/features/location/data";

/**
 * Currency + locale derived from the user's selected delivery country.
 * Mobile spec §3.3 / §10.1: currency is locked by location — UAE→AED,
 * Saudi Arabia→SAR. The product's stored `currency` is ignored on the
 * storefront so the customer always sees prices in the currency that
 * matches where they're shopping from.
 */
export function useCurrency() {
  const country = useAppSelector((s) => s.location.country);
  const def = getCountry(country);
  return {
    currency: def.currency,
    locale: def.locale,
    countryCode: def.code,
    countryName: def.name,
  };
}
