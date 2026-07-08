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
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/useToast";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import type { ApiProduct } from "@/features/products/api-types";
import type { PaginatedResponse } from "@/types";

const PAGE_SIZE = 20;

export function ProductsAdminPage() {
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ApiProduct | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list({ page, limit: PAGE_SIZE }),
    queryFn: () => productsApi.list({ page, limit: PAGE_SIZE }),
  });

  // Categories — used to render the column. We'd rather show a name than an id.
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  });
  const categoryById = (id: string | null) =>
    categoriesQuery.data?.find((c) => c.id === id)?.title ?? "—";

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      productsApi.reorder(items),
    onSuccess: () => {
      toast.success({ title: "Order saved" });
      revalidateCatalog(["products", "sections"]);
    },
    onError: (err) => {
      toast.fromError("Could not save order", err);
      // Roll back to the server's order on failure.
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const handleReorder = (rows: ApiProduct[]) => {
    const key = queryKeys.products.list({ page, limit: PAGE_SIZE });
    const prev = queryClient.getQueryData<PaginatedResponse<ApiProduct>>(key);
    if (prev) queryClient.setQueryData(key, { ...prev, data: rows });
    const base = (page - 1) * PAGE_SIZE;
    reorderMutation.mutate(
      rows.map((p, i) => ({ id: p.id, sortOrder: base + i }))
    );
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      toast.success({ title: "Product deleted" });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      revalidateCatalog();
    },
    onError: (err) => {
      toast.fromError("Could not delete product", err);
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
      header: "Product",
      cell: (p) => (
        <div>
          <p className="font-medium text-ink-900">{p.title}</p>
          {p.subtitle ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{p.subtitle}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (p) => <span className="text-ink-700">{categoryById(p.categoryId)}</span>,
    },
    {
      key: "price",
      header: "Price",
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
      header: "Stock",
      align: "right",
      cell: (p) =>
        p.quantity > 0 ? (
          <Badge tone={p.quantity < 5 ? "warning" : "neutral"}>{p.quantity}</Badge>
        ) : (
          <Badge tone="danger">Out</Badge>
        ),
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
            aria-label="Edit"
          >
            <PencilIcon size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(p)}
            className="rounded-md p-2 text-bloom-700 hover:bg-bloom-50"
            aria-label="Delete"
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
        title="Products"
        description="Manage your boutique catalogue. Drag the handle to set display order."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 text-sm font-medium text-white shadow-(--shadow-bloom) transition-colors hover:bg-bloom-700"
          >
            <PlusIcon size={16} />
            New product
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={productsQuery.data?.data}
        rowKey={(p) => p.id}
        isLoading={productsQuery.isPending}
        isError={productsQuery.isError}
        error={productsQuery.error}
        emptyTitle="No products yet"
        emptyDescription="Add your first product to start selling."
        sortable
        onReorder={handleReorder}
        footer={
          <Pagination
            meta={productsQuery.data?.meta?.pagination}
            page={page}
            onChange={setPage}
          />
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.title}?`}
        description="This permanently removes the product from your catalogue. Active orders are unaffected."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
