"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge } from "@/components/ui";
import { Spinner } from "@/components/ui/Loader";
import { ChevronRight } from "@/components/icons";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
} from "@/components/admin/orders/orderStatus";

const PROGRESS_ORDER = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export function AccountOrderDetail({ id }: { id: string }) {
  const query = useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getById(id),
  });

  if (query.isPending) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
        Could not load this order.{" "}
        <Link href="/account/orders" className="underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const order = query.data;
  const cancelled = order.status === "CANCELLED";
  const currentIdx = (PROGRESS_ORDER as readonly string[]).indexOf(order.status);
  const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900"
        >
          <ChevronRight size={14} className="rotate-180" />
          All orders
        </Link>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ink-500">
            Order {order.id.slice(0, 8)}
          </p>
          <h2 className="font-display text-2xl text-ink-900">
            Placed {formatDate(order.createdAt)}
          </h2>
        </div>
        <Badge tone={ORDER_STATUS_TONE[order.status]}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </header>

      {!cancelled ? (
        <section className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="grid grid-cols-5 gap-1">
            {PROGRESS_ORDER.map((s, i) => {
              const reached = i <= currentIdx;
              return (
                <div key={s} className="flex flex-col items-center gap-1">
                  <div
                    className={
                      "h-1.5 w-full rounded-full " +
                      (reached ? "bg-bloom-500" : "bg-ink-100")
                    }
                  />
                  <span
                    className={
                      "text-[10px] uppercase tracking-wider " +
                      (reached ? "text-bloom-700" : "text-ink-400")
                    }
                  >
                    {ORDER_STATUS_LABEL[s]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <h3 className="mb-4 font-display text-lg text-ink-900">Items</h3>
        <ul className="divide-y divide-ink-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              {item.product?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product.image}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-ink-100" />
              )}
              <div className="flex flex-1 items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink-900">
                    {item.product?.title ?? "Removed product"}
                  </p>
                  <p className="text-xs text-ink-500">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                  {item.perProductMessage ? (
                    <p className="mt-1 text-xs italic text-ink-500">
                      “{item.perProductMessage}”
                    </p>
                  ) : null}
                </div>
                <p className="font-medium text-ink-900">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-ink-100 pt-4 text-sm">
          <div className="flex justify-between text-ink-500">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(itemsTotal)}</dd>
          </div>
          {order.discountAmount && order.discountAmount > 0 ? (
            <div className="flex justify-between text-ink-500">
              <dt>
                Discount{" "}
                {order.appliedPromoCode ? (
                  <span className="text-xs text-ink-400">
                    ({order.appliedPromoCode})
                  </span>
                ) : null}
              </dt>
              <dd>−{formatCurrency(order.discountAmount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-ink-100 pt-2 font-medium text-ink-900">
            <dt>Total</dt>
            <dd>{formatCurrency(order.totalAmount)}</dd>
          </div>
        </dl>
      </section>

      {order.shippingAddress ? (
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-3 font-display text-lg text-ink-900">Shipping</h3>
          <div className="text-sm text-ink-700">
            <p className="font-medium text-ink-900">
              {order.shippingAddress.fullName}
            </p>
            <p>{order.shippingAddress.phone}</p>
            <p className="mt-2">
              {order.shippingAddress.streetAddress}
              {order.shippingAddress.apartment
                ? `, ${order.shippingAddress.apartment}`
                : ""}
            </p>
            <p>
              {order.shippingAddress.city}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}
              {order.shippingAddress.postalCode
                ? ` ${order.shippingAddress.postalCode}`
                : ""}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
