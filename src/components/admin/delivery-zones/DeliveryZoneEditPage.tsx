"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { DeliveryZoneForm } from "./DeliveryZoneForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function DeliveryZoneEditPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  // The backend exposes no GET /delivery-zones/:id — source the record from the list.
  const listQuery = useQuery({
    queryKey: queryKeys.deliveryZones.list(),
    queryFn: () => deliveryZonesApi.list(),
  });
  const zone = listQuery.data?.find((z) => z.id === id);

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof deliveryZonesApi.update>[1]) =>
      deliveryZonesApi.update(id, payload),
    onSuccess: (updated) => {
      toast.success({ title: t("admin.deliveryZonesPage.toastUpdated"), description: updated.name });
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryZones.all });
    },
    onError: (err) => toast.fromError(t("admin.deliveryZonesPage.toastUpdateError"), err),
  });

  const notFound = listQuery.isSuccess && !zone;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={zone?.name ?? t("admin.deliveryZonesPage.editFallbackTitle")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.deliveryZones"), href: "/admin/delivery-zones" },
          { label: zone?.name ?? "…" },
        ]}
      />

      {listQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : listQuery.isError || notFound ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          <p className="font-medium">
            {notFound ? t("admin.deliveryZonesPage.notFoundError") : t("admin.deliveryZonesPage.loadError")}
          </p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => router.replace("/admin/delivery-zones")}
          >
            {t("admin.regionsPage.backToList")}
          </button>
        </div>
      ) : (
        <DeliveryZoneForm
          initial={zone}
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
