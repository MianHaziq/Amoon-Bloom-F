/**
 * Adapter from backend `ApiCategory` to storefront UI `Category`. Slugs are
 * the category's UUID — no slug field exists on the backend.
 */

import type { Category, CategoryGroup } from "./types";
import type { ApiCategory } from "./api-types";
import { localized } from "@/i18n";
import type { Locale } from "@/store/slices/ui.slice";

const FALLBACK_IMAGE = {
  url: "/placeholder-category.svg",
  alt: "",
  width: 800,
  height: 600,
};

export function toUiCategory(api: ApiCategory, locale: Locale = "en"): Category {
  const title = localized(api.title, api.title_ar, locale);
  const image = api.image ? { url: api.image, alt: title } : FALLBACK_IMAGE;

  return {
    id: api.id,
    slug: api.id,
    title,
    title_ar: api.title_ar ?? undefined,
    description:
      localized(api.description ?? "", api.description_ar, locale) || undefined,
    description_ar: api.description_ar ?? undefined,
    image,
    productCount: api.totalProducts,
  };
}

export const toUiCategories = (
  list: ApiCategory[] | undefined,
  locale: Locale = "en"
): Category[] => (list ?? []).map((c) => toUiCategory(c, locale));

/**
 * Build a single "Shop" group from the flat category list. The storefront's
 * MegaMenu and MobileNav originally consumed a hand-curated `categoryGroups`
 * array; we keep the same shape so consumers don't need to change.
 */
export function toUiCategoryGroups(
  list: ApiCategory[] | undefined,
  locale: Locale = "en"
): CategoryGroup[] {
  const categories = toUiCategories(list, locale);
  if (categories.length === 0) return [];
  return [
    {
      id: "shop",
      // Consumers localize this via `group.id === "shop"` → t("common.shop").
      label: "Shop",
      categories,
    },
  ];
}
