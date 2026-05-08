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
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { AddToCartPanel } from "@/features/products/components/AddToCartPanel";
import { StickyAddToCart } from "@/features/products/components/StickyAddToCart";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductPrice } from "@/features/products/components/ProductPrice";
import { productsApi } from "@/features/products/api/products.api";
import { toUiProduct, toUiProducts } from "@/features/products/adapters";
import { ApiError } from "@/services/http";
import { ROUTES } from "@/constants/routes";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  try {
    const api = await productsApi.getById(slug);
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

  let api;
  try {
    api = await productsApi.getById(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }
  const product = toUiProduct(api);

  let related: ReturnType<typeof toUiProducts> = [];
  if (api.categoryId) {
    try {
      const page = await productsApi.listByCategory(api.categoryId, { limit: 8 });
      related = toUiProducts(
        page.data.filter((p) => p.id !== api.id).slice(0, 4)
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
              Home
            </Link>
            <ChevronRight size={12} />
            {product.categorySlug ? (
              <>
                <Link
                  href={ROUTES.category(product.categorySlug)}
                  className="hover:text-ink-900"
                >
                  {product.category || "Shop"}
                </Link>
                <ChevronRight size={12} />
              </>
            ) : null}
            <span className="text-ink-900">{product.title}</span>
          </nav>
        </Container>
      </section>

      <Section spacing="sm" tone="cream">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} title={product.title} />

          <div className="flex flex-col gap-6">
            <div>
              {product.category ? (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
                  {product.category}
                </p>
              ) : null}
              <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="mt-2 text-base text-ink-500">{product.subtitle}</p>
              )}
            </div>

            <ProductPrice product={product} size="lg" />

            {product.description ? (
              <p className="text-base leading-relaxed text-ink-700">
                {product.description}
              </p>
            ) : null}

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
