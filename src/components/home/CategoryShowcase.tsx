import Link from "next/link";
import { Section, SectionHeader, Button } from "@/components/ui";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/primitives";
import { ArrowRight } from "@/components/icons";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import {
  getCachedCategories,
  getCachedProductsByCategory,
} from "@/services/catalogCache";
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
  const apiCategories = await getCachedCategories(region).catch(() => []);
  const featured = toUiCategories(apiCategories, locale).slice(0, 4);

  if (featured.length === 0) return null;

  // Many categories have no image set. Fall back to a representative product
  // image so the cards always look intentional. These lookups are region-cached
  // (getCachedProductsByCategory) and this whole section renders inside a
  // <Suspense> boundary on the home page, so the fallback fetch no longer
  // blocks first paint or repeats on every visit.
  const cards = await Promise.all(
    featured.map(async (cat) => {
      if (cat.image.url.startsWith("http")) return { cat, fallbackImage: undefined };
      try {
        const page = await getCachedProductsByCategory(region, cat.id, 1);
        const p = page.data?.[0];
        return { cat, fallbackImage: p?.images?.[0] ?? p?.image ?? undefined };
      } catch {
        return { cat, fallbackImage: undefined };
      }
    })
  );

  return (
    <Section spacing="lg" tone="cream">
      <Reveal>
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
      </Reveal>
      <StaggerGroup className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {cards.map(({ cat, fallbackImage }, i) => (
          <StaggerItem key={cat.id}>
            <CategoryCard
              category={cat}
              fallbackImage={fallbackImage}
              priority={i === 0}
            />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  );
}
