import Link from "next/link";
import { Section, SectionHeader, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { productsApi } from "@/features/products/api/products.api";
import { toUiProducts } from "@/features/products/adapters";
import { ROUTES } from "@/constants/routes";
import { getServerRegion } from "@/services/serverRegion";

/**
 * Server component — fetches the most recent products from the API and
 * surfaces 4 of them. Falls back silently to an empty grid if the backend
 * is unreachable, so a single failure on this section won't break the
 * homepage.
 */
export async function FeaturedProducts() {
  const region = await getServerRegion();
  const page = await productsApi
    .list({ page: 1, limit: 4, region })
    .catch(() => ({ data: [], meta: {} }));
  const featured = toUiProducts(page.data);

  if (featured.length === 0) return null;

  return (
    <Section spacing="lg">
      <SectionHeader
        eyebrow="Florist's edit"
        title="The week's quiet favourites."
        description="Hand-picked by our boutique team — composed for any room, any occasion."
        action={
          <Link href={ROUTES.shop} className="contents">
            <Button variant="ghost" trailingIcon={<ArrowRight size={16} />}>
              View edit
            </Button>
          </Link>
        }
      />
      <div className="mt-12">
        <ProductGrid products={featured} columns={4} />
      </div>
    </Section>
  );
}
