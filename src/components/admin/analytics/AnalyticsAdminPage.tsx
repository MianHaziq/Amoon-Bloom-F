"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Select } from "@/components/admin/Select";
import { Skeleton } from "@/components/ui/Loader";
import { ApiError } from "@/services/http";
import { formatCurrency } from "@/lib/format";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n/messages";

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
  const [preset, setPreset] = useState<Preset>("month");
  const [region, setRegion] = useState<string>("ALL");
  const regionParam = region === "ALL" ? {} : { region };

  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });

  const revenueQuery = useQuery({
    queryKey: queryKeys.analytics.revenue({ preset, ...regionParam }),
    queryFn: () => analyticsApi.revenue({ preset, ...regionParam }),
  });
  const byCategoryQuery = useQuery({
    queryKey: queryKeys.analytics.revenueByCategory({ preset, ...regionParam }),
    queryFn: () => analyticsApi.revenueByCategory({ preset, ...regionParam }),
  });
  const dailyQuery = useQuery({
    queryKey: queryKeys.analytics.salesByDay({ preset, ...regionParam }),
    queryFn: () => analyticsApi.salesByDay({ preset, ...regionParam }),
  });

  const summary = revenueQuery.data?.summary;
  const currency = revenueQuery.data?.currency ?? "USD";

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
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={t("admin.analyticsPage.title")}
        description={t("admin.analyticsPage.description")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={region}
              onChange={setRegion}
              triggerClassName="text-xs py-1.5"
              aria-label={t("admin.analyticsPage.allRegionsOption")}
              options={[
                { value: "ALL", label: t("admin.analyticsPage.allRegionsOption") },
                ...(regionsQuery.data ?? []).map((r) => ({
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
          </div>
        }
      />

      {revenueQuery.isError ? (
        <ErrorBanner error={revenueQuery.error} />
      ) : null}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi
          label={t("admin.analyticsPage.kpiRevenue")}
          value={summary ? formatCurrency(summary.revenue, currency) : null}
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
}

function Kpi({ label, value, loading }: KpiProps) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
        {label}
      </p>
      <div className="mt-3">
        {loading || value === null ? (
          <Skeleton className="h-8 w-2/3" />
        ) : (
          <p className="font-display text-3xl text-ink-900">{value}</p>
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
