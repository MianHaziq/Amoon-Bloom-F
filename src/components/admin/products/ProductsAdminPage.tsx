"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { RegionBadges } from "@/components/admin/RegionBadges";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Select } from "@/components/admin/Select";
import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import type { ApiProduct } from "@/features/products/api-types";
import type { PaginatedResponse } from "@/types";

const DEFAULT_PAGE_SIZE = 20;
// Selectable table page sizes (rows per page).
const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];
// Sentinel for the category filter's "All categories" option — kept out of the
// query params entirely rather than sent as an empty categoryId.
const ALL_CATEGORIES = "all";

export function ProductsAdminPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [pendingDelete, setPendingDelete] = useState<ApiProduct | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useT();

  // Categories — used to render the column and populate the filter dropdown.
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  });
  const categoryById = (id: string | null) =>
    categoriesQuery.data?.find((c) => c.id === id)?.title ?? "—";

  const isFiltered = Boolean(debouncedSearch) || categoryFilter !== ALL_CATEGORIES;
  // Category-wise reorder: drag is allowed on the plain catalogue AND when narrowed to a
  // single category (so an admin can set a category's product order), but NOT while a
  // search term is active — search results aren't a stable, orderable list.
  const isCategoryOnlyFilter =
    !debouncedSearch && categoryFilter !== ALL_CATEGORIES;
  const params = {
    page,
    limit: pageSize,
    ...(categoryFilter !== ALL_CATEGORIES ? { categoryId: categoryFilter } : {}),
  };

  // A search term routes to the dedicated (pg_trgm-indexed) search endpoint — matches
  // title/subtitle/description (EN + AR) and category name. No term just lists the
  // catalogue in its normal admin display order, optionally narrowed by category.
  const productsQuery = useQuery({
    queryKey: debouncedSearch
      ? queryKeys.products.search(debouncedSearch, params)
      : queryKeys.products.list(params),
    queryFn: () =>
      debouncedSearch
        ? productsApi.search(debouncedSearch, params)
        : productsApi.list(params),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      productsApi.reorder(items),
    onSuccess: () => {
      toast.success({ title: t("admin.productsPage.toastOrderSaved") });
      revalidateCatalog(["products", "sections"]);
    },
    onError: (err) => {
      toast.fromError(t("admin.productsPage.toastOrderError"), err);
      // Roll back to the server's order on failure.
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const handleReorder = (rows: ApiProduct[]) => {
    const key = queryKeys.products.list(params);
    const prev = queryClient.getQueryData<PaginatedResponse<ApiProduct>>(key);
    if (prev) queryClient.setQueryData(key, { ...prev, data: rows });
    const base = (page - 1) * pageSize;
    reorderMutation.mutate(
      rows.map((p, i) => ({ id: p.id, sortOrder: base + i }))
    );
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      toast.success({ title: t("admin.productsPage.toastDeleted") });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      revalidateCatalog();
    },
    onError: (err) => {
      toast.fromError(t("admin.productsPage.toastDeleteError"), err);
    },
  });

  const columns: Column<ApiProduct>[] = [
    {
      key: "image",
      header: "",
      width: "64px",
      cell: (p) =>
        p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt={p.title}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-ink-100" />
        ),
    },
    {
      key: "title",
      header: t("admin.productsPage.columnProduct"),
      cell: (p) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-ink-900">{p.title}</p>
            {p.comingSoon ? <Badge tone="gold">{t("common.comingSoon")}</Badge> : null}
          </div>
          {p.subtitle ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{p.subtitle}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "category",
      header: t("admin.productsPage.columnCategory"),
      cell: (p) => <span className="text-ink-700">{categoryById(p.categoryId)}</span>,
    },
    {
      key: "price",
      header: t("admin.productsPage.columnPrice"),
      align: "right",
      cell: (p) => (
        <div className="text-end">
          <p className="font-medium text-ink-900">
            {formatCurrency(
              p.discountedPrice != null && p.discountedPrice < p.price
                ? p.discountedPrice
                : p.price
            )}
          </p>
          {p.discountedPrice != null && p.discountedPrice < p.price ? (
            <p className="text-xs text-ink-400 line-through">
              {formatCurrency(p.price)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "stock",
      header: t("admin.productsPage.columnStock"),
      align: "right",
      cell: (p) =>
        p.quantity > 0 ? (
          <Badge tone={p.quantity < 5 ? "warning" : "neutral"}>{p.quantity}</Badge>
        ) : (
          <Badge tone="danger">{t("admin.productsPage.outOfStock")}</Badge>
        ),
    },
    {
      key: "region",
      header: t("admin.productsPage.columnRegion"),
      cell: (p) => <RegionBadges regions={p.regions} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "120px",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/products/${p.id}/edit`}
            className="rounded-md p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
            aria-label={t("common.edit")}
          >
            <PencilIcon size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(p)}
            className="rounded-md p-2 text-bloom-700 hover:bg-bloom-50"
            aria-label={t("common.delete")}
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={t("admin.productsPage.title")}
        description={t("admin.productsPage.description")}
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 text-sm font-medium text-white shadow-(--shadow-bloom) transition-colors hover:bg-bloom-700"
          >
            <PlusIcon size={16} />
            {t("admin.productsPage.newProduct")}
          </Link>
        }
      />

      {isCategoryOnlyFilter ? (
        <p className="mb-3 text-xs text-ink-500">
          {t("admin.productsPage.reorderCategoryHint")}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={productsQuery.data?.data}
        rowKey={(p) => p.id}
        isLoading={productsQuery.isPending}
        isError={productsQuery.isError}
        error={productsQuery.error}
        emptyTitle={
          isFiltered ? t("admin.productsPage.noMatchesTitle") : t("admin.productsPage.emptyTitle")
        }
        emptyDescription={
          isFiltered
            ? t("admin.productsPage.noMatchesDescription")
            : t("admin.productsPage.emptyDescription")
        }
        toolbar={
          <div className="flex w-full flex-wrap items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 sm:max-w-sm">
              <SearchIcon size={16} className="text-ink-400" />
              <input
                placeholder={t("admin.productsPage.searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
              aria-label={t("admin.productsPage.categoryFilterLabel")}
              options={[
                { value: ALL_CATEGORIES, label: t("admin.productsPage.allCategories") },
                ...(categoriesQuery.data?.map((c) => ({ value: c.id, label: c.title })) ?? []),
              ]}
            />
          </div>
        }
        // Drag-to-reorder writes an absolute sortOrder derived from each row's on-screen
        // position. It's meaningful for the full catalogue AND for a single-category view
        // (the product `sortOrder` is the same field the storefront orders a category by),
        // so both allow dragging. A search term does NOT: its results aren't a stable,
        // orderable list, so reordering there would scramble the catalogue.
        sortable={!debouncedSearch}
        onReorder={handleReorder}
        footer={
          <>
            <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-ink-500">
              <span className="hidden whitespace-nowrap sm:inline">
                {t("admin.productsPage.rowsPerPage")}
              </span>
              <Select
                value={String(pageSize)}
                onChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
                openUp
                triggerClassName="min-w-0 gap-1.5 px-3 py-1.5 text-xs font-semibold"
                aria-label={t("admin.productsPage.rowsPerPage")}
                options={PAGE_SIZE_OPTIONS.map((n) => ({
                  value: String(n),
                  label: String(n),
                }))}
              />
            </div>
            <Pagination
              meta={productsQuery.data?.meta?.pagination}
              page={page}
              onChange={setPage}
              className="flex flex-1 flex-wrap items-center justify-between gap-3 min-w-0"
            />
          </>
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("admin.productsPage.deleteTitle", { title: pendingDelete?.title ?? "" })}
        description={t("admin.productsPage.deleteDescription")}
        confirmLabel={t("common.delete")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
