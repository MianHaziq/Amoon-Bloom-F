"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { resolveRegionContact, type RegionContact } from "@/features/location/regionContact";

/**
 * Contact/legal info for the currently selected delivery region — the
 * contact-facing counterpart to `useRegionCopy()`. Use this wherever UI shows
 * a support email/phone/WhatsApp/address/hours instead of hardcoding
 * `siteConfig.contact.*`. Regions are the same admin-managed, cache-shared
 * list the header picker and checkout already query — not an extra request.
 */
export function useRegionContact(): RegionContact {
  const country = useAppSelector((s) => s.location.country);
  const locale = useAppSelector((s) => s.ui.locale);
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
    staleTime: 5 * 60_000,
  });
  const region = (regionsQuery.data ?? []).find((r) => r.code === country);
  return resolveRegionContact(region, locale);
}
