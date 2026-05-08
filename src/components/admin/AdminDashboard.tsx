"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAppSelector } from "@/store";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { ordersApi } from "@/features/orders/api/orders.api";
import { usersApi } from "@/features/users/api/users.api";
import { contactApi } from "@/features/contact/api/contact.api";
import { queryKeys } from "@/services/queryKeys";
import { Skeleton } from "@/components/ui/Loader";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/services/http";
import type { ManagerPermission } from "@/features/users/types";
import { ArrowRight } from "@/components/icons";
import { formatCurrency } from "@/lib/format";

function hasPerm(
  role: string | undefined,
  permissions: ManagerPermission[] | undefined,
  needed: ManagerPermission
) {
  if (role === "ADMIN") return true;
  if (role !== "MANAGER") return false;
  return (permissions ?? []).includes(needed);
}

export function AdminDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role;
  const perms = user?.managerPermissions;

  const canSeeRevenue =
    role === "ADMIN" || hasPerm(role, perms, "ORDERS") || hasPerm(role, perms, "SETTINGS");
  const canSeeOrders = role === "ADMIN" || hasPerm(role, perms, "ORDERS");
  const canSeeUsers = role === "ADMIN";
  const canSeeContact = role === "ADMIN" || hasPerm(role, perms, "CONTACT");

  const revenueQuery = useQuery({
    queryKey: queryKeys.analytics.revenue({ preset: "month" }),
    queryFn: () => analyticsApi.revenue({ preset: "month" }),
    enabled: canSeeRevenue,
  });

  const recentOrdersQuery = useQuery({
    queryKey: queryKeys.orders.adminList({ page: 1, limit: 5 }),
    queryFn: () => ordersApi.listAdmin({ page: 1, limit: 5 }),
    enabled: canSeeOrders,
  });

  const userStatsQuery = useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: () => usersApi.stats(),
    enabled: canSeeUsers,
  });

  const contactStatsQuery = useQuery({
    queryKey: queryKeys.contact.stats(),
    queryFn: () => contactApi.stats(),
    enabled: canSeeContact,
  });

  const summary = revenueQuery.data?.summary;
  const currency = revenueQuery.data?.currency ?? "USD";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <header>
        <h2 className="font-display text-2xl text-ink-900">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Here&apos;s what&apos;s happening this month.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue (30d)"
          value={
            !canSeeRevenue
              ? "—"
              : revenueQuery.isPending
              ? null
              : formatCurrency(summary?.revenue ?? 0, currency)
          }
          loading={canSeeRevenue && revenueQuery.isPending}
        />
        <KpiCard
          label="Orders (30d)"
          value={
            !canSeeRevenue
              ? "—"
              : revenueQuery.isPending
              ? null
              : String(summary?.activeOrderCount ?? 0)
          }
          loading={canSeeRevenue && revenueQuery.isPending}
        />
        <KpiCard
          label="Avg. order value"
          value={
            !canSeeRevenue
              ? "—"
              : revenueQuery.isPending
              ? null
              : formatCurrency(summary?.averageOrderValue ?? 0, currency)
          }
          loading={canSeeRevenue && revenueQuery.isPending}
        />
        <KpiCard
          label={canSeeUsers ? "Active customers" : "New messages"}
          value={
            canSeeUsers
              ? userStatsQuery.isPending
                ? null
                : String(userStatsQuery.data?.customers ?? 0)
              : canSeeContact
              ? contactStatsQuery.isPending
                ? null
                : String(contactStatsQuery.data?.NEW ?? 0)
              : "—"
          }
          loading={
            (canSeeUsers && userStatsQuery.isPending) ||
            (!canSeeUsers && canSeeContact && contactStatsQuery.isPending)
          }
        />
      </section>

      {canSeeOrders ? (
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-lg text-ink-900">Latest orders</h3>
              <p className="text-xs text-ink-500">Last 5 orders across the store.</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-bloom-700 hover:text-bloom-800"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrdersQuery.isPending ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentOrdersQuery.isError ? (
            <ErrorBlock error={recentOrdersQuery.error} />
          ) : (recentOrdersQuery.data?.data ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500">No orders yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-ink-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream-100 text-xs uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentOrdersQuery.data?.data ?? []).map((order) => {
                    const customerName = order.user
                      ? [order.user.firstName, order.user.lastName]
                          .filter(Boolean)
                          .join(" ") || order.user.email
                      : "—";
                    return (
                      <tr key={order.id} className="border-t border-ink-100">
                        <td className="px-4 py-3 font-mono text-xs text-ink-700">
                          {order.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-ink-700">
                          {customerName}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone="ink">{order.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-ink-900">
                          {formatCurrency(order.totalAmount, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | null;
  loading?: boolean;
}

function KpiCard({ label, value, loading }: KpiCardProps) {
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

function ErrorBlock({ error }: { error: unknown }) {
  const message =
    error instanceof ApiError ? error.message : "Could not load this section.";
  return (
    <div className="rounded-lg border border-bloom-200 bg-bloom-50 px-4 py-3 text-sm text-bloom-700">
      {message}
    </div>
  );
}
