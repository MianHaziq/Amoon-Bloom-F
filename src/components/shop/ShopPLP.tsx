"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "motion/react";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductFilters } from "@/features/products/components/ProductFilters";
import { Drawer, Button } from "@/components/ui";
import { FilterIcon } from "@/components/icons";
import { baseTransition } from "@/lib/motion";
import type { Product, ProductFilter } from "@/features/products/types";
import type { Category } from "@/features/categories/types";
import { useT } from "@/i18n/useT";

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t, tc } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const hasActiveFilters =
    (!lockedCategorySlug && Boolean(filter.category)) ||
    Boolean(filter.inStock) ||
    Boolean(q) ||
    (filter.sort ? filter.sort !== "featured" : false);

  const clearAll = () => {
    setFilter({ sort: "featured", category: lockedCategorySlug });
    router.push(lockedCategorySlug ? window.location.pathname : "/shop");
  };

  const setFilterSafe = (next: ProductFilter) =>
    setFilter({ ...next, category: lockedCategorySlug ?? next.category });

  const filtered = useMemo(() => {
    // NOTE: text search (`q`) is resolved server-side by the shop page via the
    // /products/search endpoint, so `products` is already the matched set. We do
    // NOT re-filter by `q` here — the backend also matches subtitle/category, which
    // a naive client title-filter would wrongly hide. Category/sort/in-stock remain
    // client-side refinements layered on top of the (search or full) result set.
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
    <>
      {/* Mobile filter/sort bar (sidebar is desktop-only) */}
      {!lockedCategorySlug && (
        <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
          <p className="text-sm text-ink-500">
            {tc(filtered.length, "units.resultOne", "units.resultOther")}
          </p>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-cream-50 active:bg-cream-100"
          >
            <FilterIcon size={16} />
            {t("shop.filterSort")}
            {hasActiveFilters && (
              <span className="h-1.5 w-1.5 rounded-full bg-bloom-600" />
            )}
          </button>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
        {lockedCategorySlug ? (
          <div className="hidden lg:block" />
        ) : (
          <ProductFilters
            className="hidden lg:flex"
            filter={filter}
            onChange={setFilterSafe}
            resultCount={products.length}
            categories={categories}
          />
        )}

        <div>
          <p className="mb-6 hidden text-sm text-ink-500 lg:block">
            {tc(filtered.length, "units.resultOne", "units.resultOther")}
          </p>
          {/* Crossfade the result set on any filter/sort/search change. The key
              change swaps the panel via AnimatePresence (mode="wait"); the fresh
              ProductGrid remount replays its stagger as the new set enters. */}
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={`${filter.category ?? "all"}|${filter.sort ?? "featured"}|${filter.inStock ? 1 : 0}|${q}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={baseTransition}
            >
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-ink-200 bg-cream-50 py-16 text-center sm:py-20">
                  <p className="font-display text-2xl text-ink-900">
                    {t("shop.noMatches")}
                  </p>
                  <p className="max-w-sm text-sm text-ink-500">
                    {q
                      ? `${t("shop.noMatchesSearch")} "${searchParams.get("q")}".`
                      : t("shop.noMatchesBody")}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="md"
                      onClick={clearAll}
                      className="mt-2"
                    >
                      {t("shop.clearFilters")}
                    </Button>
                  )}
                </div>
              ) : (
                <ProductGrid products={filtered} columns={3} priorityCount={3} />
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile filter/sort drawer */}
      {!lockedCategorySlug && (
        <Drawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          side="left"
          title={t("shop.filterSort")}
        >
          <div className="flex flex-col gap-6">
            <ProductFilters
              filter={filter}
              onChange={setFilterSafe}
              resultCount={products.length}
              categories={categories}
            />
            <Button fullWidth size="lg" onClick={() => setFiltersOpen(false)}>
              {`${t("shop.showResults")} ${tc(filtered.length, "units.resultOne", "units.resultOther")}`}
            </Button>
          </div>
        </Drawer>
      )}
    </>
  );
}
