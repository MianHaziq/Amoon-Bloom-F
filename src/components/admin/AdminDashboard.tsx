"use client";

import { useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "motion/react";
import { useAppSelector } from "@/store";
import { staggerContainer, subtleRise, fadeInUp } from "@/lib/motion";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { ordersApi } from "@/features/orders/api/orders.api";
import { usersApi } from "@/features/users/api/users.api";
import { contactApi } from "@/features/contact/api/contact.api";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { Select } from "@/components/admin/Select";
import { Skeleton } from "@/components/ui/Loader";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/services/http";
import type { ManagerPermission } from "@/features/users/types";
import type { ApiRegion } from "@/features/regions/types";
import {
  ArrowRight,
  DocumentIcon,
  BoxIcon,
  UserPlusIcon,
  TicketIcon,
  BellIcon,
  ChatIcon,
} from "@/components/icons";
import type { ComponentType, SVGProps } from "react";
import { formatCurrency, formatCompactCurrency } from "@/lib/format";
import { useT } from "@/i18n/useT";
import { customerLabel, isGuestOrder } from "@/components/admin/orders/orderCustomer";

/** Sentinel dropdown value for the combined (per-region) view. */
const ALL_REGIONS = "ALL";

type RevenueQuery = ReturnType<typeof useRevenueByRegion>[number];

function hasPerm(
  role: string | undefined,
  permissions: ManagerPermission[] | undefined,
  needed: ManagerPermission
) {
  if (role === "ADMIN") return true;
  if (role !== "MANAGER") return false;
  return (permissions ?? []).includes(needed);
}

// One revenue query per region shown. Regions each have their own currency and
// there is NO FX/conversion rate between them, so revenue is never summed across
// regions — each region is fetched and displayed on its own (in its currency).
function useRevenueByRegion(regions: ApiRegion[], enabled: boolean) {
  return useQueries({
    queries: regions.map((r) => ({
      queryKey: queryKeys.analytics.revenue({ preset: "month", region: r.code }),
      queryFn: () => analyticsApi.revenue({ preset: "month", region: r.code }),
      enabled,
    })),
  });
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
  const canSeeUsers = role === "ADMIN" || hasPerm(role, perms, "USERS");
  const canSeeContact = role === "ADMIN" || hasPerm(role, perms, "CONTACT");

  // The region filter drives both the revenue KPIs and the latest-orders list.
  const canFilterByRegion = canSeeRevenue || canSeeOrders;
  const [region, setRegion] = useState<string>(ALL_REGIONS);

  // Quick actions — only the shortcuts the current user is actually allowed to
  // reach. Admins see all; managers see only areas they hold the permission for.
  const quickActions: QuickAction[] = [
    {
      label: t("admin.orders"),
      href: "/admin/orders",
      icon: DocumentIcon,
      show: canSeeOrders,
    },
    {
      label: t("admin.dashboardPage.qaAddProduct"),
      href: "/admin/products/new",
      icon: BoxIcon,
      show: role === "ADMIN" || hasPerm(role, perms, "PRODUCTS"),
    },
    {
      label: t("admin.dashboardPage.qaCreateManager"),
      href: "/admin/managers/new",
      icon: UserPlusIcon,
      show: role === "ADMIN" || hasPerm(role, perms, "MANAGERS"),
    },
    {
      label: t("admin.promoCodes"),
      href: "/admin/promo-codes",
      icon: TicketIcon,
      show: role === "ADMIN" || hasPerm(role, perms, "PROMO_CODES"),
    },
    {
      label: t("admin.notifications"),
      href: "/admin/notifications",
      icon: BellIcon,
      show: role === "ADMIN" || hasPerm(role, perms, "NOTIFICATIONS"),
    },
    {
      label: t("admin.contact"),
      href: "/admin/contact",
      icon: ChatIcon,
      show: canSeeContact,
    },
  ].filter((a) => a.show);

  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
    enabled: canFilterByRegion,
  });
  const regions = regionsQuery.data ?? [];

  // If the selected region isn't in the loaded list (deleted/deactivated in
  // another tab, or a stale code), fall back to the combined view instead of
  // showing blank KPIs. Derived during render — never downgrade while the list
  // is still loading (regions is empty until then).
  const selectedRegionMissing =
    region !== ALL_REGIONS &&
    regions.length > 0 &&
    !regions.some((r) => r.code === region);
  const effectiveRegion = selectedRegionMissing ? ALL_REGIONS : region;
  const regionParam =
    effectiveRegion === ALL_REGIONS ? {} : { region: effectiveRegion };

  // Which regions get their own KPI block: every region in the combined view,
  // or just the selected one.
  const kpiRegions =
    effectiveRegion === ALL_REGIONS
      ? regions
      : regions.filter((r) => r.code === effectiveRegion);
  const revenueQueries = useRevenueByRegion(kpiRegions, canSeeRevenue);

  const recentOrdersParams = { page: 1, limit: 5, ...regionParam };
  const recentOrdersQuery = useQuery({
    queryKey: queryKeys.orders.adminList(recentOrdersParams),
    queryFn: () => ordersApi.listAdmin(recentOrdersParams),
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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink-900">
            {user?.firstName
              ? t("admin.dashboardPage.welcomeBackName", { name: user.firstName })
              : t("admin.dashboardPage.welcomeBack")}
          </h2>
          <p className="mt-1 text-sm text-ink-500">{t("admin.dashboardPage.subtitle")}</p>
        </div>
        {canFilterByRegion && regions.length > 1 ? (
          <Select
            value={effectiveRegion}
            onChange={setRegion}
            triggerClassName="text-xs py-1.5"
            aria-label={t("admin.dashboardPage.regionFilterLabel")}
            options={[
              { value: ALL_REGIONS, label: t("admin.dashboardPage.allRegionsOption") },
              ...regions.map((r) => ({ value: r.code, label: r.name })),
            ]}
          />
        ) : null}
      </header>

      {canSeeRevenue ? (
        <div className="flex flex-col gap-6">
          {regionsQuery.isPending ? (
            <RegionKpiGroupSkeleton />
          ) : (
            kpiRegions.map((r, i) => (
              <RegionKpiGroup
                key={r.code}
                name={r.name}
                currencyFallback={r.currency}
                query={revenueQueries[i]}
              />
            ))
          )}
        </div>
      ) : null}

      {canSeeUsers || canSeeContact ? (
        <m.section
          className="grid gap-4 sm:grid-cols-3"
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="show"
        >
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
                : contactNewQuery.isPending
                ? null
                : String(contactNewQuery.data?.meta.pagination?.total ?? 0)
            }
            loading={
              (canSeeUsers && userStatsQuery.isPending) ||
              (!canSeeUsers && canSeeContact && contactNewQuery.isPending)
            }
          />
        </m.section>
      ) : null}

      {quickActions.length > 0 ? (
        <m.section variants={fadeInUp} initial="hidden" animate="show">
          <h3 className="mb-3 font-display text-lg text-ink-900">
            {t("admin.dashboardPage.quickActionsHeading")}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 transition-colors hover:border-bloom-300 hover:bg-bloom-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bloom-100 text-bloom-700 transition-colors group-hover:bg-bloom-200">
                  <action.icon size={20} />
                </span>
                <span className="text-sm font-medium text-ink-900">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </m.section>
      ) : null}

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
                        {formatCurrency(order.totalAmount, order.currency ?? "AED")}
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

interface QuickAction {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  show: boolean;
}

/**
 * Revenue / orders / AOV for one region, always shown in THAT region's currency.
 * Prices differ per region with no FX rate, so figures are never combined across
 * regions — each region owns its own block.
 */
function RegionKpiGroup({
  name,
  currencyFallback,
  query,
}: {
  name: string;
  currencyFallback: string;
  query: RevenueQuery | undefined;
}) {
  const { t } = useT();
  const summary = query?.data?.summary;
  const currency = query?.data?.currency ?? currencyFallback ?? "AED";
  const pending = query?.isPending ?? true;
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="font-display text-lg text-ink-900">{name}</h3>
        <Badge tone="neutral">{currency}</Badge>
      </div>
      <m.div
        className="grid gap-4 sm:grid-cols-3"
        variants={staggerContainer(0.06)}
        initial="hidden"
        animate="show"
      >
        <KpiCard
          label={t("admin.dashboardPage.kpiRevenue")}
          value={pending ? null : formatCompactCurrency(summary?.revenue ?? 0, currency)}
          title={formatCurrency(summary?.revenue ?? 0, currency)}
          loading={pending}
        />
        <KpiCard
          label={t("admin.dashboardPage.kpiOrders")}
          value={pending ? null : String(summary?.activeOrderCount ?? 0)}
          loading={pending}
        />
        <KpiCard
          label={t("admin.dashboardPage.kpiAvgOrderValue")}
          value={pending ? null : formatCurrency(summary?.averageOrderValue ?? 0, currency)}
          loading={pending}
        />
      </m.div>
    </div>
  );
}

function RegionKpiGroupSkeleton() {
  return (
    <div>
      <Skeleton className="mb-3 h-6 w-32" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-ink-100 bg-white p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-8 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | null;
  loading?: boolean;
  /** Exact figure shown on hover — useful when `value` is abbreviated (e.g. "AED 11.9K"). */
  title?: string;
}

function KpiCard({ label, value, loading, title }: KpiCardProps) {
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
          <p className="font-display text-3xl text-ink-900" title={title}>
            {value}
          </p>
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
