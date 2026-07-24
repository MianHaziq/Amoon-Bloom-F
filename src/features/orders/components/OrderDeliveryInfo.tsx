"use client";

import { formatDate, intlLocale } from "@/lib/format";
import { useT } from "@/i18n/useT";
import type { ApiOrder } from "@/features/orders/types";
import { getOrderDeliveryView } from "@/features/orders/delivery";

/**
 * Customer-facing delivery block mirroring the client app's layout:
 * Delivery Type · Expected Delivery Date · Customer Reserved Date (scheduled only) · Final Delivery Date.
 * All values come from the shared getOrderDeliveryView helper and are shown as dates only.
 */
export function OrderDeliveryInfo({ order }: { order: ApiOrder }) {
  const { t, locale } = useT();
  const il = intlLocale(locale);
  const d = getOrderDeliveryView(order);

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
      <h3 className="mb-3 font-display text-lg text-ink-900">
        {t("checkout.deliveryInformation")}
      </h3>
      <dl className="flex flex-col gap-2 text-sm">
        <Row
          label={t("checkout.deliveryTypeLabel")}
          value={
            d.isScheduled
              ? t("checkout.reservedDelivery")
              : t("checkout.standardDelivery")
          }
        />
        {d.expectedDate ? (
          <Row
            label={t("checkout.expectedDeliveryDate")}
            value={formatDate(d.expectedDate, il)}
          />
        ) : null}
        {d.reservedDate ? (
          <Row
            label={t("checkout.customerReservedDate")}
            value={formatDate(d.reservedDate, il)}
          />
        ) : null}
        {d.finalDate ? (
          <Row
            label={t("checkout.finalDeliveryDate")}
            value={formatDate(d.finalDate, il)}
          />
        ) : null}
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-medium text-ink-900">{label}</dt>
      <dd className="text-ink-700">{value}</dd>
    </div>
  );
}
