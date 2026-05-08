/**
 * Adapter from backend `ApiCategory` to storefront UI `Category`. Slugs are
 * the category's UUID — no slug field exists on the backend.
 */

import type { Category, CategoryGroup } from "./types";
import type { ApiCategory } from "./api-types";

const FALLBACK_IMAGE = {
  url: "/placeholder-category.svg",
  alt: "",
  width: 800,
  height: 600,
};

export function toUiCategory(api: ApiCategory): Category {
  const image = api.image
    ? { url: api.image, alt: api.title }
    : FALLBACK_IMAGE;

  return {
    id: api.id,
    slug: api.id,
    title: api.title,
    title_ar: api.title_ar ?? undefined,
    description: api.description ?? undefined,
    description_ar: api.description_ar ?? undefined,
    image,
    productCount: api.totalProducts,
  };
}

export const toUiCategories = (list: ApiCategory[] | undefined): Category[] =>
  (list ?? []).map(toUiCategory);

/**
 * Build a single "Shop" group from the flat category list. The storefront's
 * MegaMenu and MobileNav originally consumed a hand-curated `categoryGroups`
 * array; we keep the same shape so consumers don't need to change.
 */
export function toUiCategoryGroups(list: ApiCategory[] | undefined): CategoryGroup[] {
  const categories = toUiCategories(list);
  if (categories.length === 0) return [];
  return [
    {
      id: "shop",
      label: "Shop",
      categories,
    },
  ];
}
