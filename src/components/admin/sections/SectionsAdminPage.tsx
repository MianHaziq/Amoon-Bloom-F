"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sectionsApi } from "@/features/sections/api/sections.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { RegionBadges } from "@/components/admin/RegionBadges";
import { Badge } from "@/components/ui";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import type { ApiSection } from "@/features/sections/types";

export function SectionsAdminPage() {
  const [pendingDelete, setPendingDelete] = useState<ApiSection | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useT();

  const query = useQuery({
    queryKey: queryKeys.sections.list(),
    queryFn: () => sectionsApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sectionsApi.remove(id),
    onSuccess: () => {
      toast.success({ title: t("admin.sectionsPage.toastDeleted") });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
      revalidateCatalog(["sections"]);
    },
    onError: (err) => toast.fromError(t("admin.sectionsPage.toastDeleteError"), err),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      sectionsApi.reorder(items),
    onSuccess: () => {
      toast.success({ title: t("admin.sectionsPage.toastOrderSaved") });
      revalidateCatalog(["sections"]);
    },
    onError: (err) => {
      toast.fromError(t("admin.sectionsPage.toastOrderError"), err);
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
    },
  });

  const handleReorder = (rows: ApiSection[]) => {
    const key = queryKeys.sections.list();
    queryClient.setQueryData(key, rows);
    reorderMutation.mutate(rows.map((s, i) => ({ id: s.id, sortOrder: i })));
  };

  const columns: Column<ApiSection>[] = [
    {
      key: "image",
      header: "",
      width: "64px",
      cell: (s) =>
        s.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-ink-100" />
        ),
    },
    {
      key: "title",
      header: t("admin.sectionsPage.columnSection"),
      cell: (s) => (
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-ink-900">{s.title}</p>
            {s.kind === "BEST_SELLERS" ? (
              <Badge tone="bloom">{t("admin.sectionForm.kindBestSellers")}</Badge>
            ) : s.kind === "NEW_ARRIVALS" ? (
              <Badge tone="bloom">{t("admin.sectionForm.kindNewArrivals")}</Badge>
            ) : null}
          </div>
          {s.title_ar ? <p className="text-xs text-ink-500" dir="rtl">{s.title_ar}</p> : null}
        </div>
      ),
    },
    {
      key: "items",
      header: t("admin.sectionsPage.columnItems"),
      cell: (s) => (
        <span className="text-xs text-ink-500">
          {t("admin.sectionsPage.itemsSummary", {
            products: s.products.length,
            categories: s.categories.length,
          })}
        </span>
      ),
    },
    {
      key: "sortOrder",
      header: t("admin.sectionsPage.columnOrder"),
      align: "right",
      cell: (s) => <span className="text-ink-700">{s.sortOrder}</span>,
    },
    {
      key: "region",
      header: t("admin.sectionsPage.columnRegion"),
      cell: (s) => <RegionBadges regions={s.regions} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "120px",
      cell: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/sections/${s.id}/edit`}
            className="rounded-md p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
            aria-label={t("common.edit")}
          >
            <PencilIcon size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(s)}
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
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("admin.sectionsPage.title")}
        description={t("admin.sectionsPage.description")}
        actions={
          <Link
            href="/admin/sections/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 text-sm font-medium text-white shadow-(--shadow-bloom) transition-colors hover:bg-bloom-700"
          >
            <PlusIcon size={16} />
            {t("admin.sectionsPage.newSection")}
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={query.data}
        rowKey={(s) => s.id}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        emptyTitle={t("admin.sectionsPage.emptyTitle")}
        emptyDescription={t("admin.sectionsPage.emptyDescription")}
        sortable
        onReorder={handleReorder}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("admin.sectionsPage.deleteTitle", { title: pendingDelete?.title ?? "" })}
        description={t("admin.sectionsPage.deleteDescription")}
        confirmLabel={t("common.delete")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
