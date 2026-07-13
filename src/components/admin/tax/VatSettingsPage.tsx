"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { Select } from "@/components/admin/Select";
import { Spinner } from "@/components/ui/Loader";
import { vatApi } from "@/features/vat/api/vat.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { productsApi } from "@/features/products/api/products.api";
import { queryKeys } from "@/services/queryKeys";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/cn";
import type { ApiVatConfig } from "@/features/vat/types";

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Admin VAT settings — one config PER REGION (UAE 5%, KSA 15%, ...). A row of region "tabs"
 * (each showing its current rate/off state) switches which region the form below edits;
 * saving only ever touches the selected region's config.
 */
export function VatSettingsPage() {
  const { t } = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);

  const configsQuery = useQuery({
    queryKey: queryKeys.vat.list(),
    queryFn: () => vatApi.list(),
  });
  const configs = configsQuery.data ?? [];

  useEffect(() => {
    if (!activeRegionId && configsQuery.data && configsQuery.data.length > 0) {
      setActiveRegionId(configsQuery.data[0].regionId);
    }
  }, [configsQuery.data, activeRegionId]);

  const active = configs.find((c) => c.regionId === activeRegionId) ?? null;

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list({ limit: 100 }),
    queryFn: () => productsApi.list({ limit: 100 }),
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  });

  const schema = useMemo(
    () =>
      z.object({
        enabled: z.boolean(),
        ratePercent: z
          .number()
          .min(0, t("admin.vatPage.rateInvalid"))
          .max(100, t("admin.vatPage.rateInvalid")),
        inclusive: z.boolean(),
        appliesTo: z.enum(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS", "SPECIFIC_CATEGORIES"]),
        productIds: z.array(z.string()),
        categoryIds: z.array(z.string()),
      }),
    [t]
  );
  type FormValues = z.infer<typeof schema>;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      enabled: false,
      ratePercent: 0,
      inclusive: false,
      appliesTo: "ALL_PRODUCTS",
      productIds: [],
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (!active) return;
    reset({
      enabled: active.enabled,
      ratePercent: active.ratePercent,
      inclusive: active.inclusive,
      appliesTo: active.appliesTo,
      productIds: active.productIds,
      categoryIds: active.categoryIds,
    });
    // Only re-sync when the active REGION changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.regionId, reset]);

  const appliesTo = watch("appliesTo");
  const enabled = watch("enabled");
  const inclusive = watch("inclusive");
  const ratePercent = watch("ratePercent");
  const productIds = watch("productIds");
  const categoryIds = watch("categoryIds");

  const updateMutation = useMutation({
    mutationFn: (payload: FormValues) => {
      if (!activeRegionId) throw new Error("No region selected");
      return vatApi.update(activeRegionId, {
        enabled: payload.enabled,
        ratePercent: payload.ratePercent,
        inclusive: payload.inclusive,
        appliesTo: payload.appliesTo,
        productIds: payload.appliesTo === "SPECIFIC_PRODUCTS" ? payload.productIds : undefined,
        categoryIds:
          payload.appliesTo === "SPECIFIC_CATEGORIES" ? payload.categoryIds : undefined,
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<ApiVatConfig[]>(queryKeys.vat.list(), (prev) =>
        (prev ?? []).map((c) => (c.regionId === updated.regionId ? updated : c))
      );
      toast.success({ title: t("admin.vatPage.saved") });
    },
    onError: (err) => toast.fromError(t("admin.vatPage.saveError"), err),
  });

  const submit = handleSubmit((v) => updateMutation.mutate(v));

  const toggleId = (list: string[], id: string, key: "productIds" | "categoryIds") => {
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    setValue(key, next, { shouldDirty: true });
  };

  // Live preview on a sample 100.00 line, so the admin can see the effect of the rate/inclusive
  // toggle before saving.
  const sampleAmount = 100;
  const rate = Number(ratePercent) || 0;
  const preview =
    enabled && rate > 0
      ? inclusive
        ? { extracted: round2(sampleAmount - sampleAmount / (1 + rate / 100)) }
        : { added: round2(sampleAmount * (rate / 100)), total: round2(sampleAmount * (1 + rate / 100)) }
      : null;

  if (configsQuery.isPending) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("admin.vatPage.title")}
        description={t("admin.vatPage.description")}
      />

      {configs.length === 0 ? (
        <p className="text-sm text-ink-500">{t("admin.vatPage.noRegions")}</p>
      ) : (
        <>
          {/* Region picker — one tab per region, badge shows its current rate/off state. */}
          <div
            role="tablist"
            aria-label={t("admin.vatPage.regionTabsLabel")}
            className="mb-6 flex flex-wrap gap-2"
          >
            {configs.map((c) => {
              const isActive = c.regionId === activeRegionId;
              return (
                <button
                  key={c.regionId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveRegionId(c.regionId)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-bloom-500 bg-bloom-50 text-bloom-800"
                      : "border-ink-200 text-ink-700 hover:bg-cream-50"
                  )}
                >
                  <span>{c.regionName ?? c.regionCode}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                      c.enabled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-ink-100 text-ink-500"
                    )}
                  >
                    {c.enabled ? `${c.ratePercent}%` : t("admin.vatPage.off")}
                  </span>
                </button>
              );
            })}
          </div>

          {active ? (
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
              <div className="flex flex-col gap-6">
                <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-display text-lg text-ink-900">
                      {t("admin.vatPage.rateHeading")}
                    </h3>
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        {...register("enabled")}
                        className="h-5 w-5 accent-bloom-600"
                      />
                      <span className="text-sm font-medium text-ink-900">
                        {t("admin.vatPage.enabledLabel")}
                      </span>
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={t("admin.vatPage.rateLabel")}
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      hint={t("admin.vatPage.rateHint")}
                      error={errors.ratePercent?.message}
                      {...register("ratePercent", { valueAsNumber: true })}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                        {t("admin.vatPage.inclusiveLabel")}
                      </label>
                      <label className="flex min-h-11.5 cursor-pointer items-center gap-3 rounded-2xl border border-ink-200 px-4 py-2.5">
                        <input
                          type="checkbox"
                          {...register("inclusive")}
                          className="h-5 w-5 shrink-0 accent-bloom-600"
                        />
                        <span className="text-sm text-ink-700">
                          {t("admin.vatPage.inclusiveHint")}
                        </span>
                      </label>
                    </div>
                  </div>

                  {preview ? (
                    <p className="mt-4 rounded-xl bg-cream-50 px-4 py-3 text-sm text-ink-600">
                      {inclusive
                        ? t("admin.vatPage.previewInclusive", {
                            amount: sampleAmount.toFixed(2),
                            rate,
                            extracted: preview.extracted!.toFixed(2),
                          })
                        : t("admin.vatPage.previewExclusive", {
                            amount: sampleAmount.toFixed(2),
                            rate,
                            added: preview.added!.toFixed(2),
                            total: preview.total!.toFixed(2),
                          })}
                    </p>
                  ) : null}
                </section>

                <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
                  <h3 className="mb-4 font-display text-lg text-ink-900">
                    {t("admin.vatPage.scopeHeading")}
                  </h3>
                  <Controller
                    control={control}
                    name="appliesTo"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        className="mb-4"
                        triggerClassName="w-full rounded-2xl py-3 justify-between"
                        aria-label={t("admin.vatPage.scopeHeading")}
                        options={[
                          { value: "ALL_PRODUCTS", label: t("admin.promoCodeForm.scopeAllProducts") },
                          {
                            value: "SPECIFIC_PRODUCTS",
                            label: t("admin.promoCodeForm.scopeSpecificProducts"),
                          },
                          {
                            value: "SPECIFIC_CATEGORIES",
                            label: t("admin.promoCodeForm.scopeSpecificCategories"),
                          },
                        ]}
                      />
                    )}
                  />

                  {appliesTo === "SPECIFIC_PRODUCTS" ? (
                    <div className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-ink-100 bg-cream-50 p-3 sm:grid-cols-2">
                      {productsQuery.data?.data.map((p) => {
                        const checked = productIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                              checked ? "bg-bloom-100 text-bloom-800" : "hover:bg-cream-100"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleId(productIds, p.id, "productIds")}
                              className="shrink-0 accent-bloom-600"
                            />
                            <span className="min-w-0 truncate">{p.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}

                  {appliesTo === "SPECIFIC_CATEGORIES" ? (
                    <div className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-ink-100 bg-cream-50 p-3 sm:grid-cols-2">
                      {categoriesQuery.data?.map((c) => {
                        const checked = categoryIds.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                              checked ? "bg-bloom-100 text-bloom-800" : "hover:bg-cream-100"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleId(categoryIds, c.id, "categoryIds")}
                              className="shrink-0 accent-bloom-600"
                            />
                            <span className="min-w-0 truncate">{c.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                </section>
              </div>

              <aside className="flex flex-col gap-6">
                <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
                  <h3 className="mb-2 font-display text-lg text-ink-900">
                    {active.regionName ?? active.regionCode}
                  </h3>
                  <p className="text-sm text-ink-500">{t("admin.vatPage.regionHint")}</p>
                  {active.updatedAt ? (
                    <p className="mt-3 text-xs text-ink-400">
                      {t("admin.vatPage.lastUpdated")}: {new Date(active.updatedAt).toLocaleString()}
                    </p>
                  ) : null}
                </section>
              </aside>

              <div className="flex justify-end lg:col-span-2">
                <Button type="submit" size="lg" isLoading={updateMutation.isPending}>
                  {t("admin.vatPage.save")}
                </Button>
              </div>
            </form>
          ) : null}
        </>
      )}
    </div>
  );
}
