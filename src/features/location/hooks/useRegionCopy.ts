"use client";

import { useAppSelector } from "@/store";
import { regionCopyFromCountryCity, type RegionCopy } from "@/features/location/regionCopy";

/**
 * Localized city/country labels for the currently selected delivery region —
 * the copy-facing counterpart to `useCurrency()`. Use this wherever UI text
 * mentions the delivery city/country (announcement bar, hero, cart notes…)
 * instead of hardcoding "Dubai"/"UAE".
 */
export function useRegionCopy(): RegionCopy {
  const country = useAppSelector((s) => s.location.country);
  const city = useAppSelector((s) => s.location.city);
  const locale = useAppSelector((s) => s.ui.locale);
  return regionCopyFromCountryCity(country, city, locale);
}
