/**
 * Adapters between the canonical backend `ApiProduct` shape and the storefront
 * UI `Product` shape. The backend has no notion of slugs, badges, ratings, or
 * collections — those fields stay undefined on the UI side and the components
 * fall back gracefully. URLs use the product's UUID as the slug.
 */

import type { Product, ProductDescriptionBlock, ProductOptionGroup } from "./types";
import type {
  ApiProduct,
  ApiProductDescriptionBlock,
  ApiProductOptionGroup,
} from "./api-types";
import { localized } from "@/i18n";
import type { Locale } from "@/store/slices/ui.slice";

const FALLBACK_CURRENCY = "AED";
const FALLBACK_IMAGE = {
  url: "/placeholder-product.svg",
  alt: "",
};

const adaptDescription = (
  d: ApiProductDescriptionBlock,
  locale: Locale
): ProductDescriptionBlock => ({
  id: d.id,
  title: localized(d.title ?? "", d.title_ar, locale) || undefined,
  description: localized(d.description, d.description_ar, locale),
});

const adaptOption = (
  o: ApiProductOptionGroup,
  locale: Locale
): ProductOptionGroup => ({
  id: o.id,
  title: localized(o.title, o.title_ar, locale),
  options:
    locale === "ar" && o.options_ar?.length ? o.options_ar : o.options ?? [],
  // Images align by index with the canonical `options` order, which also holds
  // for `options_ar` (same order), so no re-indexing is needed per locale.
  optionImages: o.optionImages ?? [],
});

export interface ToUiProductOptions {
  /** Currency code from `/settings/public` or `/settings`. Defaults to AED. */
  currency?: string;
  /** Active locale — picks Arabic content fields when "ar". */
  locale?: Locale;
}

export function toUiProduct(api: ApiProduct, opts: ToUiProductOptions = {}): Product {
  const currency = opts.currency ?? FALLBACK_CURRENCY;
  const locale = opts.locale ?? "en";
  const title = localized(api.title, api.title_ar, locale);
  const subtitle = localized(api.subtitle ?? "", api.subtitle_ar, locale) || undefined;
  const isOnSale =
    api.discountedPrice != null && api.discountedPrice < api.price;
  const sellAmount = isOnSale ? (api.discountedPrice as number) : api.price;

  // Pull a description from the first description block, falling back to
  // subtitle. Storefront PDPs render the full descriptions[] array as well.
  const firstBlock = api.descriptions?.[0];
  const firstDescription = firstBlock
    ? localized(firstBlock.description, firstBlock.description_ar, locale)
    : "";
  const description = firstDescription || subtitle || "";

  // Storefront uses category title for display + slug for URL; backend has
  // only id + (joined) title. Localize so the category eyebrow renders Arabic.
  const categoryTitle = localized(
    api.category?.title ?? "",
    api.category?.title_ar,
    locale
  );
  const categorySlug = api.categoryId ?? "";

  const images = (api.images ?? []).map((url, i) => ({
    url,
    alt: i === 0 ? title : "",
  }));
  if (images.length === 0 && api.image) {
    images.push({ url: api.image, alt: title });
  }
  if (images.length === 0) {
    images.push(FALLBACK_IMAGE);
  }

  return {
    id: api.id,
    slug: api.id,
    title,
    subtitle,
    description,
    descriptions: api.descriptions?.map((d) => adaptDescription(d, locale)),
    price: { amount: sellAmount, currency },
    compareAtPrice: isOnSale ? { amount: api.price, currency } : undefined,
    images,
    category: categoryTitle,
    categorySlug,
    inStock: api.quantity > 0,
    options: api.productOptions?.map((o) => adaptOption(o, locale)),
  };
}

export const toUiProducts = (
  list: ApiProduct[] | undefined,
  opts?: ToUiProductOptions
): Product[] => (list ?? []).map((p) => toUiProduct(p, opts));
