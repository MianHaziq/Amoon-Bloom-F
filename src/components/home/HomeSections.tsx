import Link from "next/link";
import { Section, SectionHeader, Button } from "@/components/ui";
import { Reveal } from "@/components/motion/primitives";
import { ArrowRight } from "@/components/icons";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductRail } from "./ProductRail";
import { getCachedSections, getCachedProductList } from "@/services/catalogCache";
import { toUiProducts } from "@/features/products/adapters";
import { ROUTES } from "@/constants/routes";
import { getServerRegion } from "@/services/serverRegion";
import { getServerLocale } from "@/i18n/server";
import { localized, t } from "@/i18n";

// Generous cap so admins can add several rails; guards against a runaway home.
const MAX_SECTIONS = 8;
const PRODUCTS_PER_SECTION = 6;

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
    const page = await getCachedProductList(region, 1, 8).catch(() => ({
      data: [],
      meta: {},
    }));
    const products = toUiProducts(page.data, { locale }).slice(0, 6);
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
                  <Link href={ROUTES.shop} className="contents">
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
              <ProductGrid products={products} columns={4} />
            </div>
          </Section>
        );
      })}
    </>
  );
}
