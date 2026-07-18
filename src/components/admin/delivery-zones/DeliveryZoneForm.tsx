"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { Spinner } from "@/components/ui/Loader";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { useT } from "@/i18n/useT";
import type { ApiDeliveryZone, ApiDeliveryZoneCreateInput } from "@/features/delivery-zones/types";

interface DeliveryZoneFormProps {
  initial?: ApiDeliveryZone;
  /** Pre-selects and locks the region when creating from within a region's context. */
  defaultRegionId?: string;
  onSubmit: (payload: ApiDeliveryZoneCreateInput) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

export function DeliveryZoneForm({
  initial,
  defaultRegionId,
  onSubmit,
  submitLabel,
  submitting,
}: DeliveryZoneFormProps) {
  const { t } = useT();
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });

  const schema = useMemo(
    () =>
      z.object({
        regionId: z.string().min(1, t("admin.deliveryZoneForm.regionRequired")),
        name: z.string().min(1, t("admin.deliveryZoneForm.nameRequired")),
        name_ar: z.string().optional().nullable(),
        sortOrder: z
          .number()
          .int(t("admin.regionForm.sortOrderWhole"))
          .min(0, t("admin.regionForm.sortOrderMin")),
        isActive: z.boolean(),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      regionId: defaultRegionId ?? "",
      name: "",
      name_ar: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!initial) return;
    reset({
      regionId: initial.regionId,
      name: initial.name,
      name_ar: initial.name_ar ?? "",
      sortOrder: initial.sortOrder,
      isActive: initial.isActive,
    });
  }, [initial, reset]);

  const submit = handleSubmit(async (v) => {
    await onSubmit({
      regionId: v.regionId,
      name: v.name.trim(),
      name_ar: v.name_ar?.trim() || null,
      sortOrder: v.sortOrder,
      isActive: v.isActive,
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.deliveryZoneForm.detailsHeading")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="zone-region"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
              >
                {t("admin.deliveryZoneForm.regionLabel")}
              </label>
              {regionsQuery.isPending ? (
                <div className="flex h-12 items-center rounded-2xl border border-ink-200 px-4">
                  <Spinner size="sm" />
                </div>
              ) : (
                <select
                  id="zone-region"
                  className="h-12 rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-900 focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100"
                  {...register("regionId")}
                >
                  <option value="">{t("admin.deliveryZoneForm.selectRegion")}</option>
                  {regionsQuery.data?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              )}
              {errors.regionId?.message ? (
                <p className="text-xs text-bloom-700">{errors.regionId.message}</p>
              ) : null}
            </div>
            <Input
              label={t("admin.regionForm.sortOrderLabel")}
              type="number"
              step="1"
              min="0"
              hint={t("admin.regionForm.sortOrderHint")}
              error={errors.sortOrder?.message}
              {...register("sortOrder", { valueAsNumber: true })}
            />
            <Input
              label={t("admin.regionForm.nameEnLabel")}
              placeholder="Dubai"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label={t("admin.regionForm.nameArLabel")}
              dir="rtl"
              placeholder="دبي"
              {...register("name_ar")}
            />
          </div>
        </section>
      </div>

      <aside>
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.regionForm.visibilityHeading")}</h3>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("isActive")}
              className="h-5 w-5 accent-bloom-600"
            />
            <span className="text-sm text-ink-900">{t("admin.deliveryZoneForm.activeLabel")}</span>
          </label>
        </section>
      </aside>

      <div className="lg:col-span-2 flex justify-end">
        <Button type="submit" size="lg" isLoading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
