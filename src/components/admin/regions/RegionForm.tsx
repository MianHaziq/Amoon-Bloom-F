"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { useT } from "@/i18n/useT";
import type { ApiRegion, ApiRegionCreateInput } from "@/features/regions/types";

interface RegionFormProps {
  initial?: ApiRegion;
  onSubmit: (payload: ApiRegionCreateInput) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

export function RegionForm({
  initial,
  onSubmit,
  submitLabel,
  submitting,
}: RegionFormProps) {
  const { t } = useT();
  const schema = useMemo(
    () =>
      z.object({
        code: z
          .string()
          .min(2, t("admin.regionForm.codeMin"))
          .max(10, t("admin.regionForm.codeMax")),
        name: z.string().min(1, t("admin.regionForm.nameRequired")),
        name_ar: z.string().optional().nullable(),
        currency: z
          .string()
          .length(3, t("admin.regionForm.currencyLength"))
          .toUpperCase(),
        legalEntity: z.string().max(200, t("admin.regionForm.legalEntityMax")).optional(),
        shippingFlatRate: z.number().nonnegative(t("admin.regionForm.shippingFlatRateMin")).nullable(),
        sortOrder: z
          .number()
          .int(t("admin.regionForm.sortOrderWhole"))
          .min(0, t("admin.regionForm.sortOrderMin")),
        isDefault: z.boolean(),
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
      code: "",
      name: "",
      name_ar: "",
      currency: "AED",
      legalEntity: "",
      shippingFlatRate: null,
      sortOrder: 0,
      isDefault: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!initial) return;
    reset({
      code: initial.code,
      name: initial.name,
      name_ar: initial.name_ar ?? "",
      currency: initial.currency ?? "AED",
      legalEntity: initial.legalEntity ?? "",
      shippingFlatRate: initial.shippingFlatRate != null ? Number(initial.shippingFlatRate) : null,
      sortOrder: initial.sortOrder,
      isDefault: initial.isDefault,
      isActive: initial.isActive,
    });
  }, [initial, reset]);

  const submit = handleSubmit(async (v) => {
    await onSubmit({
      code: v.code.trim().toUpperCase(),
      name: v.name.trim(),
      name_ar: v.name_ar?.trim() || null,
      currency: v.currency.trim().toUpperCase(),
      legalEntity: v.legalEntity?.trim() || null,
      shippingFlatRate: v.shippingFlatRate,
      sortOrder: v.sortOrder,
      isDefault: v.isDefault,
      isActive: v.isActive,
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.regionForm.detailsHeading")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("admin.regionForm.codeLabel")}
              placeholder="UAE"
              hint={t("admin.regionForm.codeHint")}
              error={errors.code?.message}
              {...register("code")}
            />
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
              placeholder="United Arab Emirates"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label={t("admin.regionForm.nameArLabel")}
              dir="rtl"
              placeholder="الإمارات العربية المتحدة"
              {...register("name_ar")}
            />
            <Input
              label={t("admin.regionForm.currencyLabel")}
              placeholder="AED"
              hint={t("admin.regionForm.currencyHint")}
              error={errors.currency?.message}
              {...register("currency")}
            />
            <Input
              label={t("admin.regionForm.legalEntityLabel")}
              placeholder="AMOON BLOOM Trading L.L.C S.O.C™"
              hint={t("admin.regionForm.legalEntityHint")}
              error={errors.legalEntity?.message}
              containerClassName="sm:col-span-2"
              {...register("legalEntity")}
            />
            <Input
              label={t("admin.regionForm.shippingFlatRateLabel")}
              type="number"
              step="0.01"
              min="0"
              placeholder="25.00"
              hint={t("admin.regionForm.shippingFlatRateHint")}
              error={errors.shippingFlatRate?.message}
              {...register("shippingFlatRate", {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
              })}
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
            <span className="text-sm text-ink-900">{t("admin.regionForm.activeLabel")}</span>
          </label>
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("isDefault")}
              className="h-5 w-5 accent-bloom-600"
            />
            <span className="text-sm text-ink-900">{t("admin.regionForm.defaultLabel")}</span>
          </label>
          <p className="mt-3 text-xs text-ink-500">
            {t("admin.regionForm.defaultHint")}
          </p>
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
