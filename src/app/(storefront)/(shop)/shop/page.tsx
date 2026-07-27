import { Container, Section } from "@/components/ui";
import { ShopPLP } from "@/components/shop/ShopPLP";
import { productsApi } from "@/features/products/api/products.api";
import {
  getCachedProductList,
  getCachedCategories,
  getCachedSections,
  getCachedDeliveryConfig,
} from "@/services/catalogCache";
import { toUiCategories } from "@/features/categories/adapters";
import { getServerRegion } from "@/services/serverRegion";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";
import { regionCopyFromRegionCode } from "@/features/location/regionCopy";
import { intlLocale, formatCutoffTime } from "@/lib/format";

export const metadata = { title: "Shop" };

// Catalog visibility is region-scoped (reads the region cookie), so this
// renders per-request rather than as a single shared static page.
export const dynamic = "force-dynamic";

export default async function ShopPage(props: PageProps<"/shop">) {
  const [region, locale] = await Promise.all([
    getServerRegion(),
    getServerLocale(),
  ]);
  const regionCopy = await regionCopyFromRegionCode(region, locale);
  // Real same-day cutoff for the hero subtitle (falls back to a no-cutoff variant when
  // same-day isn't offered or the config can't be fetched).
  const deliveryConfig = await getCachedDeliveryConfig(region ?? undefined).catch(() => null);
  const heroCutoff =
    deliveryConfig?.sameDayEnabled && deliveryConfig.sameDayCutoff
      ? formatCutoffTime(deliveryConfig.sameDayCutoff, intlLocale(locale))
      : null;
  const searchParams = await props.searchParams;
  const rawQ = searchParams?.q;
  const q = (typeof rawQ === "string" ? rawQ : "").trim();

  // When the user searched (?q=), resolve the set through the fast backend search
  // endpoint (pg_trgm-indexed, region-scoped). Otherwise show the standard catalog.
  // First page only — the client "Load more" control in ShopPLP fetches the
  // rest incrementally so the initial catalogue paint stays fast.
  const PAGE_SIZE = 12;
  const [productPage, apiCategories, apiSections] = await Promise.all([
    // Search results vary per query and are inherently uncacheable; the plain
    // catalog listing goes through the region-cached data layer.
    (q
      ? productsApi.search(q, { page: 1, limit: PAGE_SIZE, region })
      : getCachedProductList(region, 1, PAGE_SIZE)
    ).catch(() => ({ data: [], meta: {} })),
    getCachedCategories(region).catch(() => []),
    getCachedSections(region).catch(() => []),
  ]);

  const categories = toUiCategories(apiCategories, locale);

  // Every admin-managed Section with products becomes a shop filter (same
  // sortOrder as the home rails). Selecting one shows its curated products first
  // (home-rail order) then the rest of the catalogue — see ShopPLP. Category-only
  // sections have nothing to list here, so they're skipped, matching the home.
  const sections = [...apiSections]
    .filter((s) => s.products && s.products.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => ({
      id: s.id,
      title: s.title,
      title_ar: s.title_ar,
      products: s.products,
    }));
  const total =
    (productPage.meta as { pagination?: { total?: number } } | undefined)
      ?.pagination?.total ?? productPage.data.length;

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
            {t(
              locale,
              heroCutoff ? "shop.heroSubtitle" : "shop.heroSubtitleNoCutoff",
              { city: regionCopy.city, cutoff: heroCutoff ?? "" }
            )}
          </p>
        </Container>
      </section>

      <Section spacing="md" tone="default">
        <ShopPLP
          initialProducts={productPage.data}
          initialMeta={productPage.meta}
          categories={categories}
          sections={sections}
          catalogTotal={total}
          pageSize={PAGE_SIZE}
        />
      </Section>
    </>
  );
}
