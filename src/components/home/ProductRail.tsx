import Link from "next/link";
import { Section, SectionHeader, Button } from "@/components/ui";
import { Reveal } from "@/components/motion/primitives";
import { ArrowRight } from "@/components/icons";
import { ProductCarousel } from "@/features/products/components/ProductCarousel";
import { ROUTES } from "@/constants/routes";
import { t } from "@/i18n";
import type { Locale } from "@/store/slices/ui.slice";
import type { Product } from "@/features/products/types";
import type { MessageKey } from "@/i18n";

/**
 * Shared home product rail (header + 4-up grid) used by the Best Sellers and
 * New Arrivals sections so they stay visually identical, matching the client's
 * two homepage product rows. Renders nothing when there are no products.
 */
export function ProductRail({
  locale,
  eyebrowKey,
  titleKey,
  descKey,
  products,
  spacing = "md",
  tone,
  id,
  viewAllHref,
}: {
  locale: Locale;
  eyebrowKey: MessageKey;
  titleKey: MessageKey;
  descKey: MessageKey;
  products: Product[];
  spacing?: "sm" | "md" | "lg";
  tone?: "default" | "cream";
  id?: string;
  /** Where "View all" navigates. Defaults to the plain shop page; pass a
   *  `/shop?category=<sentinel-or-slug>` href so the destination continues
   *  the same product set shown in this rail instead of the full catalogue. */
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;
  return (
    <Section id={id} spacing={spacing} tone={tone}>
      <Reveal>
        <SectionHeader
          eyebrow={t(locale, eyebrowKey)}
          title={t(locale, titleKey)}
          description={t(locale, descKey)}
          action={
            <Link href={viewAllHref ?? ROUTES.shop} className="contents">
              <Button
                variant="ghost"
                trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
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
}
