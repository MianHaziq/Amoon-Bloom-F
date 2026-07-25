"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Select } from "@/components/admin/Select";
import { Skeleton, Spinner } from "@/components/ui/Loader";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "@/components/ui";
import { DownloadIcon, ChevronDownIcon } from "@/components/icons";
import { downloadBlob } from "@/lib/download";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/services/http";
import { formatCurrency, formatCompactCurrency } from "@/lib/format";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n/messages";

const ALL_REGIONS = "ALL";

const PRESETS = [
  { value: "today", labelKey: "admin.analyticsPage.presetToday" },
  { value: "week", labelKey: "admin.analyticsPage.presetWeek" },
  { value: "month", labelKey: "admin.analyticsPage.presetMonth" },
  { value: "year", labelKey: "admin.analyticsPage.presetYear" },
  { value: "all_time", labelKey: "admin.analyticsPage.presetAllTime" },
] as const satisfies { value: string; labelKey: MessageKey }[];

type Preset = typeof PRESETS[number]["value"];

export function AnalyticsAdminPage() {
  const { t } = useT();
  const toast = useToast();
  const [preset, setPreset] = useState<Preset>("month");
  const [region, setRegion] = useState<string>(ALL_REGIONS);

  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });
  const regionsList = regionsQuery.data ?? [];

  // If the selected region disappears (deleted/deactivated, or a stale code),
  // fall back to the combined per-region view instead of a blank page. Derived
  // during render — never downgrade while the list is still loading.
  const selectedRegionMissing =
    region !== ALL_REGIONS &&
    regionsList.length > 0 &&
    !regionsList.some((r) => r.code === region);
  const effectiveRegion = selectedRegionMissing ? ALL_REGIONS : region;
  const regionParam =
    effectiveRegion === ALL_REGIONS ? {} : { region: effectiveRegion };

  const exportMutation = useMutation({
    mutationFn: (format: "xlsx" | "pdf" | "csv") =>
      analyticsApi.exportFile({ preset, ...regionParam, format }),
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename);
      toast.success({ title: t("admin.analyticsPage.exportSuccess") });
    },
    onError: (err) => toast.fromError(t("admin.analyticsPage.exportError"), err),
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={t("admin.analyticsPage.title")}
        description={t("admin.analyticsPage.description")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={effectiveRegion}
              onChange={setRegion}
              triggerClassName="text-xs py-1.5"
              aria-label={t("admin.analyticsPage.allRegionsOption")}
              options={[
                { value: ALL_REGIONS, label: t("admin.analyticsPage.allRegionsOption") },
                ...regionsList.map((r) => ({
                  value: r.code,
                  label: r.name,
                })),
              ]}
            />
            <div className="flex max-w-full overflow-x-auto rounded-full border border-ink-200 bg-white p-1 text-xs">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPreset(p.value)}
                  className={
                    "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 transition-colors " +
                    (preset === p.value
                      ? "bg-ink-900 text-white"
                      : "text-ink-700 hover:bg-ink-50")
                  }
                >
                  {t(p.labelKey)}
                </button>
              ))}
            </div>
            <Menu>
              {/* MenuTrigger already renders a <button> — its child must not be
                  one too (invalid nested-button HTML), so this mirrors
                  Button's outline/sm look as a plain span instead of using
                  <Button> directly. */}
              <MenuTrigger
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-200 bg-transparent px-4 text-sm font-medium tracking-tight text-ink-900 transition-all hover:border-ink-300 hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-60"
                label={t("admin.analyticsPage.exportButton")}
              >
                {exportMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <DownloadIcon size={16} />
                )}
                <span>{t("admin.analyticsPage.exportButton")}</span>
                <ChevronDownIcon size={14} />
              </MenuTrigger>
              <MenuContent align="end">
                <MenuItem
                  icon={<DownloadIcon size={16} />}
                  disabled={exportMutation.isPending}
                  onSelect={() => exportMutation.mutate("xlsx")}
                >
                  {t("admin.analyticsPage.exportExcel")}
                </MenuItem>
                <MenuItem
                  icon={<DownloadIcon size={16} />}
                  disabled={exportMutation.isPending}
                  onSelect={() => exportMutation.mutate("pdf")}
                >
                  {t("admin.analyticsPage.exportPdf")}
                </MenuItem>
                <MenuItem
                  icon={<DownloadIcon size={16} />}
                  disabled={exportMutation.isPending}
                  onSelect={() => exportMutation.mutate("csv")}
                >
                  {t("admin.analyticsPage.exportCsv")}
                </MenuItem>
              </MenuContent>
            </Menu>
          </div>
        }
      />

      {/* Regions each have their own currency with no FX rate between them, so a
          single combined view would sum AED + SAR into one meaningless figure.
          The "All regions" view instead renders one full analytics block per
          region, each in its own currency; a specific selection shows just that
          region. */}
      {effectiveRegion === ALL_REGIONS ? (
        regionsQuery.isPending ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {regionsList.map((r) => (
              <RegionAnalytics
                key={r.code}
                preset={preset}
                regionCode={r.code}
                heading={r.name}
                currencyFallback={r.currency}
              />
            ))}
          </div>
        )
      ) : (
        <RegionAnalytics preset={preset} regionCode={effectiveRegion} />
      )}
    </div>
  );
}

/**
 * The full analytics body (KPIs + sales-by-day + revenue-by-category) scoped to
 * ONE region, always shown in that region's currency. Rendered once per region
 * in the combined view and once on its own for a specific selection.
 */
function RegionAnalytics({
  preset,
  regionCode,
  heading,
  currencyFallback,
}: {
  preset: Preset;
  regionCode: string;
  heading?: string;
  currencyFallback?: string;
}) {
  const { t } = useT();
  const params = { preset, region: regionCode };

  const revenueQuery = useQuery({
    queryKey: queryKeys.analytics.revenue(params),
    queryFn: () => analyticsApi.revenue(params),
  });
  const byCategoryQuery = useQuery({
    queryKey: queryKeys.analytics.revenueByCategory(params),
    queryFn: () => analyticsApi.revenueByCategory(params),
  });
  const dailyQuery = useQuery({
    queryKey: queryKeys.analytics.salesByDay(params),
    queryFn: () => analyticsApi.salesByDay(params),
  });

  const summary = revenueQuery.data?.summary;
  const currency = revenueQuery.data?.currency ?? currencyFallback ?? "AED";

  const series = useMemo(
    () => (Array.isArray(dailyQuery.data?.points) ? dailyQuery.data!.points : []),
    [dailyQuery.data]
  );
  const max = useMemo(
    () => Math.max(1, ...series.map((d) => Number(d.netRevenue) || 0)),
    [series]
  );

  const categories = useMemo(
    () =>
      Array.isArray(byCategoryQuery.data?.categories)
        ? byCategoryQuery.data!.categories
        : [],
    [byCategoryQuery.data]
  );
  const totalCategoryRevenue = useMemo(
    () => categories.reduce((s, r) => s + (Number(r.revenue) || 0), 0),
    [categories]
  );

  return (
    <div>
      {heading ? (
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-display text-xl text-ink-900">{heading}</h2>
          <span className="rounded-full bg-cream-100 px-2 py-0.5 text-xs font-medium text-ink-600">
            {currency}
          </span>
        </div>
      ) : null}

      {revenueQuery.isError ? <ErrorBanner error={revenueQuery.error} /> : null}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi
          label={t("admin.analyticsPage.kpiRevenue")}
          value={summary ? formatCompactCurrency(summary.revenue, currency) : null}
          title={summary ? formatCurrency(summary.revenue, currency) : undefined}
          loading={revenueQuery.isPending}
        />
        <Kpi
          label={t("admin.analyticsPage.kpiOrders")}
          value={summary ? String(summary.activeOrderCount) : null}
          loading={revenueQuery.isPending}
        />
        <Kpi
          label={t("admin.analyticsPage.kpiAvgOrderValue")}
          value={
            summary ? formatCurrency(summary.averageOrderValue, currency) : null
          }
          loading={revenueQuery.isPending}
        />
      </section>

      <section className="mb-6 rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <h3 className="mb-4 font-display text-lg text-ink-900">
          {t("admin.analyticsPage.salesByDayHeading")}
        </h3>
        {dailyQuery.isPending ? (
          <Skeleton className="h-48 w-full" />
        ) : dailyQuery.isError ? (
          <ErrorBanner error={dailyQuery.error} />
        ) : series.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-500">
            {t("admin.analyticsPage.noDataForRange")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex h-48 min-w-full items-end gap-1">
              {series.map((d) => {
                const label = d.date ?? d.month ?? "";
                const value = Number(d.netRevenue) || 0;
                return (
                  <div
                    key={label}
                    className="group relative min-w-1 flex-1 rounded-t-md bg-bloom-200 transition-colors hover:bg-bloom-400"
                    style={{ height: `${(value / max) * 100}%` }}
                    title={`${label}: ${formatCurrency(value, currency)} (${t("admin.analyticsPage.ordersCount", { count: d.netOrderCount })})`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <h3 className="mb-4 font-display text-lg text-ink-900">
          {t("admin.analyticsPage.revenueByCategoryHeading")}
        </h3>
        {byCategoryQuery.isPending ? (
          <Skeleton className="h-32 w-full" />
        ) : byCategoryQuery.isError ? (
          <ErrorBanner error={byCategoryQuery.error} />
        ) : categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-500">
            {t("admin.analyticsPage.noCategorySales")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {categories.map((row) => {
              const pct =
                totalCategoryRevenue === 0
                  ? 0
                  : (row.revenue / totalCategoryRevenue) * 100;
              return (
                <li key={row.categoryId ?? row.categoryTitle}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-900">
                      {row.categoryTitle}
                    </span>
                    <span className="text-ink-700">
                      {formatCurrency(row.revenue, currency)}
                      <span className="ms-2 text-xs text-ink-400">
                        {t("admin.analyticsPage.ordersCount", { count: row.orderCount })}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-cream-100">
                    <div
                      className="h-full rounded-full bg-bloom-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

interface KpiProps {
  label: string;
  value: string | null;
  loading?: boolean;
  /** Exact figure shown on hover — useful when `value` is abbreviated (e.g. "AED 11.9K"). */
  title?: string;
}

function Kpi({ label, value, loading, title }: KpiProps) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
        {label}
      </p>
      <div className="mt-3">
        {loading || value === null ? (
          <Skeleton className="h-8 w-2/3" />
        ) : (
          <p className="font-display text-3xl text-ink-900" title={title}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function ErrorBanner({ error }: { error: unknown }) {
  const { t } = useT();
  const message =
    error instanceof ApiError ? error.message : t("admin.common.loadFailed");
  return (
    <div className="mb-4 rounded-lg border border-bloom-200 bg-bloom-50 px-4 py-3 text-sm text-bloom-700">
      {message}
    </div>
  );
}
