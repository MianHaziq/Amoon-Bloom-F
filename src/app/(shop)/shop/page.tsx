"use client";

import { useMemo, useState } from "react";
import { Container, Section } from "@/components/ui";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductFilters } from "@/features/products/components/ProductFilters";
import { products } from "@/features/products/data/products.mock";
import type { ProductFilter } from "@/features/products/types";
import { pluralize } from "@/lib/format";

export default function ShopPage() {
  const [filter, setFilter] = useState<ProductFilter>({
    sort: "featured",
  });

  const filtered = useMemo(() => {
    let list = [...products];
    if (filter.category) {
      list = list.filter((p) => p.categorySlug === filter.category);
    }
    if (filter.inStock) {
      list = list.filter((p) => p.inStock);
    }
    switch (filter.sort) {
      case "newest":
        list = list.filter((p) => p.badge === "new").concat(
          list.filter((p) => p.badge !== "new")
        );
        break;
      case "price-asc":
        list.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case "price-desc":
        list.sort((a, b) => b.price.amount - a.price.amount);
        break;
      default:
        // featured: bestsellers first, then sorted by id
        list.sort((a, b) => {
          const aw = a.badge === "bestseller" ? 0 : 1;
          const bw = b.badge === "bestseller" ? 0 : 1;
          return aw - bw;
        });
    }
    return list;
  }, [filter]);

  return (
    <>
      <section className="border-b border-ink-100 bg-cream-50 pt-12 pb-10 lg:pt-16 lg:pb-12">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            Shop the boutique
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
            Hand-arranged for every quiet celebration.
          </h1>
          <p className="mt-3 max-w-2xl text-ink-500">
            Composed in our Downtown Dubai studio. Same-day delivery on orders
            placed before 6 PM.
          </p>
        </Container>
      </section>

      <Section spacing="md" tone="default">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
          <ProductFilters
            filter={filter}
            onChange={setFilter}
            resultCount={products.length}
          />
          <div>
            <p className="mb-6 text-sm text-ink-500">
              {pluralize(filtered.length, "result")}
            </p>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-ink-200 bg-cream-50 py-20 text-center">
                <p className="font-display text-2xl text-ink-900">
                  Nothing here just yet.
                </p>
                <p className="max-w-sm text-sm text-ink-500">
                  Try widening your filters — our florists rotate the
                  collection weekly.
                </p>
              </div>
            ) : (
              <ProductGrid products={filtered} columns={3} priorityCount={3} />
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
