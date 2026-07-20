"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store";
import { ChevronDown } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import { regionsApi } from "@/features/regions/api/regions.api";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { queryKeys } from "@/services/queryKeys";
import { LocationSheet } from "./LocationSheet";
import { RegionFlag } from "./RegionFlag";

interface DeliverToPillProps {
  className?: string;
  /** Compact variant for narrow viewports — drops the "Deliver to" prefix. */
  compact?: boolean;
}

/**
 * Trigger button that opens the `LocationSheet` (country step, then that
 * country's cities/zones). Surfaces the active country's flag + city so the
 * customer always knows what context they're shopping in — and can change
 * the country from here, not just the city.
 */
export function DeliverToPill({ className, compact = false }: DeliverToPillProps) {
  const [open, setOpen] = useState(false);
  const country = useAppSelector((s) => s.location.country);
  const city = useAppSelector((s) => s.location.city);
  const activeRegions = useAppSelector((s) => s.location.activeRegions);
  const { t } = useT();
  const queryClient = useQueryClient();

  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
    staleTime: 5 * 60_000,
  });
  const currentRegion = regionsQuery.data?.find((r) => r.code === country);

  // Warm the delivery-zones cache for every switchable region as soon as the
  // header mounts, so picking a country in LocationSheet (e.g. Saudi Arabia)
  // resolves from cache instantly instead of paying a fresh round trip on
  // first click. Cheap — there are only a couple of active regions.
  useEffect(() => {
    activeRegions.forEach((code) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.deliveryZones.list(code),
        queryFn: () => deliveryZonesApi.list(code),
        staleTime: 5 * 60_000,
      });
    });
  }, [activeRegions, queryClient]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group inline-flex items-center gap-2 rounded-full py-1.5 pe-3 ps-1.5 text-sm transition-all duration-200 hover:bg-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
          className
        )}
      >
        <RegionFlag region={currentRegion} shape="circle" className="h-7 w-7" />
        {compact ? null : (
          <span className="font-medium text-ink-900 transition-colors group-hover:text-white">
            {t("nav.deliverTo")}
          </span>
        )}
        <span className="font-semibold text-bloom-600 transition-colors group-hover:text-bloom-300">
          {city}
        </span>
        <ChevronDown
          size={12}
          className="shrink-0 text-ink-400 transition-colors group-hover:text-white"
        />
      </button>
      <LocationSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
