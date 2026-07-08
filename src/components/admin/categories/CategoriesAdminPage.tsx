"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import type { ApiCategory } from "@/features/categories/api-types";

export function CategoriesAdminPage() {
  const [pendingDelete, setPendingDelete] = useState<ApiCategory | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useT();

  const query = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      toast.success({ title: t("admin.categoriesPage.toastDeleted") });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      revalidateCatalog();
    },
    onError: (err) => toast.fromError(t("admin.categoriesPage.toastDeleteError"), err),
  });

  const columns: Column<ApiCategory>[] = [
    {
      key: "image",
      header: "",
      width: "64px",
      cell: (c) =>
        c.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.image} alt={c.title} className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-ink-100" />
        ),
    },
    {
      key: "title",
      header: t("admin.categoriesPage.columnCategory"),
      cell: (c) => (
        <div>
          <p className="font-medium text-ink-900">{c.title}</p>
          {c.title_ar ? <p className="text-xs text-ink-500" dir="rtl">{c.title_ar}</p> : null}
        </div>
      ),
    },
    {
      key: "products",
      header: t("admin.categoriesPage.columnProducts"),
      align: "right",
      cell: (c) => <span className="text-ink-700">{c.totalProducts}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "120px",
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/categories/${c.id}/edit`}
            className="rounded-md p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
            aria-label={t("common.edit")}
          >
            <PencilIcon size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(c)}
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
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t("admin.categoriesPage.title")}
        description={t("admin.categoriesPage.description")}
        actions={
          <Link
            href="/admin/categories/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 text-sm font-medium text-white shadow-(--shadow-bloom) transition-colors hover:bg-bloom-700"
          >
            <PlusIcon size={16} />
            {t("admin.categoriesPage.newCategory")}
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={query.data}
        rowKey={(c) => c.id}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        emptyTitle={t("admin.categoriesPage.emptyTitle")}
        emptyDescription={t("admin.categoriesPage.emptyDescription")}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("admin.categoriesPage.deleteTitle", { title: pendingDelete?.title ?? "" })}
        description={t("admin.categoriesPage.deleteDescription")}
        confirmLabel={t("common.delete")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
