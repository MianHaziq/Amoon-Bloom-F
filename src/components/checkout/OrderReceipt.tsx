"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Container, Button } from "@/components/ui";
import { Skeleton } from "@/components/ui/Loader";
import { CheckCircleIcon, ArrowRight, TruckIcon } from "@/components/icons";
import { ordersApi } from "@/features/orders/api/orders.api";
import { queryKeys } from "@/services/queryKeys";
import { formatCurrency, intlLocale } from "@/lib/format";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { ROUTES } from "@/constants/routes";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";
import type { ApiOrder, OrderStatus } from "@/features/orders/types";

const STEPS: { key: OrderStatus; labelKey: MessageKey }[] = [
  { key: "PENDING", labelKey: "order.stepPlaced" },
  { key: "CONFIRMED", labelKey: "order.stepConfirmed" },
  { key: "PROCESSING", labelKey: "order.stepPreparing" },
  { key: "SHIPPED", labelKey: "order.stepOnTheWay" },
  { key: "DELIVERED", labelKey: "order.stepDelivered" },
];

export function OrderReceipt({ orderId }: { orderId?: string }) {
  const { currency, locale } = useCurrency();
  const { t } = useT();

  const query = useQuery({
    queryKey: queryKeys.orders.detail(orderId ?? "none"),
    queryFn: () => ordersApi.getById(orderId as string),
    enabled: Boolean(orderId),
    staleTime: 60_000,
  });

  const money = (n: number) => formatCurrency(n, currency, locale);

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      {/* Confirmation header */}
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircleIcon size={28} />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          {t("order.confirmed")}
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-ink-900 sm:text-5xl">
          {t("order.thankYou")}
        </h1>
        <p className="mt-3 max-w-md text-sm text-ink-500 sm:text-base">
          {t("order.thankYouBody")}
        </p>
      </div>

      {query.isPending && orderId ? (
        <ReceiptSkeleton />
      ) : query.isError || !query.data ? (
        // Fallback: order details couldn't be loaded (still a successful order).
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          {orderId && (
            <p className="font-mono text-xs uppercase tracking-wider text-ink-500">
              {`${t("order.reference")} · ${orderId.slice(0, 8)}`}
            </p>
          )}
          <Actions orderId={orderId} />
        </div>
      ) : (
        <Receipt order={query.data} money={money} />
      )}
    </Container>
  );
}

function Receipt({
  order,
  money,
}: {
  order: ApiOrder;
  money: (n: number) => string;
}) {
  const { t, locale } = useT();
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = order.discountAmount ?? 0;
  const stepIndex = STEPS.findIndex((s) => s.key === order.status);
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="mt-10 flex flex-col gap-6">
      {/* Order number + date */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-ink-400">
            {t("order.orderNumber")}
          </p>
          <p className="font-display text-xl font-medium text-ink-900">
            #{order.orderNumber ?? order.id.slice(0, 8)}
          </p>
        </div>
        <p className="text-sm text-ink-500">
          {new Date(order.createdAt).toLocaleDateString(intlLocale(locale), {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* COD payment block — the most important detail for cash on delivery */}
      {order.paymentMethod === "COD" && (
        <div className="flex items-start gap-4 rounded-2xl border border-bloom-200 bg-bloom-50 p-5">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-bloom-700">
            <TruckIcon size={20} />
          </span>
          <div>
            <p className="font-display text-lg font-medium text-ink-900">
              {t("checkout.cod")}
            </p>
            <p className="mt-1 text-sm text-ink-600">
              {t("order.codReady", { amount: money(order.totalAmount) })}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-bloom-700">
              {t("order.paymentStatus")} ·{" "}
              {order.paymentStatus === "PAID" ? t("order.paid") : t("order.unpaid")}
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      {!cancelled && stepIndex >= 0 && (
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <ol className="flex items-center">
            {STEPS.map((s, i) => {
              const done = i <= stepIndex;
              return (
                <li key={s.key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full items-center">
                    <span
                      className={
                        "h-0.5 flex-1 " + (i === 0 ? "bg-transparent" : done ? "bg-bloom-500" : "bg-ink-100")
                      }
                    />
                    <span
                      className={
                        "flex h-3 w-3 shrink-0 rounded-full " +
                        (done ? "bg-bloom-600" : "bg-ink-200")
                      }
                    />
                    <span
                      className={
                        "h-0.5 flex-1 " + (i === STEPS.length - 1 ? "bg-transparent" : i < stepIndex ? "bg-bloom-500" : "bg-ink-100")
                      }
                    />
                  </div>
                  <span
                    className={
                      "text-center text-[10px] font-medium uppercase tracking-wider sm:text-xs " +
                      (done ? "text-ink-900" : "text-ink-400")
                    }
                  >
                    {t(s.labelKey)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Items */}
      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-medium text-ink-900">
          {t("cart.orderSummary")}
        </h2>
        <ul className="flex flex-col divide-y divide-ink-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-blush-50">
                {item.product?.image ? (
                  <Image
                    src={item.product.image}
                    alt={item.product.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">
                  {item.product?.title ?? t("order.itemFallback")}
                </p>
                <p className="text-xs text-ink-500">{t("common.qty")} {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-medium tabular-nums text-ink-900">
                {money(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-ink-100 pt-4 text-sm">
          <Row label={t("common.subtotal")} value={money(subtotal)} />
          {discount > 0 && (
            <Row
              label={
                order.appliedPromoCode
                  ? `${t("common.discount")} (${order.appliedPromoCode})`
                  : t("common.discount")
              }
              value={`− ${money(discount)}`}
              accent
            />
          )}
          <Row label={t("common.delivery")} value={t("common.free")} />
          <div className="mt-1.5 flex items-center justify-between border-t border-ink-100 pt-3">
            <span className="font-display text-lg text-ink-900">{t("common.total")}</span>
            <span className="font-display text-xl font-medium tabular-nums text-ink-900">
              {money(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      {order.shippingAddress && (
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="mb-2 font-display text-lg font-medium text-ink-900">
            {t("order.deliverTo")}
          </h2>
          <address className="text-sm not-italic leading-relaxed text-ink-600">
            {order.shippingAddress.fullName && (
              <span className="block font-medium text-ink-900">
                {order.shippingAddress.fullName}
              </span>
            )}
            {[
              order.shippingAddress.apartment,
              order.shippingAddress.streetAddress,
              order.shippingAddress.city,
              order.shippingAddress.country,
            ]
              .filter(Boolean)
              .join(", ")}
            {order.shippingAddress.phone && (
              <span className="mt-1 block">{order.shippingAddress.phone}</span>
            )}
          </address>
        </div>
      )}

      <Actions orderId={order.id} />
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-600">{label}</span>
      <span
        className={
          "tabular-nums " + (accent ? "font-medium text-bloom-700" : "text-ink-900")
        }
      >
        {value}
      </span>
    </div>
  );
}

function Actions({ orderId }: { orderId?: string }) {
  const { t } = useT();
  return (
    <div className="flex flex-wrap justify-center gap-3 pt-2">
      {orderId && (
        <Link href={`/account/orders/${orderId}`} className="contents">
          <Button size="lg" trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}>
            {t("order.trackOrder")}
          </Button>
        </Link>
      )}
      <Link href={ROUTES.shop} className="contents">
        <Button size="lg" variant="outline">
          {t("common.continueShopping")}
        </Button>
      </Link>
    </div>
  );
}

function ReceiptSkeleton() {
  return (
    <div className="mt-10 flex flex-col gap-6">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
