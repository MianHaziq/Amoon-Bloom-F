"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/icons";
import { useToast } from "@/hooks/useToast";
import type { ApiRegion } from "@/features/regions/types";

export function RegionsAdminPage() {
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ApiRegion | null>(null);

  const queryClient = useQueryClient();
  const toast = useToast();

  const query = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });

  const rows = useMemo(() => {
    const all = query.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (r.name_ar ?? "").toLowerCase().includes(q)
    );
  }, [query.data, search]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => regionsApi.remove(id),
    onSuccess: () => {
      toast.success({ title: "Region deleted" });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.regions.all });
    },
    onError: (err) => toast.fromError("Could not delete region", err),
  });

  const columns: Column<ApiRegion>[] = [
    {
      key: "code",
      header: "Code",
      cell: (r) => (
        <span className="font-mono font-semibold uppercase tracking-wider text-ink-900">
          {r.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      cell: (r) => (
        <div>
          <p className="text-ink-900">{r.name}</p>
          {r.name_ar ? (
            <p className="mt-0.5 text-xs text-ink-500" dir="rtl">
              {r.name_ar}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "default",
      header: "Default",
      cell: (r) =>
        r.isDefault ? <Badge tone="success">Default</Badge> : <span className="text-ink-300">—</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) =>
        r.isActive ? (
          <Badge tone="success">Active</Badge>
        ) : (
          <Badge tone="neutral">Inactive</Badge>
        ),
    },
    {
      key: "sortOrder",
      header: "Order",
      align: "right",
      cell: (r) => <span className="text-ink-700">{r.sortOrder}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "120px",
      cell: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/regions/${r.id}/edit`}
            className="rounded-md p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
            aria-label="Edit"
          >
            <PencilIcon size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(r)}
            disabled={r.isDefault}
            className="rounded-md p-2 text-bloom-700 hover:bg-bloom-50 disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:bg-transparent"
            aria-label={r.isDefault ? "Default region cannot be deleted" : "Delete"}
            title={r.isDefault ? "Default region cannot be deleted" : "Delete"}
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
        title="Regions"
        description="Storefront regions used for region-scoped catalog, pricing, and orders."
        actions={
          <Link
            href="/admin/regions/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 text-sm font-medium text-white shadow-(--shadow-bloom) transition-colors hover:bg-bloom-700"
          >
            <PlusIcon size={16} />
            New region
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        emptyTitle="No regions yet"
        emptyDescription="Create your first region to enable region-scoped content."
        toolbar={
          <div className="flex flex-1 items-center gap-2 sm:max-w-sm">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5">
              <SearchIcon size={16} className="text-ink-400" />
              <input
                placeholder="Search by code or name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
          </div>
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.code}?`}
        description="This is blocked if the region is in use by products, users, or orders. Reassign those first."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
