"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "motion/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductFilters } from "@/features/products/components/ProductFilters";
import {
  deriveColorFacets,
  derivePriceBounds,
  productHasColor,
} from "@/features/products/facets";
import { productsApi } from "@/features/products/api/products.api";
import { toUiProducts } from "@/features/products/adapters";
import { BEST_SELLING_FILTER_VALUE, NEW_ARRIVALS_FILTER_VALUE } from "@/features/products/facets";
import {
  Drawer,
  Button,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  CurrencyAmount,
} from "@/components/ui";
import { FilterIcon, CloseIcon, ChevronDown, CheckIcon, ArrowRight } from "@/components/icons";
import { baseTransition } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import type { ProductFilter } from "@/features/products/types";
import type { ApiProduct } from "@/features/products/api-types";
import type { PaginatedResponse, ResponseMeta } from "@/types/api";
import type { Category } from "@/features/categories/types";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";

const SORTS: {
  value: NonNullable<ProductFilter["sort"]>;
  labelKey: MessageKey;
}[] = [
  { value: "featured", labelKey: "shop.sortFeatured" },
  { value: "newest", labelKey: "shop.sortNewest" },
  { value: "price-asc", labelKey: "shop.sortPriceAsc" },
  { value: "price-desc", labelKey: "shop.sortPriceDesc" },
];

interface ShopPLPProps {
  /** Raw first page from SSR — seeds the query so first paint uses SSR HTML. */
  initialProducts: ApiProduct[];
  initialMeta?: ResponseMeta;
  categories: Category[];
  /** Full catalogue size, for the "Everything" sidebar count. */
  catalogTotal?: number;
  /** Page size used by the server's first page + each "Load more" fetch. */
  pageSize?: number;
  /** When set, the category sidebar is hidden and the category is locked. */
  lockedCategorySlug?: string;
}

/** A dismissible active-filter pill shown in the toolbar. */
function FilterChip({
  label,
  onRemove,
}: {
  label: ReactNode;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-bloom-300 hover:bg-bloom-50 hover:text-bloom-700"
    >
      <span className="capitalize">{label}</span>
      <CloseIcon size={12} />
    </button>
  );
}

/** Placeholder grid shown while a new source (category/search) is loading. */
function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4" aria-hidden>
          <div className="skeleton aspect-4/5 w-full rounded-2xl" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ShopPLP({
  initialProducts,
  initialMeta,
  categories,
  catalogTotal,
  pageSize = 12,
  lockedCategorySlug,
}: ShopPLPProps) {
  const searchParams = useSearchParams();
  const rawQ = (searchParams.get("q") ?? "").trim();
  const q = rawQ.toLowerCase();
  const [filter, setFilter] = useState<ProductFilter>(() => ({
    sort: "featured",
    // Seed the data source from the `?category=` URL param on mount, so the
    // homepage's Best Sellers / New Arrivals "View all" links (which navigate to
    // /shop?category=<sentinel>) — and any shared /shop?category=<slug> URL —
    // land on the intended feed instead of the default catalogue. The
    // /shop/category/[slug] route's lockedCategorySlug always wins when present.
    category: lockedCategorySlug ?? searchParams.get("category") ?? undefined,
  }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t, tc, locale: uiLocale } = useT();
  const { currency, locale } = useCurrency();
  const router = useRouter();

  // The data SOURCE is the (locked-or-selected) category, or the search query.
  // Category & search are resolved SERVER-SIDE + paginated here — so browsing a
  // category returns that category's full set, not just whatever happened to be
  // on the first page. Price/colour/stock/sort are client refinements layered
  // on top of the loaded source. staleTime mirrors the catalogue cache.
  const activeCategory = lockedCategorySlug ?? filter.category;
  // The SSR seed corresponds to "no user-selected category" (+ current ?q=).
  const seedable = (activeCategory ?? null) === (lockedCategorySlug ?? null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey: ["shop-plp", activeCategory ?? null, rawQ || null],
    queryFn: ({ pageParam }): Promise<PaginatedResponse<ApiProduct>> => {
      const params = { page: pageParam, limit: pageSize };
      if (rawQ) return productsApi.search(rawQ, params);
      if (activeCategory === BEST_SELLING_FILTER_VALUE)
        return productsApi.bestSellers(params);
      if (activeCategory === NEW_ARRIVALS_FILTER_VALUE)
        return productsApi.newArrivals(params);
      if (activeCategory)
        return productsApi.listByCategory(activeCategory, params);
      return productsApi.list(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage.meta?.pagination;
      return p && p.page < p.totalPages ? p.page + 1 : undefined;
    },
    initialData: seedable
      ? {
          pages: [{ data: initialProducts, meta: initialMeta ?? {} }],
          pageParams: [1],
        }
      : undefined,
    staleTime: 60_000,
  });

  const loaded = useMemo(
    () =>
      toUiProducts(
        (data?.pages ?? []).flatMap((pg) => pg.data),
        { locale: uiLocale, currency }
      ),
    [data, uiLocale, currency]
  );
  const sourceTotal =
    data?.pages[0]?.meta?.pagination?.total ?? loaded.length;
  const everythingCount = catalogTotal ?? sourceTotal;

  // Facets derive from the loaded source, so price bounds / swatches reflect the
  // current category and widen as more pages load.
  const priceBounds = useMemo(() => derivePriceBounds(loaded), [loaded]);
  const colorFacets = useMemo(() => deriveColorFacets(loaded), [loaded]);

  const selectedColors = filter.colors ?? [];
  const priceTouched =
    priceBounds != null &&
    ((filter.minPrice != null && filter.minPrice > priceBounds.min) ||
      (filter.maxPrice != null && filter.maxPrice < priceBounds.max));

  const hasActiveFilters =
    (!lockedCategorySlug && Boolean(filter.category)) ||
    Boolean(filter.inStock) ||
    Boolean(q) ||
    selectedColors.length > 0 ||
    priceTouched ||
    (filter.sort ? filter.sort !== "featured" : false);

  const clearAll = () => {
    setFilter({ sort: "featured", category: lockedCategorySlug });
    router.push(lockedCategorySlug ? window.location.pathname : "/shop");
  };

  const setFilterSafe = (next: ProductFilter) =>
    setFilter({ ...next, category: lockedCategorySlug ?? next.category });

  const filtered = useMemo(() => {
    // Category & text search are applied server-side (they define the query
    // source), so we do NOT re-filter them here. Everything below is a client
    // refinement over the loaded source.
    let list = [...loaded];
    if (filter.inStock) {
      list = list.filter((p) => p.inStock);
    }
    if (filter.minPrice != null) {
      list = list.filter((p) => p.price.amount >= filter.minPrice!);
    }
    if (filter.maxPrice != null) {
      list = list.filter((p) => p.price.amount <= filter.maxPrice!);
    }
    const colors = filter.colors ?? [];
    if (colors.length > 0) {
      list = list.filter((p) => productHasColor(p, colors));
    }
    switch (filter.sort) {
      case "price-asc":
        list.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case "price-desc":
        list.sort((a, b) => b.price.amount - a.price.amount);
        break;
      default:
        break;
    }
    return list;
  }, [loaded, filter]);

  // Category slug → title, for the active-filter chip label.
  const categoryTitle =
    filter.category === BEST_SELLING_FILTER_VALUE
      ? t("shop.bestSelling")
      : filter.category === NEW_ARRIVALS_FILTER_VALUE
        ? t("shop.newArrivals")
        : filter.category
          ? categories.find((c) => c.slug === filter.category)?.title ?? filter.category
          : undefined;

  const filterKey = `${activeCategory ?? "all"}|${filter.sort ?? "featured"}|${filter.inStock ? 1 : 0}|${filter.minPrice ?? ""}|${filter.maxPrice ?? ""}|${selectedColors.join(",")}|${q}`;

  const sidebar = (
    <ProductFilters
      filter={filter}
      onChange={setFilterSafe}
      resultCount={everythingCount}
      categories={categories}
      colorFacets={colorFacets}
      priceBounds={priceBounds}
    />
  );

  return (
    <>
      {/* Toolbar: result count · sort · mobile filter trigger. Stacks on phones
          so the (sometimes long) sort label never collides with the count. */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-500">
          {tc(filtered.length, "units.resultOne", "units.resultOther")}
        </p>

        <div className="flex items-center gap-2.5">
          {/* Sort — custom Menu dropdown */}
          <Menu className="flex-1 sm:flex-none" openOnHover>
            <MenuTrigger
              label={t("shop.sortBy")}
              className="group inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-full border border-ink-200 bg-white ps-4 pe-3 text-sm font-medium text-ink-900 transition-colors hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-400 sm:w-auto sm:justify-start"
            >
              <span>{t(SORTS.find((s) => s.value === (filter.sort ?? "featured"))?.labelKey ?? "shop.sortFeatured")}</span>
              <ChevronDown size={15} className="shrink-0 text-ink-400 transition-transform duration-200 group-aria-expanded:rotate-180" />
            </MenuTrigger>
            <MenuContent align="start" className="min-w-48">
              {SORTS.map((opt) => {
                const active = (filter.sort ?? "featured") === opt.value;
                return (
                  <MenuItem
                    key={opt.value}
                    onSelect={() => setFilterSafe({ ...filter, sort: opt.value })}
                    trailing={active ? <CheckIcon size={14} className="text-bloom-600" /> : undefined}
                    className={active ? "font-semibold text-ink-900" : undefined}
                  >
                    {t(opt.labelKey)}
                  </MenuItem>
                );
              })}
            </MenuContent>
          </Menu>

          {/* Mobile filter trigger (sidebar is desktop-only) */}
          {!lockedCategorySlug && (
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-cream-50 active:bg-cream-100 lg:hidden"
            >
              <FilterIcon size={16} />
              {t("shop.filters")}
              {hasActiveFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-bloom-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Active-filter chips */}
      {hasActiveFilters && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {!lockedCategorySlug && categoryTitle && (
            <FilterChip
              label={categoryTitle}
              onRemove={() => setFilterSafe({ ...filter, category: undefined })}
            />
          )}
          {priceTouched && priceBounds && (
            <FilterChip
              label={
                <>
                  <CurrencyAmount
                    amount={filter.minPrice ?? priceBounds.min}
                    currency={currency}
                    locale={locale}
                  />
                  {" – "}
                  <CurrencyAmount
                    amount={filter.maxPrice ?? priceBounds.max}
                    currency={currency}
                    locale={locale}
                  />
                </>
              }
              onRemove={() =>
                setFilterSafe({
                  ...filter,
                  minPrice: undefined,
                  maxPrice: undefined,
                })
              }
            />
          )}
          {selectedColors.map((c) => (
            <FilterChip
              key={c}
              label={c}
              onRemove={() =>
                setFilterSafe({
                  ...filter,
                  colors:
                    selectedColors.filter((x) => x !== c).length > 0
                      ? selectedColors.filter((x) => x !== c)
                      : undefined,
                })
              }
            />
          ))}
          {filter.inStock && (
            <FilterChip
              label={t("shop.inStockOnly")}
              onRemove={() => setFilterSafe({ ...filter, inStock: undefined })}
            />
          )}
          <button
            type="button"
            onClick={clearAll}
            className="ms-1 text-xs font-semibold text-bloom-700 underline-offset-4 hover:underline"
          >
            {t("shop.clearAll")}
          </button>
        </div>
      )}

      <div
        className={cn(
          "grid gap-10 lg:gap-12",
          lockedCategorySlug ? "" : "lg:grid-cols-[16rem_1fr]"
        )}
      >
        {!lockedCategorySlug && (
          <div className="hidden lg:block">{sidebar}</div>
        )}

        <div>
          {/* Crossfade the result set on any source/filter/sort change. */}
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={filterKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={baseTransition}
            >
              {isPending ? (
                <SkeletonGrid count={pageSize >= 6 ? 6 : pageSize} />
              ) : filtered.length === 0 ? (
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

          {/* See more — progress bar + arrow link */}
          {!isPending && hasNextPage && (
            <div className="mt-14 flex flex-col items-center gap-4">
              {/* Progress bar */}
              <div className="relative h-0.5 w-32 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="absolute inset-y-0 inset-s-0 rounded-full bg-bloom-400 transition-all duration-500"
                  style={{ width: `${Math.round((loaded.length / Math.max(sourceTotal, 1)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-ink-400">
                {t("shop.showing", {
                  shown: String(loaded.length),
                  total: String(sourceTotal),
                })}
              </p>
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 text-sm font-medium text-ink-700 transition-colors hover:text-bloom-600 disabled:opacity-40"
              >
                {isFetchingNextPage ? (
                  <span className="text-ink-400">{t("shop.loadMore")}…</span>
                ) : (
                  <>
                    {t("shop.loadMore")}
                    <ArrowRight size={15} className="rtl:-scale-x-100" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {!lockedCategorySlug && (
        <Drawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          side="left"
          title={t("shop.filters")}
          footer={
            <Button fullWidth size="lg" onClick={() => setFiltersOpen(false)}>
              {`${t("shop.showResults")} ${tc(filtered.length, "units.resultOne", "units.resultOther")}`}
            </Button>
          }
        >
          <div className="px-6 py-5">
            {sidebar}
          </div>
        </Drawer>
      )}
    </>
  );
}
