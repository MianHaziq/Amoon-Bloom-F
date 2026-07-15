"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_KEY,
  ORDER_STATUS_TONE,
} from "./orderStatus";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import type { OrderStatus } from "@/features/orders/types";

export function OrderDetailPage({ id }: { id: string }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const orderQuery = useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getById(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(id, status),
    onSuccess: (updated) => {
      toast.success({
        title: t("admin.orderDetailPage.toastUpdated"),
        description: t("admin.orderDetailPage.toastUpdatedDescription", {
          status: t(ORDER_STATUS_LABEL_KEY[updated.status]),
        }),
      });
      queryClient.setQueryData(queryKeys.orders.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
    onError: (err) => toast.fromError(t("admin.orderDetailPage.toastUpdateError"), err),
  });

  if (orderQuery.isPending) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
        {t("admin.orderDetailPage.loadError")}
      </div>
    );
  }

  const order = orderQuery.data;
  const itemsTotal =
    order.subtotalAmount ?? order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const vatAmount = order.vatAmount ?? order.taxAmount ?? 0;
  const showVat = order.vatRatePercent != null && vatAmount > 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("admin.orderDetailPage.titleTemplate", { id: order.id.slice(0, 8) })}
        description={t("admin.orderDetailPage.descriptionTemplate", {
          date: formatDate(order.createdAt),
        })}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.orders"), href: "/admin/orders" },
          { label: order.id.slice(0, 8) },
        ]}
        actions={
          <Badge tone={ORDER_STATUS_TONE[order.status]}>
            {t(ORDER_STATUS_LABEL_KEY[order.status])}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
            <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.orderDetailPage.itemsHeading")}</h3>
            <ul className="divide-y divide-ink-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  {item.product?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.image}
                      alt=""
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-ink-100" />
                  )}
                  <div className="flex flex-1 items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink-900">
                        {item.product?.title ?? t("admin.orderDetailPage.deletedProductFallback")}
                      </p>
                      <p className="text-xs text-ink-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                      {(item.giftCardSelected || item.customName) && (
                        <p className="mt-1 text-xs font-medium text-bloom-700">
                          {[item.giftCardSelected ? t("product.giftCardBadge") : null, item.customName]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
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
                <dt>{t("common.subtotal")}</dt>
                <dd>{formatCurrency(itemsTotal)}</dd>
              </div>
              {order.discountAmount && order.discountAmount > 0 ? (
                <div className="flex justify-between text-ink-500">
                  <dt>
                    {t("common.discount")}{" "}
                    {order.appliedPromoCode ? (
                      <span className="ms-1 text-xs text-ink-400">
                        ({order.appliedPromoCode})
                      </span>
                    ) : null}
                  </dt>
                  <dd>−{formatCurrency(order.discountAmount)}</dd>
                </div>
              ) : null}
              {showVat ? (
                <div className="flex justify-between text-ink-500">
                  <dt>
                    {order.vatInclusive
                      ? t("order.vatIncludedLabel", { rate: order.vatRatePercent! })
                      : t("order.vatLabel", { rate: order.vatRatePercent! })}
                  </dt>
                  <dd>
                    {order.vatInclusive ? "" : "+ "}
                    {formatCurrency(vatAmount)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-ink-100 pt-2 font-medium text-ink-900">
                <dt>{t("common.total")}</dt>
                <dd>{formatCurrency(order.totalAmount)}</dd>
              </div>
            </dl>
          </section>

          {order.orderMessage ? (
            <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="mb-2 font-display text-lg text-ink-900">{t("admin.orderDetailPage.orderNoteHeading")}</h3>
              <p className="text-sm italic text-ink-700">“{order.orderMessage}”</p>
            </section>
          ) : null}
        </div>

        {/* RIGHT */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
            <h3 className="mb-3 font-display text-lg text-ink-900">{t("admin.orderDetailPage.updateStatusHeading")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {ORDER_STATUSES.map((s) => {
                const isCurrent = order.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={isCurrent || statusMutation.isPending}
                    onClick={() => statusMutation.mutate(s)}
                    className={
                      "rounded-lg border px-3 py-2 text-xs font-medium transition-colors " +
                      (isCurrent
                        ? "border-bloom-500 bg-bloom-50 text-bloom-700"
                        : "border-ink-200 text-ink-700 hover:bg-cream-50 disabled:opacity-50")
                    }
                  >
                    {t(ORDER_STATUS_LABEL_KEY[s])}
                  </button>
                );
              })}
            </div>
            {order.inventoryDeducted ? (
              <p className="mt-3 text-xs text-ink-500">
                {t("admin.orderDetailPage.inventoryDeductedNote")}
              </p>
            ) : null}
          </section>

          {order.shippingAddress ? (
            <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="mb-3 font-display text-lg text-ink-900">{t("admin.orderDetailPage.shippingHeading")}</h3>
              <div className="text-sm text-ink-700">
                <p className="font-medium text-ink-900">
                  {order.shippingAddress.fullName}
                  {!order.userId ? (
                    <span className="ms-2 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-600">
                      {t("admin.ordersPage.guest")}
                    </span>
                  ) : null}
                </p>
                <p>{order.shippingAddress.phone}</p>
                {order.guestEmail ? <p>{order.guestEmail}</p> : null}
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

          <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
            <h3 className="mb-3 font-display text-lg text-ink-900">{t("admin.orderDetailPage.paymentHeading")}</h3>
            <p className="text-sm text-ink-700">
              {order.paymentMethod === "COD" ? t("admin.orderDetailPage.codLabel") : order.paymentMethod}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
