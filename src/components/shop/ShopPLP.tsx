"use client";

import { useMemo, useState } from "react";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductFilters } from "@/features/products/components/ProductFilters";
import type { Product, ProductFilter } from "@/features/products/types";
import type { Category } from "@/features/categories/types";
import { pluralize } from "@/lib/format";

interface ShopPLPProps {
  products: Product[];
  categories: Category[];
  /** When set, the category sidebar is hidden and the filter is locked. */
  lockedCategorySlug?: string;
}

export function ShopPLP({
  products,
  categories,
  lockedCategorySlug,
}: ShopPLPProps) {
  const [filter, setFilter] = useState<ProductFilter>({
    sort: "featured",
    category: lockedCategorySlug,
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
      case "price-asc":
        list.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case "price-desc":
        list.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case "newest":
        // No `createdAt` on the storefront type; we keep server order which is
        // the backend's default (newest first via Prisma orderBy).
        break;
      default:
        break;
    }
    return list;
  }, [products, filter]);

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
      {lockedCategorySlug ? (
        <div className="hidden lg:block">
          {/* Empty column for layout symmetry; locked category page hides
              the sidebar list because it'd be redundant. */}
        </div>
      ) : (
        <ProductFilters
          filter={filter}
          onChange={(next) =>
            setFilter({
              ...next,
              // Don't allow unlocking an explicit category page.
              category: lockedCategorySlug ?? next.category,
            })
          }
          resultCount={products.length}
          categories={categories}
        />
      )}

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
              Try widening your filters — our florists rotate the collection
              weekly.
            </p>
          </div>
        ) : (
          <ProductGrid products={filtered} columns={3} priorityCount={3} />
        )}
      </div>
    </div>
  );
}
