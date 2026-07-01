"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../api/categories.api";
import { queryKeys } from "@/services/queryKeys";
import { toUiCategories, toUiCategoryGroups } from "../adapters";
import { useAppSelector } from "@/store";

/**
 * Shared category query for storefront navigation. Cached for an hour because
 * the catalogue is admin-managed and changes infrequently — re-renders of the
 * Header don't refetch. Titles are localized to the active locale so nav
 * category names render in Arabic when the store is in AR.
 */
export function useCategories() {
  const locale = useAppSelector((s) => s.ui.locale);
  const query = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
    staleTime: 60 * 60 * 1000,
  });

  return {
    ...query,
    categories: toUiCategories(query.data, locale),
    groups: toUiCategoryGroups(query.data, locale),
  };
}
