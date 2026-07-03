import { Container, Section } from "@/components/ui";
import { ShopPLP } from "@/components/shop/ShopPLP";
import { productsApi } from "@/features/products/api/products.api";
import {
  getCachedProductList,
  getCachedCategories,
} from "@/services/catalogCache";
import { toUiProducts } from "@/features/products/adapters";
import { toUiCategories } from "@/features/categories/adapters";
import { getServerRegion } from "@/services/serverRegion";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";

export const metadata = { title: "Shop" };

// Catalog visibility is region-scoped (reads the region cookie), so this
// renders per-request rather than as a single shared static page.
export const dynamic = "force-dynamic";

export default async function ShopPage(props: PageProps<"/shop">) {
  const [region, locale] = await Promise.all([
    getServerRegion(),
    getServerLocale(),
  ]);
  const searchParams = await props.searchParams;
  const rawQ = searchParams?.q;
  const q = (typeof rawQ === "string" ? rawQ : "").trim();

  // When the user searched (?q=), resolve the set through the fast backend search
  // endpoint (pg_trgm-indexed, region-scoped). Otherwise show the standard catalog.
  const [productPage, apiCategories] = await Promise.all([
    // Search results vary per query and are inherently uncacheable; the plain
    // catalog listing goes through the region-cached data layer.
    (q
      ? productsApi.search(q, { page: 1, limit: 24, region })
      : getCachedProductList(region, 1, 24)
    ).catch(() => ({ data: [], meta: {} })),
    getCachedCategories(region).catch(() => []),
  ]);

  const products = toUiProducts(productPage.data, { locale });
  const categories = toUiCategories(apiCategories, locale);

  return (
    <>
      <section className="border-b border-ink-100 bg-cream-50 pt-12 pb-10 lg:pt-16 lg:pb-12">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {t(locale, "shop.title")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
            {t(locale, "shop.heading")}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-500">
            {t(locale, "shop.heroSubtitle")}
          </p>
        </Container>
      </section>

      <Section spacing="md" tone="default">
        <ShopPLP products={products} categories={categories} />
      </Section>
    </>
  );
}
