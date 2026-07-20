"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LayersIcon } from "@/components/icons";
import { RegionForm } from "./RegionForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function RegionEditPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();
  const [confirmBulkAssign, setConfirmBulkAssign] = useState(false);

  // The backend exposes no GET /regions/:id — source the record from the list.
  const listQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });
  const region = listQuery.data?.find((r) => r.id === id);

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof regionsApi.update>[1]) =>
      regionsApi.update(id, payload),
    onSuccess: (updated) => {
      toast.success({ title: t("admin.regionsPage.toastUpdated"), description: updated.code });
      queryClient.invalidateQueries({ queryKey: queryKeys.regions.all });
      revalidateCatalog(["regions"]);
    },
    onError: (err) => toast.fromError(t("admin.regionsPage.toastUpdateError"), err),
  });

  // A brand-new region starts with zero visible products/categories — nothing
  // is linked until an admin explicitly says so (same rule every other
  // region-scoped entity follows). This is the one-click fix for "I made a
  // region and the storefront shows nothing in it": link the WHOLE existing
  // catalog at once instead of editing every product/category by hand.
  const bulkAssignMutation = useMutation({
    mutationFn: () => regionsApi.bulkAssign(id, { products: true, categories: true }),
    onSuccess: ({ productsLinked, categoriesLinked }) => {
      toast.success({
        title: t("admin.regionsPage.toastBulkAssigned"),
        description: t("admin.regionsPage.toastBulkAssignedDescription", {
          products: productsLinked,
          categories: categoriesLinked,
        }),
      });
      setConfirmBulkAssign(false);
      revalidateCatalog(["products", "categories", "sections"]);
    },
    onError: (err) => toast.fromError(t("admin.regionsPage.toastBulkAssignError"), err),
  });

  const notFound = listQuery.isSuccess && !region;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={region?.name ?? t("admin.regionsPage.editFallbackTitle")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.regions"), href: "/admin/regions" },
          { label: region?.code ?? "…" },
        ]}
      />

      {listQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : listQuery.isError || notFound ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          <p className="font-medium">
            {notFound ? t("admin.regionsPage.notFoundError") : t("admin.regionsPage.loadError")}
          </p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => router.replace("/admin/regions")}
          >
            {t("admin.regionsPage.backToList")}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bloom-100 text-bloom-700">
                <LayersIcon size={18} />
              </span>
              <div>
                <p className="font-display text-base text-ink-900">
                  {t("admin.regionsPage.bulkAssignHeading")}
                </p>
                <p className="mt-0.5 text-sm text-ink-500">
                  {t("admin.regionsPage.bulkAssignDescription")}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmBulkAssign(true)}
              className="shrink-0"
            >
              {t("admin.regionsPage.bulkAssignAction")}
            </Button>
          </div>

          <RegionForm
            initial={region}
            submitLabel={t("admin.common.saveChanges")}
            submitting={mutation.isPending}
            onSubmit={async (payload) => {
              await mutation.mutateAsync(payload);
            }}
          />

          <ConfirmDialog
            open={confirmBulkAssign}
            title={t("admin.regionsPage.bulkAssignConfirmTitle")}
            description={t("admin.regionsPage.bulkAssignConfirmDescription", {
              region: region?.name ?? "",
            })}
            confirmLabel={t("admin.regionsPage.bulkAssignAction")}
            loading={bulkAssignMutation.isPending}
            onConfirm={() => bulkAssignMutation.mutate()}
            onClose={() => setConfirmBulkAssign(false)}
          />
        </>
      )}
    </div>
  );
}
