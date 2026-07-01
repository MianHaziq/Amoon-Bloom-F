import Link from "next/link";
import { Section, SectionHeader, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { productsApi } from "@/features/products/api/products.api";
import { toUiCategories } from "@/features/categories/adapters";
import { ROUTES } from "@/constants/routes";
import { getServerRegion } from "@/services/serverRegion";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";

export async function CategoryShowcase() {
  const [region, locale] = await Promise.all([
    getServerRegion(),
    getServerLocale(),
  ]);
  const apiCategories = await categoriesApi.list(region).catch(() => []);
  const featured = toUiCategories(apiCategories, locale).slice(0, 3);

  if (featured.length === 0) return null;

  // Many categories have no image set. Fall back to a representative product
  // image from the category so the cards always look intentional & composed.
  const cards = await Promise.all(
    featured.map(async (cat) => {
      if (cat.image.url.startsWith("http")) return { cat, fallbackImage: undefined };
      try {
        const page = await productsApi.listByCategory(cat.id, { limit: 1, region });
        const p = page.data?.[0];
        return { cat, fallbackImage: p?.images?.[0] ?? p?.image ?? undefined };
      } catch {
        return { cat, fallbackImage: undefined };
      }
    })
  );

  return (
    <Section spacing="lg" tone="cream">
      <SectionHeader
        eyebrow={t(locale, "home.categoriesEyebrow")}
        title={t(locale, "home.categoriesTitle")}
        description={t(locale, "home.categoriesDesc")}
        action={
          <Link href={ROUTES.shop} className="contents">
            <Button
              variant="ghost"
              trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
            >
              {t(locale, "home.browseAll")}
            </Button>
          </Link>
        }
      />
      <div className="mt-10 grid gap-5 md:grid-cols-3 lg:gap-6">
        {cards.map(({ cat, fallbackImage }, i) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            fallbackImage={fallbackImage}
            priority={i === 0}
          />
        ))}
      </div>
    </Section>
  );
}
