import { notFound } from "next/navigation";
import Link from "next/link";
import { Container, Section, Divider } from "@/components/ui";
import {
  ChevronRight,
  TruckIcon,
  ShieldIcon,
  HeartIcon,
  SparkleIcon,
} from "@/components/icons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/primitives";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { AddToCartPanel } from "@/features/products/components/AddToCartPanel";
import { StickyAddToCart } from "@/features/products/components/StickyAddToCart";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductPrice } from "@/features/products/components/ProductPrice";
import { ProductTabs } from "@/features/products/components/ProductTabs";
import { PdpImageProvider } from "@/features/products/components/PdpImageContext";
import {
  getCachedProductById,
  getCachedProductsByCategory,
} from "@/services/catalogCache";
import { toUiProduct, toUiProducts } from "@/features/products/adapters";
import { ApiError } from "@/services/http";
import { ROUTES } from "@/constants/routes";
import { getServerRegion } from "@/services/serverRegion";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";

// Product visibility is region-scoped (a draft / out-of-region product 404s),
// so render per-request based on the region cookie.
export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  try {
    const region = await getServerRegion();
    const api = await getCachedProductById(region, slug);
    return {
      title: api.title,
      description: api.subtitle ?? api.descriptions?.[0]?.description ?? api.title,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [region, locale] = await Promise.all([
    getServerRegion(),
    getServerLocale(),
  ]);

  let api;
  try {
    api = await getCachedProductById(region, slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }
  const product = toUiProduct(api, { locale });

  let related: ReturnType<typeof toUiProducts> = [];
  if (api.categoryId) {
    try {
      const page = await getCachedProductsByCategory(region, api.categoryId, 8);
      related = toUiProducts(
        page.data.filter((p) => p.id !== api.id).slice(0, 4),
        { locale }
      );
    } catch {
      related = [];
    }
  }

  return (
    <>
      <section className="bg-cream-50 pt-8 pb-4">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-ink-500"
          >
            <Link href={ROUTES.home} className="hover:text-ink-900">
              {t(locale, "common.home")}
            </Link>
            <ChevronRight size={12} className="rtl:-scale-x-100" />
            {product.categorySlug ? (
              <>
                <Link
                  href={ROUTES.category(product.categorySlug)}
                  className="hover:text-ink-900"
                >
                  {product.category || t(locale, "common.shop")}
                </Link>
                <ChevronRight size={12} className="rtl:-scale-x-100" />
              </>
            ) : null}
            <span className="text-ink-900">{product.title}</span>
          </nav>
        </Container>
      </section>

      <Section spacing="sm" tone="cream">
        <PdpImageProvider product={product}>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery title={product.title} />

          <StaggerGroup className="flex flex-col gap-6" trigger="mount" stagger={0.08}>
            <StaggerItem>
              {product.category ? (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
                  {product.category}
                </p>
              ) : null}
              <h1 className="mt-2 font-display text-3xl font-medium leading-tight text-ink-900 sm:text-4xl md:text-5xl">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="mt-2 text-base text-ink-500">{product.subtitle}</p>
              )}
            </StaggerItem>

            <StaggerItem>
              <ProductPrice product={product} size="lg" />
            </StaggerItem>

            <StaggerItem>
              <Divider />
            </StaggerItem>

            <StaggerItem>
              <AddToCartPanel product={product} />
            </StaggerItem>

            <StaggerItem
              as="ul"
              className="grid grid-cols-1 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white sm:grid-cols-2 sm:gap-x-8 sm:gap-y-1 sm:divide-y-0 sm:p-5"
            >
              <PerkRow
                icon={<TruckIcon size={18} />}
                title={t(locale, "product.sameDay")}
                description={t(locale, "product.sameDayHint")}
              />
              <PerkRow
                icon={<SparkleIcon size={18} />}
                title={t(locale, "product.handArranged")}
                description={t(locale, "product.handArrangedHint")}
              />
              <PerkRow
                icon={<HeartIcon size={18} />}
                title={t(locale, "product.messageCard")}
                description={t(locale, "product.messageCardHint")}
              />
              <PerkRow
                icon={<ShieldIcon size={18} />}
                title={t(locale, "product.freshness")}
                description={t(locale, "product.freshnessHint")}
              />
            </StaggerItem>
          </StaggerGroup>
        </div>
        </PdpImageProvider>
      </Section>

      {/* Description · Additional information · Reviews (tabbed, like client) */}
      <Section spacing="md" tone="default" containerSize="md">
        <ProductTabs
          description={product.description}
          descriptions={product.descriptions}
          options={product.options}
          category={product.category}
        />
      </Section>

      {related.length > 0 && (
        <Section spacing="md" tone="cream">
          <Reveal>
            <h2 className="font-display text-3xl font-medium text-ink-900">
              {t(locale, "product.relatedTitle")}
            </h2>
          </Reveal>
          <div className="mt-10">
            <ProductGrid products={related} columns={4} />
          </div>
        </Section>
      )}

      <StickyAddToCart product={product} />
    </>
  );
}

function PerkRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-center gap-3.5 px-5 py-4 sm:px-0 sm:py-0">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush-100/70 text-bloom-700 ring-1 ring-inset ring-blush-200/70">
        {icon}
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold tracking-tight text-ink-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{description}</p>
      </div>
    </li>
  );
}
