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

const FALLBACK_CURRENCY = "AED";
const FALLBACK_IMAGE = {
  url: "/placeholder-product.svg",
  alt: "",
};

const adaptDescription = (d: ApiProductDescriptionBlock): ProductDescriptionBlock => ({
  id: d.id,
  title: d.title ?? undefined,
  description: d.description,
});

const adaptOption = (o: ApiProductOptionGroup): ProductOptionGroup => ({
  id: o.id,
  title: o.title,
  options: o.options ?? [],
});

export interface ToUiProductOptions {
  /** Currency code from `/settings/public` or `/settings`. Defaults to AED. */
  currency?: string;
}

export function toUiProduct(api: ApiProduct, opts: ToUiProductOptions = {}): Product {
  const currency = opts.currency ?? FALLBACK_CURRENCY;
  const isOnSale =
    api.discountedPrice != null && api.discountedPrice < api.price;
  const sellAmount = isOnSale ? (api.discountedPrice as number) : api.price;

  // Pull a description from the first description block, falling back to
  // subtitle. Storefront PDPs render the full descriptions[] array as well.
  const firstDescription = api.descriptions?.[0]?.description;
  const description = firstDescription || api.subtitle || "";

  // Storefront uses category title for display + slug for URL; backend has
  // only id + (joined) title. Slugify the title so live URLs stay readable.
  const categoryTitle = api.category?.title ?? "";
  const categorySlug = api.categoryId ?? "";

  const images = (api.images ?? []).map((url, i) => ({
    url,
    alt: i === 0 ? api.title : "",
  }));
  if (images.length === 0 && api.image) {
    images.push({ url: api.image, alt: api.title });
  }
  if (images.length === 0) {
    images.push(FALLBACK_IMAGE);
  }

  return {
    id: api.id,
    slug: api.id,
    title: api.title,
    subtitle: api.subtitle ?? undefined,
    description,
    descriptions: api.descriptions?.map(adaptDescription),
    price: { amount: sellAmount, currency },
    compareAtPrice: isOnSale ? { amount: api.price, currency } : undefined,
    images,
    category: categoryTitle,
    categorySlug,
    inStock: api.quantity > 0,
    options: api.productOptions?.map(adaptOption),
  };
}

export const toUiProducts = (
  list: ApiProduct[] | undefined,
  opts?: ToUiProductOptions
): Product[] => (list ?? []).map((p) => toUiProduct(p, opts));
