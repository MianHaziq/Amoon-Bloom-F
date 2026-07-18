"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { DeliveryZoneForm } from "./DeliveryZoneForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function DeliveryZoneCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: deliveryZonesApi.create,
    onSuccess: (created) => {
      toast.success({ title: t("admin.deliveryZonesPage.toastCreated"), description: created.name });
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryZones.all });
      router.push("/admin/delivery-zones");
    },
    onError: (err) => toast.fromError(t("admin.deliveryZonesPage.toastCreateError"), err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("admin.deliveryZonesPage.newZone")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.deliveryZones"), href: "/admin/delivery-zones" },
          { label: t("admin.common.new") },
        ]}
      />
      <DeliveryZoneForm
        defaultRegionId={searchParams.get("region") ?? undefined}
        submitLabel={t("admin.deliveryZonesPage.createSubmit")}
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
