"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useT } from "@/i18n/useT";
import { productsApi } from "../api/products.api";
import { toUiProducts } from "../adapters";
import { queryKeys } from "@/services/queryKeys";

/** Only fetch once the query has enough signal to be meaningful. Matches the
 *  backend's "a blank q returns nothing" contract while avoiding a request on
 *  every single keystroke of a 1-char term. */
const MIN_QUERY_LENGTH = 2;
/** Type-ahead shows a short preview; the full result set lives on /shop?q=. */
export const QUICK_SEARCH_LIMIT = 6;

/**
 * Debounced product type-ahead. Feeds the header/mobile search dropdowns:
 * debounces the raw input, hits the same region-scoped `/products/search`
 * endpoint the shop page uses, and returns storefront-adapted products
 * (localized + currency-resolved) ready to render. React Query dedupes and
 * caches per debounced term, and cancels in-flight requests when the key
 * changes, so fast typing never races stale responses onto the screen.
 */
export function useProductQuickSearch(rawQuery: string) {
  const debounced = useDebounce(rawQuery.trim(), 250);
  const { currency } = useCurrency();
  const { locale: uiLocale } = useT();
  const enabled = debounced.length >= MIN_QUERY_LENGTH;

  const query = useQuery({
    queryKey: queryKeys.products.search(debounced),
    queryFn: () => productsApi.search(debounced, { limit: QUICK_SEARCH_LIMIT }),
    enabled,
    staleTime: 60_000,
    // Keep the previous term's rows on screen while the next term loads, so the
    // dropdown doesn't flash empty between keystrokes.
    placeholderData: keepPreviousData,
  });

  const products = toUiProducts(query.data?.data, { locale: uiLocale, currency });
  const total = query.data?.meta?.pagination?.total ?? products.length;

  return {
    /** The debounced term actually being searched (for the "see all" link + empty copy). */
    term: debounced,
    /** Whether a search is active (term long enough to query). */
    active: enabled,
    products,
    total,
    isLoading: enabled && query.isPending,
    isFetching: query.isFetching,
  };
}
