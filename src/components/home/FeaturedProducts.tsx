import Link from "next/link";
import { Section, SectionHeader, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { products } from "@/features/products/data/products.mock";
import { ROUTES } from "@/constants/routes";

export function FeaturedProducts() {
  const featured = products.slice(0, 4);
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
