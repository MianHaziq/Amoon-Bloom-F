"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { RegionForm } from "./RegionForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function RegionEditPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

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
    },
    onError: (err) => toast.fromError(t("admin.regionsPage.toastUpdateError"), err),
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
        <RegionForm
          initial={region}
          submitLabel={t("admin.common.saveChanges")}
          submitting={mutation.isPending}
          onSubmit={async (payload) => {
            await mutation.mutateAsync(payload);
          }}
        />
      )}
    </div>
  );
}
