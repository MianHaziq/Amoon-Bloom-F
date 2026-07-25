"use client";

import { useQuery } from "@tanstack/react-query";
import { vatApi } from "../api/vat.api";
import { queryKeys } from "@/services/queryKeys";
import type { ApiPublicVatConfig } from "../types";

/**
 * The current region's public VAT config (rate + inclusive + scope), resolved
 * server-side from the `X-Region` header. Shared, cached query — the PDP price
 * block, shop cards, cart summary and checkout preview all read the same row.
 */
export function usePublicVat(): ApiPublicVatConfig | undefined {
  const vatQuery = useQuery({
    queryKey: queryKeys.vat.public(),
    queryFn: () => vatApi.getPublic(),
    staleTime: 5 * 60_000,
  });
  return vatQuery.data;
}
