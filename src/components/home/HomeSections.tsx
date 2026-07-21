import Link from "next/link";
import { Section, SectionHeader, Button } from "@/components/ui";
import { Reveal } from "@/components/motion/primitives";
import { ArrowRight } from "@/components/icons";
import { ProductCarousel } from "@/features/products/components/ProductCarousel";
import { ProductRail } from "./ProductRail";
import { getCachedSections, getCachedProductList } from "@/services/catalogCache";
import { toUiProducts } from "@/features/products/adapters";
import { ROUTES } from "@/constants/routes";
import { getServerRegion } from "@/services/serverRegion";
import { getServerLocale } from "@/i18n/server";
import { localized, t } from "@/i18n";
import {
  BEST_SELLING_FILTER_VALUE,
  NEW_ARRIVALS_FILTER_VALUE,
} from "@/features/products/facets";

/** "View all" destination for a section — Best Sellers/New Arrivals land on the
 *  shop page pre-filtered to the matching real ranking (sales-desc / createdAt-desc)
 *  via the same sentinel mechanism the shop sidebar's "Best Selling" chip uses; a
 *  plain CUSTOM section just goes to the unfiltered shop, as before. */
function viewAllHref(kind: string | undefined): string {
  if (kind === "BEST_SELLERS") return `${ROUTES.shop}?category=${BEST_SELLING_FILTER_VALUE}`;
  if (kind === "NEW_ARRIVALS") return `${ROUTES.shop}?category=${NEW_ARRIVALS_FILTER_VALUE}`;
  return ROUTES.shop;
}

// Generous cap so admins can add several rails; guards against a runaway home.
const MAX_SECTIONS = 8;
// Higher than the old grid's 6 so the horizontal rail has enough to scroll
// through (the pagination dots make the extra products discoverable).
const PRODUCTS_PER_SECTION = 12;

/**
 * Home product rails, driven entirely by admin-managed Sections (e.g. "Best
 * sellers", "New arrivals"). Sections render in the admin-chosen `sortOrder`,
 * each as a titled rail of its curated, ordered products. Category-only
 * sections (no products) are skipped here.
 *
 * Fallback: if no published sections carry products yet (fresh DB), show a
 * newest-products rail so the home never renders an empty gap.
 */
export async function HomeSections() {
  const [region, locale] = await Promise.all([
    getServerRegion(),
    getServerLocale(),
  ]);
  const apiSections = await getCachedSections(region).catch(() => []);
  const eligible = [...apiSections]
    .filter((s) => s.products && s.products.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, MAX_SECTIONS);

  if (eligible.length === 0) {
    const page = await getCachedProductList(region, 1, 12).catch(() => ({
      data: [],
      meta: {},
    }));
    const products = toUiProducts(page.data, { locale }).slice(0, PRODUCTS_PER_SECTION);
    return (
      <ProductRail
        locale={locale}
        eyebrowKey="home.newArrivalsEyebrow"
        titleKey="home.newArrivalsTitle"
        descKey="home.newArrivalsDesc"
        products={products}
        tone="cream"
      />
    );
  }

  return (
    <>
      {eligible.map((section, idx) => {
        const products = toUiProducts(section.products, { locale }).slice(
          0,
          PRODUCTS_PER_SECTION
        );
        if (products.length === 0) return null;
        return (
          <Section
            key={section.id}
            spacing="md"
            tone={idx % 2 === 0 ? "cream" : "default"}
          >
            <Reveal>
              <SectionHeader
                title={localized(section.title, section.title_ar, locale)}
                action={
                  <Link href={viewAllHref(section.kind)} className="contents">
                    <Button
                      variant="ghost"
                      trailingIcon={
                        <ArrowRight size={16} className="rtl:-scale-x-100" />
                      }
                    >
                      {t(locale, "home.viewAll")}
                    </Button>
                  </Link>
                }
              />
            </Reveal>
            <div className="mt-8">
              <ProductCarousel products={products} />
            </div>
          </Section>
        );
      })}
    </>
  );
}
