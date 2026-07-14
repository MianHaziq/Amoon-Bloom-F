"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge, CurrencyAmount } from "@/components/ui";
import { Skeleton } from "@/components/ui/Loader";
import { Pagination } from "@/components/admin/Pagination";
import { ChevronRight } from "@/components/icons";
import { formatDate, intlLocale } from "@/lib/format";
import { useT } from "@/i18n/useT";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import {
  ORDER_STATUS_LABEL_KEY,
  ORDER_STATUS_TONE,
} from "@/features/orders/constants";

const PAGE_SIZE = 10;

export function AccountOrders() {
  const [page, setPage] = useState(1);
  const { t, tc, locale } = useT();
  const { currency, locale: curLocale } = useCurrency();

  const query = useQuery({
    queryKey: queryKeys.orders.myHistory({ page, limit: PAGE_SIZE }),
    queryFn: () => ordersApi.myHistory({ page, limit: PAGE_SIZE }),
  });

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
        {t("account.ordersLoadError")}
      </div>
    );
  }

  const orders = query.data?.data ?? [];

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-12 text-center">
        <p className="font-display text-2xl text-ink-700">{t("account.ordersEmptyTitle")}</p>
        <p className="mt-2 text-sm text-ink-500">
          {t("account.ordersEmptyBody")}
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex h-10 items-center rounded-full bg-bloom-600 px-5 text-sm font-medium text-white shadow-(--shadow-bloom) hover:bg-bloom-700"
        >
          {t("account.startShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const itemCount =
          typeof order.itemCount === "number"
            ? order.itemCount
            : Array.isArray(order.items)
            ? order.items.reduce((s, i) => s + (i?.quantity ?? 0), 0)
            : 0;
        return (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 transition-colors hover:border-ink-200 sm:gap-5 sm:p-5"
          >
            <div className="flex flex-1 flex-wrap items-center gap-3 sm:gap-5">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-ink-500">
                  {t("order.orderLabel")} #{order.orderNumber ?? order.id.slice(0, 8)}
                </p>
                <p className="mt-0.5 text-sm text-ink-700">
                  {tc(itemCount, "units.itemOne", "units.itemOther")} ·{" "}
                  {formatDate(order.createdAt, intlLocale(locale))}
                </p>
              </div>
              <Badge tone={ORDER_STATUS_TONE[order.status]}>
                {t(ORDER_STATUS_LABEL_KEY[order.status])}
              </Badge>
              <p className="min-w-[6rem] text-end font-medium text-ink-900">
                <CurrencyAmount amount={order.totalAmount} currency={currency} locale={curLocale} />
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-ink-400 rtl:-scale-x-100" />
          </Link>
        );
      })}

      <div className="mt-3">
        <Pagination
          meta={query.data?.meta?.pagination}
          page={page}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
