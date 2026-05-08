"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { promoCodesApi } from "@/features/promo-codes/api/promo-codes.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { formatDate } from "@/lib/format";
import type { ApiPromoCode } from "@/features/promo-codes/types";

const PAGE_SIZE = 20;

export function PromoCodesAdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [pendingDelete, setPendingDelete] = useState<ApiPromoCode | null>(null);

  const queryClient = useQueryClient();
  const toast = useToast();

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(debounced ? { search: debounced } : {}),
  };

  const query = useQuery({
    queryKey: queryKeys.promoCodes.list(params),
    queryFn: () => promoCodesApi.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promoCodesApi.remove(id),
    onSuccess: () => {
      toast.success({ title: "Promo code deleted" });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.promoCodes.all });
    },
    onError: (err) => toast.fromError("Could not delete promo code", err),
  });

  const columns: Column<ApiPromoCode>[] = [
    {
      key: "code",
      header: "Code",
      cell: (p) => (
        <div>
          <p className="font-mono font-semibold uppercase tracking-wider text-ink-900">
            {p.code}
          </p>
          <p className="mt-0.5 text-xs text-ink-500">{p.name}</p>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      cell: (p) => (
        <span className="text-ink-700">
          {p.discountType === "PERCENTAGE"
            ? `${p.discountValue}%`
            : `$${p.discountValue}`}
        </span>
      ),
    },
    {
      key: "scope",
      header: "Scope",
      cell: (p) => (
        <span className="text-xs text-ink-500">
          {p.appliesTo === "ALL_PRODUCTS"
            ? "All products"
            : p.appliesTo === "SPECIFIC_PRODUCTS"
            ? `${p.productIds?.length ?? 0} products`
            : `${p.categoryIds?.length ?? 0} categories`}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => {
        const now = Date.now();
        const expired = p.expiresAt && new Date(p.expiresAt).getTime() < now;
        const scheduled = p.startsAt && new Date(p.startsAt).getTime() > now;
        if (!p.isActive) return <Badge tone="neutral">Inactive</Badge>;
        if (expired) return <Badge tone="danger">Expired</Badge>;
        if (scheduled) return <Badge tone="warning">Scheduled</Badge>;
        return <Badge tone="success">Active</Badge>;
      },
    },
    {
      key: "expires",
      header: "Expires",
      cell: (p) => (
        <span className="text-xs text-ink-500">
          {p.expiresAt ? formatDate(p.expiresAt) : "—"}
        </span>
      ),
    },
    {
      key: "uses",
      header: "Uses",
      align: "right",
      cell: (p) => (
        <span className="text-ink-700">
          {p.usageCount ?? 0}
          {p.usageLimit ? ` / ${p.usageLimit}` : ""}
        </span>
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
            href={`/admin/promo-codes/${p.id}/edit`}
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
        title="Promo codes"
        description="Discount codes you can share with customers."
        actions={
          <Link
            href="/admin/promo-codes/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 text-sm font-medium text-white shadow-(--shadow-bloom) transition-colors hover:bg-bloom-700"
          >
            <PlusIcon size={16} />
            New code
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={query.data?.data}
        rowKey={(p) => p.id}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        toolbar={
          <div className="flex flex-1 items-center gap-2 sm:max-w-sm">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5">
              <SearchIcon size={16} className="text-ink-400" />
              <input
                placeholder="Search by code or name"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
          </div>
        }
        footer={
          <Pagination
            meta={query.data?.meta?.pagination}
            page={page}
            onChange={setPage}
          />
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.code}?`}
        description="This permanently removes the code. Existing redemptions are kept for reporting."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
