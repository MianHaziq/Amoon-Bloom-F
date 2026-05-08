"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
} from "./orderStatus";
import type { ApiOrder, OrderStatus } from "@/features/orders/types";

const PAGE_SIZE = 20;

export function OrdersAdminPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const router = useRouter();

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(status === "ALL" ? {} : { status }),
  };

  const query = useQuery({
    queryKey: queryKeys.orders.adminList(params),
    queryFn: () => ordersApi.listAdmin(params),
  });

  const columns: Column<ApiOrder>[] = [
    {
      key: "id",
      header: "Order",
      cell: (o) => (
        <span className="font-mono text-xs text-ink-700">{o.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (o) => (
        <div>
          <p className="text-ink-900">{o.shippingAddress?.fullName ?? "—"}</p>
          {o.shippingAddress?.city ? (
            <p className="text-xs text-ink-500">
              {o.shippingAddress.city}, {o.shippingAddress.country}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (o) => (
        <span className="text-ink-700">
          {o.items.reduce((sum, i) => sum + i.quantity, 0)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (o) => (
        <Badge tone={ORDER_STATUS_TONE[o.status]}>
          {ORDER_STATUS_LABEL[o.status]}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Placed",
      cell: (o) => <span className="text-ink-500">{formatDate(o.createdAt)}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (o) => (
        <span className="font-medium text-ink-900">
          {formatCurrency(o.totalAmount)}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Orders"
        description="All customer orders, latest first."
      />

      <DataTable
        columns={columns}
        rows={query.data?.data}
        rowKey={(o) => o.id}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        emptyTitle="No orders match"
        onRowClick={(o) => router.push(`/admin/orders/${o.id}`)}
        toolbar={
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-ink-500">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as OrderStatus | "ALL");
                setPage(1);
              }}
              className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-900 focus:border-bloom-500 focus:outline-none"
            >
              <option value="ALL">All</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        }
        footer={
          <Pagination
            meta={query.data?.meta?.pagination}
            page={page}
            onChange={setPage}
          />
        }
      />
    </div>
  );
}
