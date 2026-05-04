import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Container,
  Section,
  Badge,
  Divider,
} from "@/components/ui";
import {
  ChevronRight,
  TruckIcon,
  ShieldIcon,
  HeartIcon,
  StarIcon,
  SparkleIcon,
} from "@/components/icons";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { AddToCartPanel } from "@/features/products/components/AddToCartPanel";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import {
  getProductBySlug,
  getRelatedProducts,
  products,
} from "@/features/products/data/products.mock";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/lib/format";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug);
  const hasDiscount =
    product.compareAtPrice &&
    product.compareAtPrice.amount > product.price.amount;

  return (
    <>
      <section className="bg-cream-50 pt-8 pb-4">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-ink-500"
          >
            <Link href={ROUTES.home} className="hover:text-ink-900">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link
              href={ROUTES.category(product.categorySlug)}
              className="hover:text-ink-900"
            >
              {product.category}
            </Link>
            <ChevronRight size={12} />
            <span className="text-ink-900">{product.title}</span>
          </nav>
        </Container>
      </section>

      <Section spacing="sm" tone="cream">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} title={product.title} />

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
              {product.badge === "bestseller" && (
                <Badge tone="gold">Bestseller</Badge>
              )}
              {product.badge === "new" && <Badge tone="blush">New in</Badge>}
              {product.badge === "limited" && (
                <Badge tone="ink">Limited edition</Badge>
              )}
              {product.collection && (
                <Badge tone="bloom">{product.collection}</Badge>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
                {product.category}
              </p>
              <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="mt-2 text-base text-ink-500">{product.subtitle}</p>
              )}
            </div>

            {product.rating && (
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <span className="inline-flex gap-0.5 text-(--color-gold-500)">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} size={14} />
                  ))}
                </span>
                <span className="font-semibold text-ink-900">
                  {product.rating.toFixed(1)}
                </span>
                <span>·</span>
                <span>{product.reviewCount} reviews</span>
              </div>
            )}

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-medium text-ink-900">
                {formatCurrency(product.price.amount, product.price.currency)}
              </span>
              {hasDiscount && product.compareAtPrice && (
                <span className="text-base text-ink-400 line-through">
                  {formatCurrency(
                    product.compareAtPrice.amount,
                    product.compareAtPrice.currency
                  )}
                </span>
              )}
            </div>

            <p className="text-base leading-relaxed text-ink-700">
              {product.description}
            </p>

            <Divider />

            <AddToCartPanel product={product} />

            <ul className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-5 sm:grid-cols-2">
              <PerkRow
                icon={<TruckIcon size={16} />}
                title="Same-day delivery"
                description="Order before 6 PM"
              />
              <PerkRow
                icon={<SparkleIcon size={16} />}
                title="Hand-arranged"
                description="Composed for you"
              />
              <PerkRow
                icon={<HeartIcon size={16} />}
                title="Free message card"
                description="Personalised at checkout"
              />
              <PerkRow
                icon={<ShieldIcon size={16} />}
                title="7-day promise"
                description="Freshness guaranteed"
              />
            </ul>
          </div>
        </div>
      </Section>

      {/* Detail blocks */}
      {product.descriptions && product.descriptions.length > 0 && (
        <Section spacing="md" tone="default" containerSize="md">
          <div className="grid gap-10 md:grid-cols-2">
            {product.descriptions.map((d) => (
              <div key={d.id}>
                {d.title && (
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
                    {d.title}
                  </p>
                )}
                <p className="mt-3 text-base leading-relaxed text-ink-700">
                  {d.description}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section spacing="md" tone="cream">
          <h2 className="font-display text-3xl font-medium text-ink-900">
            You might also love
          </h2>
          <div className="mt-10">
            <ProductGrid products={related} columns={4} />
          </div>
        </Section>
      )}
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
    <li className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
        {icon}
      </span>
      <div className="text-sm">
        <p className="font-medium text-ink-900">{title}</p>
        <p className="text-xs text-ink-500">{description}</p>
      </div>
    </li>
  );
}
