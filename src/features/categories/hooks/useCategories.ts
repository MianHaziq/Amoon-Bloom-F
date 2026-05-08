"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../api/categories.api";
import { queryKeys } from "@/services/queryKeys";
import { toUiCategories, toUiCategoryGroups } from "../adapters";

/**
 * Shared category query for storefront navigation. Cached for an hour because
 * the catalogue is admin-managed and changes infrequently — re-renders of the
 * Header don't refetch.
 */
export function useCategories() {
  const query = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
    staleTime: 60 * 60 * 1000,
  });

  return {
    ...query,
    categories: toUiCategories(query.data),
    groups: toUiCategoryGroups(query.data),
  };
}
