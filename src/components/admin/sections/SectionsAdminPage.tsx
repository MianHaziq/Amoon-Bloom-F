"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sectionsApi } from "@/features/sections/api/sections.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useToast } from "@/hooks/useToast";
import type { ApiSection } from "@/features/sections/types";

export function SectionsAdminPage() {
  const [pendingDelete, setPendingDelete] = useState<ApiSection | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const query = useQuery({
    queryKey: queryKeys.sections.list(),
    queryFn: () => sectionsApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sectionsApi.remove(id),
    onSuccess: () => {
      toast.success({ title: "Section deleted" });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
      revalidateCatalog(["sections"]);
    },
    onError: (err) => toast.fromError("Could not delete section", err),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      sectionsApi.reorder(items),
    onSuccess: () => {
      toast.success({ title: "Order saved" });
      revalidateCatalog(["sections"]);
    },
    onError: (err) => {
      toast.fromError("Could not save order", err);
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
      header: "Section",
      cell: (s) => (
        <div>
          <p className="font-medium text-ink-900">{s.title}</p>
          {s.title_ar ? <p className="text-xs text-ink-500" dir="rtl">{s.title_ar}</p> : null}
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (s) => (
        <span className="text-xs text-ink-500">
          {s.products.length} products · {s.categories.length} categories
        </span>
      ),
    },
    {
      key: "sortOrder",
      header: "Order",
      align: "right",
      cell: (s) => <span className="text-ink-700">{s.sortOrder}</span>,
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
            aria-label="Edit"
          >
            <PencilIcon size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(s)}
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
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Sections"
        description="Curated rails of products and categories surfaced on the homepage. Drag to set their order."
        actions={
          <Link
            href="/admin/sections/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 text-sm font-medium text-white shadow-(--shadow-bloom) transition-colors hover:bg-bloom-700"
          >
            <PlusIcon size={16} />
            New section
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
        emptyTitle="No sections yet"
        emptyDescription="Create a section to feature picks on the homepage."
        sortable
        onReorder={handleReorder}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.title}?`}
        description="Removing the section won't delete its products or categories."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
