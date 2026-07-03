import { notFound } from "next/navigation";
import Link from "next/link";
import { Container, Section } from "@/components/ui";
import { ChevronRight } from "@/components/icons";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import {
  getCachedCategoryById,
  getCachedProductsByCategory,
} from "@/services/catalogCache";
import { toUiCategory } from "@/features/categories/adapters";
import { toUiProducts } from "@/features/products/adapters";
import { ApiError } from "@/services/http";
import { ROUTES } from "@/constants/routes";
import { getServerRegion } from "@/services/serverRegion";
import { getServerLocale } from "@/i18n/server";
import { t, tCount } from "@/i18n";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// Region-scoped catalog → render per-request from the region cookie.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  try {
    const region = await getServerRegion();
    const api = await getCachedCategoryById(region, slug);
    return {
      title: api.title,
      description: api.description ?? `${api.title} at Amoonis Boutique`,
    };
  } catch {
    return {};
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [region, locale] = await Promise.all([
    getServerRegion(),
    getServerLocale(),
  ]);

  let categoryApi;
  try {
    categoryApi = await getCachedCategoryById(region, slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const productPage = await getCachedProductsByCategory(region, slug, 24).catch(
    () => ({ data: [], meta: {} })
  );

  const category = toUiCategory(categoryApi, locale);
  const items = toUiProducts(productPage.data, { locale });

  return (
    <>
      <section className="border-b border-ink-100 bg-cream-50 pt-12 pb-10 lg:pt-16 lg:pb-14">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-ink-500"
          >
            <Link href={ROUTES.home} className="hover:text-ink-900">
              {t(locale, "common.home")}
            </Link>
            <ChevronRight size={12} className="rtl:-scale-x-100" />
            <Link href={ROUTES.shop} className="hover:text-ink-900">
              {t(locale, "common.shop")}
            </Link>
            <ChevronRight size={12} className="rtl:-scale-x-100" />
            <span className="text-ink-900">{category.title}</span>
          </nav>
          <h1 className="mt-6 font-display text-3xl font-medium leading-tight text-ink-900 sm:text-4xl md:text-5xl lg:text-6xl">
            {category.title}
          </h1>
          {category.description && (
            <p className="mt-3 max-w-2xl text-ink-500">{category.description}</p>
          )}
          <p className="mt-4 text-xs text-ink-400">
            {tCount(locale, items.length, "units.pieceOne", "units.pieceOther")}
          </p>
        </Container>
      </section>

      <Section spacing="md" tone="default">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-ink-200 bg-cream-50 px-6 py-16 text-center sm:py-20">
            <p className="font-display text-2xl text-ink-900">
              {t(locale, "shop.emptyCategoryTitle")}
            </p>
            <Link
              href={ROUTES.shop}
              className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              {t(locale, "common.browseBoutique")}
            </Link>
          </div>
        ) : (
          <ProductGrid products={items} columns={4} priorityCount={4} />
        )}
      </Section>
    </>
  );
}
