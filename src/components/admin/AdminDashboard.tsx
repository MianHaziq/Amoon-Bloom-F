"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "motion/react";
import { useAppSelector } from "@/store";
import { staggerContainer, subtleRise, fadeInUp } from "@/lib/motion";
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
import { useT } from "@/i18n/useT";
import { customerLabel, isGuestOrder } from "@/components/admin/orders/orderCustomer";

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
  const { t } = useT();
  const router = useRouter();
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

  // No contact stats endpoint exists — derive the "new messages" count from the
  // list total. Only needed when the contact KPI is shown (non-admin viewers).
  const contactNewQuery = useQuery({
    queryKey: queryKeys.contact.list({ status: "NEW", limit: 1 }),
    queryFn: () => contactApi.list({ status: "NEW", limit: 1 }),
    enabled: canSeeContact && !canSeeUsers,
  });

  const summary = revenueQuery.data?.summary;
  const currency = revenueQuery.data?.currency ?? "USD";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <header>
        <h2 className="font-display text-2xl text-ink-900">
          {user?.firstName
            ? t("admin.dashboardPage.welcomeBackName", { name: user.firstName })
            : t("admin.dashboardPage.welcomeBack")}
        </h2>
        <p className="mt-1 text-sm text-ink-500">{t("admin.dashboardPage.subtitle")}</p>
      </header>

      <m.section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer(0.06)}
        initial="hidden"
        animate="show"
      >
        <KpiCard
          label={t("admin.dashboardPage.kpiRevenue")}
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
          label={t("admin.dashboardPage.kpiOrders")}
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
          label={t("admin.dashboardPage.kpiAvgOrderValue")}
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
          label={
            canSeeUsers
              ? t("admin.dashboardPage.kpiActiveCustomers")
              : t("admin.dashboardPage.kpiNewMessages")
          }
          value={
            canSeeUsers
              ? userStatsQuery.isPending
                ? null
                : String(userStatsQuery.data?.customers ?? 0)
              : canSeeContact
              ? contactNewQuery.isPending
                ? null
                : String(contactNewQuery.data?.meta.pagination?.total ?? 0)
              : "—"
          }
          loading={
            (canSeeUsers && userStatsQuery.isPending) ||
            (!canSeeUsers && canSeeContact && contactNewQuery.isPending)
          }
        />
      </m.section>

      {canSeeOrders ? (
        <m.section
          className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6"
          variants={fadeInUp}
          initial="hidden"
          animate="show"
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-lg text-ink-900">
                {t("admin.dashboardPage.latestOrdersHeading")}
              </h3>
              <p className="text-xs text-ink-500">
                {t("admin.dashboardPage.latestOrdersDescription")}
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-bloom-700 hover:text-bloom-800"
            >
              {t("admin.dashboardPage.viewAll")} <ArrowRight size={14} />
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
            <p className="py-6 text-center text-sm text-ink-500">
              {t("admin.dashboardPage.emptyOrders")}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-ink-100">
              <table className="w-full min-w-120 text-start text-sm">
                <thead className="bg-bloom-100 text-xs uppercase tracking-wider text-bloom-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      {t("admin.dashboardPage.columnOrder")}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t("admin.dashboardPage.columnCustomer")}
                    </th>
                    <th className="px-4 py-3 font-medium">{t("admin.status")}</th>
                    <th className="px-4 py-3 text-end font-medium">{t("common.total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentOrdersQuery.data?.data ?? []).map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="cursor-pointer border-t border-ink-100 transition-colors hover:bg-cream-50"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-ink-700">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-ink-700">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{customerLabel(order)}</span>
                          {isGuestOrder(order) ? (
                            <Badge tone="neutral">{t("admin.ordersPage.guest")}</Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="ink">{order.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-end text-ink-900">
                        {formatCurrency(order.totalAmount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </m.section>
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
    <m.div
      variants={subtleRise}
      className="rounded-2xl border border-ink-100 bg-white p-5"
    >
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
    </m.div>
  );
}

function ErrorBlock({ error }: { error: unknown }) {
  const { t } = useT();
  const message =
    error instanceof ApiError ? error.message : t("admin.common.loadFailed");
  return (
    <div className="rounded-lg border border-bloom-200 bg-bloom-50 px-4 py-3 text-sm text-bloom-700">
      {message}
    </div>
  );
}
