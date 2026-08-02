"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { DeliveryZoneForm } from "./DeliveryZoneForm";
import { DeliveryZoneBulkForm } from "./DeliveryZoneBulkForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/cn";

type CreateMode = "single" | "bulk";

export function DeliveryZoneCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();
  const [mode, setMode] = useState<CreateMode>("single");

  // Single zone — full delivery-configuration section (same form the edit page
  // uses), so the admin can set fee/same-day/lead-time/etc. right away, or leave
  // every field on "Inherit region" to skip it entirely.
  const singleMutation = useMutation({
    mutationFn: deliveryZonesApi.create,
    onSuccess: (zone) => {
      toast.success({ title: t("admin.deliveryZonesPage.toastCreated"), description: zone.name });
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryZones.all });
      router.push("/admin/delivery-zones");
    },
    onError: (err) => toast.fromError(t("admin.deliveryZonesPage.toastCreateError"), err),
  });

  // Bulk — quick names-only entry for adding several zones at once; delivery
  // config for each is then set per-zone from its edit page afterwards.
  const bulkMutation = useMutation({
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

  const defaultRegionId = searchParams.get("region") ?? undefined;

  return (
    <div className={cn("mx-auto", mode === "single" ? "max-w-6xl" : "max-w-4xl")}>
      <PageHeader
        title={t("admin.deliveryZonesPage.newZoneTitle")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.deliveryZones"), href: "/admin/delivery-zones" },
          { label: t("admin.common.new") },
        ]}
      />

      <div
        role="tablist"
        aria-label={t("admin.deliveryZoneForm.createModeTabsLabel")}
        className="mb-6 flex flex-wrap gap-2"
      >
        {(["single", "bulk"] as const).map((m) => {
          const isActive = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-bloom-500 bg-bloom-50 text-bloom-800"
                  : "border-ink-200 text-ink-700 hover:bg-cream-50"
              )}
            >
              {m === "single"
                ? t("admin.deliveryZoneForm.createTabSingle")
                : t("admin.deliveryZoneForm.createTabBulk")}
            </button>
          );
        })}
      </div>

      {mode === "single" ? (
        <DeliveryZoneForm
          defaultRegionId={defaultRegionId}
          submitLabel={t("admin.deliveryZonesPage.createSubmit")}
          submitting={singleMutation.isPending}
          onSubmit={async (payload) => {
            await singleMutation.mutateAsync(payload);
          }}
        />
      ) : (
        <DeliveryZoneBulkForm
          defaultRegionId={defaultRegionId}
          submitting={bulkMutation.isPending}
          onSubmit={async (payload) => {
            await bulkMutation.mutateAsync(payload);
          }}
        />
      )}
    </div>
  );
}
