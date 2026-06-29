import { Container, Section } from "@/components/ui";
import { ShopPLP } from "@/components/shop/ShopPLP";
import { productsApi } from "@/features/products/api/products.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { toUiProducts } from "@/features/products/adapters";
import { toUiCategories } from "@/features/categories/adapters";
import { getServerRegion } from "@/services/serverRegion";

export const metadata = { title: "Shop" };

// Catalog visibility is region-scoped (reads the region cookie), so this
// renders per-request rather than as a single shared static page.
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const region = await getServerRegion();
  const [productPage, apiCategories] = await Promise.all([
    productsApi
      .list({ page: 1, limit: 60, region })
      .catch(() => ({ data: [], meta: {} })),
    categoriesApi.list(region).catch(() => []),
  ]);

  const products = toUiProducts(productPage.data);
  const categories = toUiCategories(apiCategories);

  return (
    <>
      <section className="border-b border-ink-100 bg-cream-50 pt-12 pb-10 lg:pt-16 lg:pb-12">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            Shop the boutique
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
            Hand-arranged for every quiet celebration.
          </h1>
          <p className="mt-3 max-w-2xl text-ink-500">
            Composed in our Downtown Dubai studio. Same-day delivery on orders
            placed before 6 PM.
          </p>
        </Container>
      </section>

      <Section spacing="md" tone="default">
        <ShopPLP products={products} categories={categories} />
      </Section>
    </>
  );
}
