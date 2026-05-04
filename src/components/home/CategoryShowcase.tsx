import { Section, SectionHeader, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import { categories } from "@/features/categories/data/categories.mock";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function CategoryShowcase() {
  const featured = categories.filter((c) => c.featured).slice(0, 3);
  return (
    <Section spacing="lg" tone="cream">
      <SectionHeader
        eyebrow="Browse the boutique"
        title={
          <>
            For every quiet
            <br className="hidden md:block" /> celebration.
          </>
        }
        description="From a single peony to a corporate installation, every category is composed by our team in Downtown Dubai."
        action={
          <Link href={ROUTES.shop} className="contents">
            <Button variant="ghost" trailingIcon={<ArrowRight size={16} />}>
              Browse all
            </Button>
          </Link>
        }
      />
      <div className="mt-10 grid gap-5 md:grid-cols-3 lg:gap-6">
        {featured.map((cat, i) => (
          <CategoryCard key={cat.id} category={cat} priority={i === 0} />
        ))}
      </div>
    </Section>
  );
}
