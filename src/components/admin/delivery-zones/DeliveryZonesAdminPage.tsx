"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/icons";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import type { ApiDeliveryZone } from "@/features/delivery-zones/types";

export function DeliveryZonesAdminPage() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ApiDeliveryZone | null>(null);

  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useT();

  // No ?region= filter here — the admin list needs ALL zones across ALL regions
  // (staff token already returns all, including inactive; the `region` client
  // filter below narrows within that by regionId, distinct from the API's own
  // code-based scoping used by the public storefront).
  const query = useQuery({
    queryKey: queryKeys.deliveryZones.list(),
    queryFn: () => deliveryZonesApi.list(),
  });
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });
  const regionById = useMemo(
    () => new Map((regionsQuery.data ?? []).map((r) => [r.id, r])),
    [regionsQuery.data]
  );

  const rows = useMemo(() => {
    let all = query.data ?? [];
    if (regionFilter) all = all.filter((z) => z.regionId === regionFilter);
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (z) => z.name.toLowerCase().includes(q) || (z.name_ar ?? "").toLowerCase().includes(q)
    );
  }, [query.data, regionFilter, search]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deliveryZonesApi.remove(id),
    onSuccess: () => {
      toast.success({ title: t("admin.deliveryZonesPage.toastDeleted") });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryZones.all });
    },
    onError: (err) => toast.fromError(t("admin.deliveryZonesPage.toastDeleteError"), err),
  });

  const columns: Column<ApiDeliveryZone>[] = [
    {
      key: "name",
      header: t("admin.regionsPage.columnName"),
      cell: (z) => (
        <div>
          <p className="text-ink-900">{z.name}</p>
          {z.name_ar ? (
            <p className="mt-0.5 text-xs text-ink-500" dir="rtl">
              {z.name_ar}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "region",
      header: t("admin.deliveryZonesPage.columnRegion"),
      cell: (z) => (
        <span className="font-mono text-xs font-medium text-ink-700">
          {regionById.get(z.regionId)?.code ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: t("admin.status"),
      cell: (z) =>
        z.isActive ? (
          <Badge tone="success">{t("admin.active")}</Badge>
        ) : (
          <Badge tone="neutral">{t("admin.inactive")}</Badge>
        ),
    },
    {
      key: "sortOrder",
      header: t("admin.regionsPage.columnOrder"),
      align: "right",
      cell: (z) => <span className="text-ink-700">{z.sortOrder}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "120px",
      cell: (z) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/delivery-zones/${z.id}/edit`}
            className="rounded-md p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
            aria-label={t("common.edit")}
          >
            <PencilIcon size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(z)}
            className="rounded-md p-2 text-bloom-700 hover:bg-bloom-50"
            aria-label={t("common.delete")}
            title={t("common.delete")}
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
        title={t("admin.deliveryZonesPage.title")}
        description={t("admin.deliveryZonesPage.description")}
        actions={
          <Link
            href="/admin/delivery-zones/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 text-sm font-medium text-white shadow-(--shadow-bloom) transition-colors hover:bg-bloom-700"
          >
            <PlusIcon size={16} />
            {t("admin.deliveryZonesPage.newZone")}
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(z) => z.id}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        emptyTitle={t("admin.deliveryZonesPage.emptyTitle")}
        emptyDescription={t("admin.deliveryZonesPage.emptyDescription")}
        toolbar={
          <div className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 sm:max-w-sm">
              <SearchIcon size={16} className="text-ink-400" />
              <input
                placeholder={t("admin.deliveryZonesPage.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-bloom-400 focus:outline-none"
            >
              <option value="">{t("admin.deliveryZonesPage.allRegions")}</option>
              {regionsQuery.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("admin.deliveryZonesPage.deleteTitle", { name: pendingDelete?.name ?? "" })}
        description={t("admin.deliveryZonesPage.deleteDescription")}
        confirmLabel={t("common.delete")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
