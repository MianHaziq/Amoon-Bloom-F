"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store";
import { regionsApi } from "@/features/regions/api/regions.api";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { queryKeys } from "@/services/queryKeys";
import { regionCopyFromLiveData, type RegionCopy } from "@/features/location/regionCopy";

/**
 * Localized city/country labels for the currently selected delivery region —
 * the copy-facing counterpart to `useCurrency()`. Use this wherever UI text
 * mentions the delivery city/country (announcement bar, hero, cart notes…)
 * instead of hardcoding "Dubai"/"UAE". Regions/zones are the same admin-
 * managed lists the header picker and checkout already query (cache-shared
 * query keys, not extra requests).
 */
export function useRegionCopy(): RegionCopy {
  const country = useAppSelector((s) => s.location.country);
  const city = useAppSelector((s) => s.location.city);
  const locale = useAppSelector((s) => s.ui.locale);
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
    staleTime: 5 * 60_000,
  });
  const zonesQuery = useQuery({
    queryKey: queryKeys.deliveryZones.list(country),
    queryFn: () => deliveryZonesApi.list(country),
    enabled: Boolean(country),
    staleTime: 5 * 60_000,
  });
  return regionCopyFromLiveData(regionsQuery.data, zonesQuery.data, country, city, locale);
}
