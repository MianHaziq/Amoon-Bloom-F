import { notFound } from "next/navigation";
import Link from "next/link";
import { Container, Section } from "@/components/ui";
import { ChevronRight } from "@/components/icons";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import {
  getCategoryBySlug,
  categories,
} from "@/features/categories/data/categories.mock";
import { getProductsByCategory } from "@/features/products/data/products.mock";
import { ROUTES } from "@/constants/routes";
import { pluralize } from "@/lib/format";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.title}`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const items = getProductsByCategory(slug);

  return (
    <>
      <section className="border-b border-ink-100 bg-cream-50 pt-12 pb-10 lg:pt-16 lg:pb-14">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-ink-500"
          >
            <Link href={ROUTES.home} className="hover:text-ink-900">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link href={ROUTES.shop} className="hover:text-ink-900">
              Shop
            </Link>
            <ChevronRight size={12} />
            <span className="text-ink-900">{category.title}</span>
          </nav>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {category.tagline}
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl lg:text-6xl">
            {category.title}
          </h1>
          {category.description && (
            <p className="mt-3 max-w-2xl text-ink-500">{category.description}</p>
          )}
          <p className="mt-4 text-xs text-ink-400">
            {pluralize(items.length, "piece")} in this edit
          </p>
        </Container>
      </section>

      <Section spacing="md" tone="default">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-ink-200 bg-cream-50 py-20 text-center">
            <p className="font-display text-2xl text-ink-900">
              No pieces in this category yet.
            </p>
            <Link
              href={ROUTES.shop}
              className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              Browse the boutique
            </Link>
          </div>
        ) : (
          <ProductGrid products={items} columns={4} priorityCount={4} />
        )}
      </Section>
    </>
  );
}
