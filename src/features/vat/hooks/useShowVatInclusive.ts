"use client";

import { useQuery } from "@tanstack/react-query";
import { vatApi } from "../api/vat.api";
import { queryKeys } from "@/services/queryKeys";

/**
 * True when the current region's VAT is enabled AND baked into catalogue prices
 * (inclusive) — the one condition under which a "VAT Inclusive" label should be
 * shown next to a price. Shared by the PDP price block and shop grid cards so
 * both read the same region-wide public config.
 */
export function useShowVatInclusive(): boolean {
  const vatQuery = useQuery({
    queryKey: queryKeys.vat.public(),
    queryFn: () => vatApi.getPublic(),
    staleTime: 5 * 60_000,
  });
  return Boolean(vatQuery.data?.enabled && vatQuery.data?.inclusive);
}
