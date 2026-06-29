import Link from "next/link";
import { Section, SectionHeader, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { sectionsApi } from "@/features/sections/api/sections.api";
import { toUiProducts } from "@/features/products/adapters";
import { ROUTES } from "@/constants/routes";
import { getServerRegion } from "@/services/serverRegion";

const MAX_SECTIONS = 3;
const PRODUCTS_PER_SECTION = 4;

/**
 * Server component — pulls curated sections from `/sections` and renders
 * each one as a titled row of products. Mirrors the mobile app's stacked
 * product sections on the home tab (spec §3.5). Sections without products
 * are skipped silently. Falls back to an empty fragment when the API is
 * unreachable so the rest of the home page survives.
 */
export async function HomeSections() {
  const region = await getServerRegion();
  const apiSections = await sectionsApi.list(region).catch(() => []);
  const eligible = [...apiSections]
    .filter((s) => s.products && s.products.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, MAX_SECTIONS);

  if (eligible.length === 0) return null;

  return (
    <>
      {eligible.map((section) => {
        const products = toUiProducts(section.products).slice(
          0,
          PRODUCTS_PER_SECTION
        );
        if (products.length === 0) return null;
        return (
          <Section key={section.id} spacing="md">
            <SectionHeader
              eyebrow="Curated edit"
              title={section.title}
              action={
                <Link href={ROUTES.shop} className="contents">
                  <Button
                    variant="ghost"
                    trailingIcon={<ArrowRight size={16} />}
                  >
                    View all
                  </Button>
                </Link>
              }
            />
            <div className="mt-10">
              <ProductGrid products={products} columns={4} />
            </div>
          </Section>
        );
      })}
    </>
  );
}
