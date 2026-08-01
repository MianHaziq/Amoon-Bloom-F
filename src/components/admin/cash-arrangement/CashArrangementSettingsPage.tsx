"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { Select } from "@/components/admin/Select";
import { Spinner } from "@/components/ui/Loader";
import { NumberChipListEditor } from "./NumberChipListEditor";
import { cashArrangementApi } from "@/features/cash-arrangement/api/cash-arrangement.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { productsApi } from "@/features/products/api/products.api";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { queryKeys } from "@/services/queryKeys";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/cn";
import type { ApiCashArrangementConfig } from "@/features/cash-arrangement/types";
import type { ApiDeliveryZone } from "@/features/delivery-zones/types";

/**
 * Admin cash-arrangement settings — ONE config PER REGION. Everything on this page is
 * region-scoped, matching how the customer experiences the feature (it's enabled and priced
 * per region). The page controls, for the selected region:
 *   - whether the "Add cash arrangement" option is offered at all, and for which
 *     products/categories (appliesTo);
 *   - the quick-pick cash amounts + banknote denomination presets shown at checkout;
 *   - the region-wide FLAT service fee (step + margin) — the base of the fee chain;
 *   - optional per-ZONE overrides of the presets AND the flat fee (zone beats region).
 * Finer per-product / per-category fee overrides live on those items' own edit pages (they
 * sit above the flat fee in the precedence chain); this page is the simple region/zone setup.
 */
export function CashArrangementSettingsPage() {
  const { t } = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);

  const configsQuery = useQuery({
    queryKey: queryKeys.cashArrangement.list(),
    queryFn: () => cashArrangementApi.list(),
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

  // Per-zone overrides (presets + flat fee) — a SEPARATE entity (DeliveryZone) from the
  // region config, so it gets its own query + mutation + save action.
  const zonesQuery = useQuery({
    queryKey: queryKeys.deliveryZones.list(),
    queryFn: () => deliveryZonesApi.list(),
  });
  const regionZones = (zonesQuery.data ?? []).filter((z) => z.regionId === activeRegionId);

  // null = editing the region defaults; a zone id = editing that zone's override.
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  useEffect(() => {
    setActiveZoneId(null);
  }, [activeRegionId]);

  const [zoneQuickPickAmounts, setZoneQuickPickAmounts] = useState<number[]>([]);
  const [zoneDenominations, setZoneDenominations] = useState<number[]>([]);
  const [zoneFeeStep, setZoneFeeStep] = useState("");
  const [zoneFeeMargin, setZoneFeeMargin] = useState("");
  useEffect(() => {
    if (!activeZoneId) return;
    const zone = regionZones.find((z) => z.id === activeZoneId);
    if (zone) {
      setZoneQuickPickAmounts(zone.cashArrangementQuickPickAmounts);
      setZoneDenominations(zone.cashArrangementDenominations);
      setZoneFeeStep(zone.cashArrangementFeeStepAmount != null ? String(Number(zone.cashArrangementFeeStepAmount)) : "");
      setZoneFeeMargin(zone.cashArrangementFeeMarginPercent != null ? String(Number(zone.cashArrangementFeeMarginPercent)) : "");
    }
    // Re-sync only when the SELECTED ZONE changes, not on every local edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeZoneId]);

  const zoneUpdateMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      cashArrangementQuickPickAmounts: number[];
      cashArrangementDenominations: number[];
      cashArrangementFeeStepAmount: number | null;
      cashArrangementFeeMarginPercent: number | null;
    }) =>
      deliveryZonesApi.update(payload.id, {
        cashArrangementQuickPickAmounts: payload.cashArrangementQuickPickAmounts,
        cashArrangementDenominations: payload.cashArrangementDenominations,
        cashArrangementFeeStepAmount: payload.cashArrangementFeeStepAmount,
        cashArrangementFeeMarginPercent: payload.cashArrangementFeeMarginPercent,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData<ApiDeliveryZone[]>(queryKeys.deliveryZones.list(), (prev) =>
        (prev ?? []).map((z) => (z.id === updated.id ? updated : z))
      );
      toast.success({ title: t("admin.cashArrangementPage.zoneSaved") });
    },
    onError: (err) => toast.fromError(t("admin.cashArrangementPage.zoneSaveError"), err),
  });

  const saveZone = () => {
    if (!activeZoneId) return;
    const step = zoneFeeStep.trim();
    const margin = zoneFeeMargin.trim();
    if ((step === "") !== (margin === "")) {
      toast.error({ title: t("admin.cashArrangementPage.feeBothOrNeither") });
      return;
    }
    zoneUpdateMutation.mutate({
      id: activeZoneId,
      cashArrangementQuickPickAmounts: zoneQuickPickAmounts,
      cashArrangementDenominations: zoneDenominations,
      cashArrangementFeeStepAmount: step === "" ? null : Number(step),
      cashArrangementFeeMarginPercent: margin === "" ? null : Number(margin),
    });
  };

  const schema = useMemo(
    () =>
      z.object({
        enabled: z.boolean(),
        appliesTo: z.enum(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS", "SPECIFIC_CATEGORIES"]),
        productIds: z.array(z.string()),
        categoryIds: z.array(z.string()),
        quickPickAmounts: z.array(z.number().int().positive()),
        denominations: z.array(z.number().int().positive()),
        feeStepAmount: z.number().nullable(),
        feeMarginPercent: z.number().nullable(),
      }),
    []
  );
  type FormValues = z.infer<typeof schema>;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      enabled: false,
      appliesTo: "ALL_PRODUCTS",
      productIds: [],
      categoryIds: [],
      quickPickAmounts: [],
      denominations: [],
      feeStepAmount: null,
      feeMarginPercent: null,
    },
  });

  useEffect(() => {
    if (!active) return;
    reset({
      enabled: active.enabled,
      appliesTo: active.appliesTo,
      productIds: active.productIds,
      categoryIds: active.categoryIds,
      quickPickAmounts: active.quickPickAmounts,
      denominations: active.denominations,
      feeStepAmount: active.feeStepAmount,
      feeMarginPercent: active.feeMarginPercent,
    });
    // Only re-sync when the active REGION changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.regionId, reset]);

  const appliesTo = watch("appliesTo");
  const productIds = watch("productIds");
  const categoryIds = watch("categoryIds");
  const quickPickAmounts = watch("quickPickAmounts");
  const denominations = watch("denominations");

  const numberOrNull = (v: string) => (v === "" || v == null ? null : Number(v));

  const updateMutation = useMutation({
    mutationFn: (payload: FormValues) => {
      if (!activeRegionId) throw new Error("No region selected");
      return cashArrangementApi.update(activeRegionId, {
        enabled: payload.enabled,
        appliesTo: payload.appliesTo,
        productIds: payload.appliesTo === "SPECIFIC_PRODUCTS" ? payload.productIds : undefined,
        categoryIds:
          payload.appliesTo === "SPECIFIC_CATEGORIES" ? payload.categoryIds : undefined,
        quickPickAmounts: payload.quickPickAmounts,
        denominations: payload.denominations,
        feeStepAmount: payload.feeStepAmount,
        feeMarginPercent: payload.feeMarginPercent,
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<ApiCashArrangementConfig[]>(queryKeys.cashArrangement.list(), (prev) =>
        (prev ?? []).map((c) => (c.regionId === updated.regionId ? updated : c))
      );
      toast.success({ title: t("admin.cashArrangementPage.saved") });
    },
    onError: (err) => toast.fromError(t("admin.cashArrangementPage.saveError"), err),
  });

  const submit = handleSubmit((v) => {
    // Region flat fee is a both-or-neither pair (backend also enforces this).
    if ((v.feeStepAmount == null) !== (v.feeMarginPercent == null)) {
      toast.error({ title: t("admin.cashArrangementPage.feeBothOrNeither") });
      return;
    }
    updateMutation.mutate(v);
  });

  const toggleId = (list: string[], id: string, key: "productIds" | "categoryIds") => {
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    setValue(key, next, { shouldDirty: true });
  };

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
        title={t("admin.cashArrangementPage.title")}
        description={t("admin.cashArrangementPage.description")}
      />

      {configs.length === 0 ? (
        <p className="text-sm text-ink-500">{t("admin.cashArrangementPage.noRegions")}</p>
      ) : (
        <>
          {/* Region picker — one tab per region, badge shows Enabled/Off. */}
          <div
            role="tablist"
            aria-label={t("admin.cashArrangementPage.regionTabsLabel")}
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
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      c.enabled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-ink-100 text-ink-500"
                    )}
                  >
                    {c.enabled
                      ? t("admin.cashArrangementPage.enabledBadge")
                      : t("admin.cashArrangementPage.off")}
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
                      {t("admin.cashArrangementPage.enabledHeading")}
                    </h3>
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        {...register("enabled")}
                        className="h-5 w-5 accent-bloom-600"
                      />
                      <span className="text-sm font-medium text-ink-900">
                        {t("admin.cashArrangementPage.enabledLabel")}
                      </span>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberChipListEditor
                      label={t("admin.cashArrangementPage.quickPickAmountsLabel")}
                      hint={t("admin.cashArrangementPage.quickPickAmountsHint")}
                      values={quickPickAmounts}
                      onChange={(next) => setValue("quickPickAmounts", next, { shouldDirty: true })}
                      placeholder="500"
                    />
                    <NumberChipListEditor
                      label={t("admin.cashArrangementPage.denominationsLabel")}
                      hint={t("admin.cashArrangementPage.denominationsHint")}
                      values={denominations}
                      onChange={(next) => setValue("denominations", next, { shouldDirty: true })}
                      placeholder="50"
                    />
                  </div>
                </section>

                {/* Region-wide FLAT service fee — the base of the fee chain, set right here.
                    Saved with the whole form on "Save cash arrangement settings". */}
                <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
                  <h3 className="font-display text-lg text-ink-900">
                    {t("admin.cashArrangementPage.feeScheduleHeading")}
                  </h3>
                  <p className="mb-4 mt-1 text-sm text-ink-500">
                    {t("admin.cashArrangementPage.regionFeeHint")}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                        {t("admin.cashArrangementPage.feeStepAmountLabel")}
                      </span>
                      <input
                        type="number"
                        min={0.01}
                        step="0.01"
                        placeholder="100"
                        {...register("feeStepAmount", { setValueAs: numberOrNull })}
                        className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-bloom-500 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                        {t("admin.cashArrangementPage.feeMarginPercentLabel")}
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="20"
                        {...register("feeMarginPercent", { setValueAs: numberOrNull })}
                        className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-bloom-500 focus:outline-none"
                      />
                    </label>
                  </div>
                  <p className="mt-3 text-xs text-ink-500">
                    {t("admin.cashArrangementPage.feeClearHint")}
                  </p>
                </section>

                {/* Per-zone overrides: presets + flat fee. Saved via the zone's own button. */}
                <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
                  <h3 className="font-display text-lg text-ink-900">
                    {t("admin.cashArrangementPage.zoneOverridesHeading")}
                  </h3>
                  <p className="mb-4 mt-1 text-sm text-ink-500">
                    {t("admin.cashArrangementPage.zoneOverridesHint")}
                  </p>

                  {regionZones.length === 0 ? (
                    <p className="text-sm text-ink-400">
                      {t("admin.cashArrangementPage.noZonesForRegion")}
                    </p>
                  ) : (
                    <>
                      <div
                        role="tablist"
                        aria-label={t("admin.cashArrangementPage.zoneTabsLabel")}
                        className="mb-4 flex flex-wrap gap-2"
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={activeZoneId === null}
                          onClick={() => setActiveZoneId(null)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                            activeZoneId === null
                              ? "border-bloom-500 bg-bloom-50 text-bloom-800"
                              : "border-ink-200 text-ink-700 hover:bg-cream-50"
                          )}
                        >
                          {t("admin.cashArrangementPage.regionDefaultTab")}
                        </button>
                        {regionZones.map((z) => {
                          const isActive = z.id === activeZoneId;
                          const hasOverride =
                            z.cashArrangementQuickPickAmounts.length > 0 ||
                            z.cashArrangementDenominations.length > 0 ||
                            z.cashArrangementFeeStepAmount != null;
                          return (
                            <button
                              key={z.id}
                              type="button"
                              role="tab"
                              aria-selected={isActive}
                              onClick={() => setActiveZoneId(z.id)}
                              className={cn(
                                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                isActive
                                  ? "border-bloom-500 bg-bloom-50 text-bloom-800"
                                  : "border-ink-200 text-ink-700 hover:bg-cream-50"
                              )}
                            >
                              {z.name}
                              {hasOverride ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-bloom-500" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>

                      {activeZoneId === null ? (
                        <p className="text-sm text-ink-500">
                          {t("admin.cashArrangementPage.regionDefaultHint")}
                        </p>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <NumberChipListEditor
                              label={t("admin.cashArrangementPage.quickPickAmountsLabel")}
                              hint={t("admin.cashArrangementPage.zoneEmptyInheritsHint")}
                              values={zoneQuickPickAmounts}
                              onChange={setZoneQuickPickAmounts}
                              placeholder="500"
                            />
                            <NumberChipListEditor
                              label={t("admin.cashArrangementPage.denominationsLabel")}
                              hint={t("admin.cashArrangementPage.zoneEmptyInheritsHint")}
                              values={zoneDenominations}
                              onChange={setZoneDenominations}
                              placeholder="50"
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-1.5">
                              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                                {t("admin.cashArrangementPage.feeStepAmountLabel")}
                              </span>
                              <input
                                type="number"
                                min={0.01}
                                step="0.01"
                                placeholder="100"
                                value={zoneFeeStep}
                                onChange={(e) => setZoneFeeStep(e.target.value)}
                                className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-bloom-500 focus:outline-none"
                              />
                            </label>
                            <label className="flex flex-col gap-1.5">
                              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                                {t("admin.cashArrangementPage.feeMarginPercentLabel")}
                              </span>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="20"
                                value={zoneFeeMargin}
                                onChange={(e) => setZoneFeeMargin(e.target.value)}
                                className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-bloom-500 focus:outline-none"
                              />
                            </label>
                          </div>
                          <p className="text-xs text-ink-500">
                            {t("admin.cashArrangementPage.zoneFeeInheritsHint")}
                          </p>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              isLoading={zoneUpdateMutation.isPending}
                              onClick={saveZone}
                            >
                              {t("admin.cashArrangementPage.saveZoneOverride")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </section>

                <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
                  <h3 className="mb-4 font-display text-lg text-ink-900">
                    {t("admin.cashArrangementPage.scopeHeading")}
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
                        aria-label={t("admin.cashArrangementPage.scopeHeading")}
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
                  <p className="text-sm text-ink-500">{t("admin.cashArrangementPage.regionHint")}</p>
                  {active.updatedAt ? (
                    <p className="mt-3 text-xs text-ink-400">
                      {t("admin.cashArrangementPage.lastUpdated")}: {new Date(active.updatedAt).toLocaleString()}
                    </p>
                  ) : null}
                </section>
              </aside>

              <div className="flex justify-end lg:col-span-2">
                <Button type="submit" size="lg" isLoading={updateMutation.isPending}>
                  {t("admin.cashArrangementPage.save")}
                </Button>
              </div>
            </form>
          ) : null}
        </>
      )}
    </div>
  );
}
