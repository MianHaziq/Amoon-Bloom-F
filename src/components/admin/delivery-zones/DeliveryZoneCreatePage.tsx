"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { DeliveryZoneBulkForm } from "./DeliveryZoneBulkForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function DeliveryZoneCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: deliveryZonesApi.createBulk,
    onSuccess: (result) => {
      // Every name was a duplicate — nothing was created. Stay on the form so
      // the admin can adjust rather than silently "succeeding" with 0 zones.
      if (result.count === 0) {
        toast.info({ title: t("admin.deliveryZonesPage.toastNoneCreated") });
        return;
      }
      toast.success({
        title:
          result.count === 1
            ? t("admin.deliveryZonesPage.toastCreated")
            : t("admin.deliveryZonesPage.toastBulkCreated", { count: result.count }),
        description: result.skipped.length
          ? t("admin.deliveryZonesPage.toastBulkSkipped", { count: result.skipped.length })
          : undefined,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryZones.all });
      router.push("/admin/delivery-zones");
    },
    onError: (err) => toast.fromError(t("admin.deliveryZonesPage.toastCreateError"), err),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t("admin.deliveryZonesPage.bulkTitle")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.deliveryZones"), href: "/admin/delivery-zones" },
          { label: t("admin.common.new") },
        ]}
      />
      <DeliveryZoneBulkForm
        defaultRegionId={searchParams.get("region") ?? undefined}
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
