"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Skeleton } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/format";

const PRESETS = [
  { value: "today", label: "Today" },
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "year", label: "1 year" },
  { value: "all_time", label: "All time" },
] as const;

type Preset = typeof PRESETS[number]["value"];

export function AnalyticsAdminPage() {
  const [preset, setPreset] = useState<Preset>("month");

  const revenueQuery = useQuery({
    queryKey: queryKeys.analytics.revenue({ preset }),
    queryFn: () => analyticsApi.revenue({ preset }),
  });
  const byCategoryQuery = useQuery({
    queryKey: queryKeys.analytics.revenueByCategory({ preset }),
    queryFn: () => analyticsApi.revenueByCategory({ preset }),
  });
  const dailyQuery = useQuery({
    queryKey: queryKeys.analytics.salesByDay({ preset }),
    queryFn: () => analyticsApi.salesByDay({ preset }),
  });

  const summary = revenueQuery.data?.summary;
  const series = dailyQuery.data ?? [];
  const max = Math.max(1, ...series.map((d) => d.totalSales));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Analytics"
        description="Revenue and orders across your store."
        actions={
          <div className="inline-flex rounded-full border border-ink-200 bg-white p-1 text-xs">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPreset(p.value)}
                className={
                  "rounded-full px-3 py-1.5 transition-colors " +
                  (preset === p.value
                    ? "bg-ink-900 text-white"
                    : "text-ink-700 hover:bg-ink-50")
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <Kpi
          label="Revenue"
          value={summary ? formatCurrency(summary.totalRevenue) : null}
          loading={revenueQuery.isPending}
        />
        <Kpi
          label="Orders"
          value={summary ? String(summary.totalOrders) : null}
          loading={revenueQuery.isPending}
        />
        <Kpi
          label="Avg. order value"
          value={summary ? formatCurrency(summary.avgOrderValue) : null}
          loading={revenueQuery.isPending}
        />
      </section>

      <section className="mb-6 rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <h3 className="mb-4 font-display text-lg text-ink-900">Sales by day</h3>
        {dailyQuery.isPending ? (
          <Skeleton className="h-48 w-full" />
        ) : series.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-500">
            No data for this range.
          </p>
        ) : (
          <div className="flex h-48 items-end gap-1">
            {series.map((d) => (
              <div
                key={d.date}
                className="group relative flex-1 rounded-t-md bg-bloom-200 transition-colors hover:bg-bloom-400"
                style={{ height: `${(d.totalSales / max) * 100}%` }}
                title={`${d.date}: ${formatCurrency(d.totalSales)} (${d.orderCount} orders)`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <h3 className="mb-4 font-display text-lg text-ink-900">Revenue by category</h3>
        {byCategoryQuery.isPending ? (
          <Skeleton className="h-32 w-full" />
        ) : !byCategoryQuery.data || byCategoryQuery.data.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-500">No category sales yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {byCategoryQuery.data.map((row) => {
              const total = byCategoryQuery.data!.reduce((s, r) => s + r.revenue, 0);
              const pct = total === 0 ? 0 : (row.revenue / total) * 100;
              return (
                <li key={row.categoryId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-900">
                      {row.categoryTitle}
                    </span>
                    <span className="text-ink-700">
                      {formatCurrency(row.revenue)}
                      <span className="ml-2 text-xs text-ink-400">
                        {row.orderCount} orders
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
