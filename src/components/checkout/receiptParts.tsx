"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { m } from "motion/react";
import { CurrencyAmount } from "@/components/ui";
import {
  CheckIcon,
  TruckIcon,
  SparkleIcon,
  PinIcon,
} from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { formatCurrency, intlLocale } from "@/lib/format";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";
import type { ApiOrder, OrderStatus } from "@/features/orders/types";

/**
 * Shared post-order confirmation pieces, so the authenticated receipt
 * (OrderReceipt) and the guest confirmation (GuestOrderSuccess) render the same
 * boutique "receipt" — a celebratory seal, a branded order-number band, then
 * payment / tracker / items / delivery on one cohesive card.
 */

const STEPS: { key: OrderStatus; labelKey: MessageKey }[] = [
  { key: "PENDING", labelKey: "order.stepPlaced" },
  { key: "CONFIRMED", labelKey: "order.stepConfirmed" },
  { key: "PROCESSING", labelKey: "order.stepPreparing" },
  { key: "SHIPPED", labelKey: "order.stepOnTheWay" },
  { key: "DELIVERED", labelKey: "order.stepDelivered" },
];

/** Warm cream stage with an ambient bloom glow behind the hero. */
export function ReceiptStage({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-cream-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0,var(--color-bloom-100)_0%,transparent_70%)]"
      />
      {children}
    </section>
  );
}

/** Animated success seal + gold-flanked eyebrow + title + body. */
export function ConfirmationHero({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <m.div
      className="flex flex-col items-center text-center"
      variants={staggerContainer(0.1, 0.05)}
      initial="hidden"
      animate="show"
    >
      <m.span
        variants={{
          hidden: { scale: 0, opacity: 0 },
          show: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 240, damping: 16 },
          },
        }}
        className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-cream-50 shadow-(--shadow-bloom) ring-1 ring-bloom-100"
      >
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-bloom-500 to-bloom-700 text-white">
          <CheckIcon size={26} />
        </span>
        <SparkleIcon size={16} className="absolute -right-1 -top-1 text-gold-500" />
      </m.span>

      <m.div variants={staggerItem} className="mt-6 flex items-center gap-3 text-bloom-700">
        <span className="h-px w-8 bg-gold-400/70" />
        <span className="text-xs font-semibold uppercase tracking-[0.22em]">{eyebrow}</span>
        <span className="h-px w-8 bg-gold-400/70" />
      </m.div>

      <m.h1
        variants={staggerItem}
        className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 sm:text-5xl"
      >
        {title}
      </m.h1>
      <m.p variants={staggerItem} className="mt-3 max-w-md text-sm text-ink-500 sm:text-base">
        {body}
      </m.p>
    </m.div>
  );
}

/**
 * The order card. `footer` is an optional slot rendered in a tinted footer bar
 * (used by the authed receipt for its Track/Continue actions; omitted for guests).
 */
export function ReceiptCard({ order, footer }: { order: ApiOrder; footer?: ReactNode }) {
  const { t, locale } = useT();
  const { currency } = useCurrency();
  const subtotal =
    order.subtotalAmount ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = order.discountAmount ?? 0;
  const vatAmount = order.vatAmount ?? order.taxAmount ?? 0;
  const showVat = order.vatRatePercent != null && vatAmount > 0;
  const stepIndex = STEPS.findIndex((s) => s.key === order.status);
  const cancelled = order.status === "CANCELLED";
  const price = (n: number) => (
    <CurrencyAmount amount={n} currency={currency} locale={locale} />
  );

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 overflow-hidden rounded-3xl border border-ink-100 bg-cream-50 shadow-(--shadow-lift)"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 bg-linear-to-br from-bloom-50 to-blush-50 px-6 py-5 sm:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bloom-700">
            {t("order.orderNumber")}
          </p>
          <p className="mt-0.5 font-display text-2xl font-medium text-ink-900">
            #{order.orderNumber ?? order.id.slice(0, 8)}
          </p>
        </div>
        <div className="text-end">
          <StatusPill status={order.status} label={t(statusLabelKey(order.status))} />
          <p className="mt-1.5 text-xs text-ink-500">
            {new Date(order.createdAt).toLocaleDateString(intlLocale(locale), {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7">
        {order.paymentMethod === "COD" && (
          <div className="flex items-start gap-4 rounded-2xl bg-bloom-50/70 p-4 ring-1 ring-inset ring-bloom-100">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-50 text-bloom-700 shadow-(--shadow-soft)">
              <TruckIcon size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-medium text-ink-900">{t("checkout.cod")}</p>
              <p className="mt-0.5 text-sm text-ink-600">
                {t("order.codReady", { amount: formatCurrency(order.totalAmount, currency, locale) })}
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-bloom-700">
                {t("order.paymentStatus")} ·{" "}
                {order.paymentStatus === "PAID" ? t("order.paid") : t("order.unpaid")}
              </p>
            </div>
          </div>
        )}

        {!cancelled && stepIndex >= 0 && <Tracker stepIndex={stepIndex} t={t} />}

        <div>
          <SectionLabel>{t("cart.orderSummary")}</SectionLabel>
          <ul className="mt-3 flex flex-col divide-y divide-ink-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blush-50 ring-1 ring-ink-100">
                  {item.product?.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {item.product?.title ?? t("order.itemFallback")}
                  </p>
                  <p className="text-xs text-ink-500">
                    {t("common.qty")} {item.quantity}
                  </p>
                  {(item.giftCardSelected || item.customName) && (
                    <p className="mt-0.5 truncate text-xs font-medium text-bloom-700">
                      {[
                        item.giftCardSelected ? t("product.giftCardBadge") : null,
                        item.customName,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-sm font-medium tabular-nums text-ink-900">
                  {price(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="relative flex items-center justify-center py-4">
            <div className="h-px flex-1 border-t border-dashed border-ink-200" />
            <SparkleIcon size={13} className="mx-3 text-gold-500" />
            <div className="h-px flex-1 border-t border-dashed border-ink-200" />
          </div>

          <div className="flex flex-col gap-1.5 text-sm">
            <Row label={t("common.subtotal")} value={price(subtotal)} />
            {discount > 0 && (
              <Row
                label={
                  order.appliedPromoCode
                    ? `${t("common.discount")} (${order.appliedPromoCode})`
                    : t("common.discount")
                }
                value={<>− {price(discount)}</>}
                accent
              />
            )}
            {showVat ? (
              <Row
                label={
                  order.vatInclusive
                    ? t("order.vatIncludedLabel", { rate: order.vatRatePercent! })
                    : t("order.vatLabel", { rate: order.vatRatePercent! })
                }
                value={
                  <>
                    {order.vatInclusive ? "" : "+ "}
                    {price(vatAmount)}
                  </>
                }
              />
            ) : null}
            <Row label={t("common.delivery")} value={t("common.free")} />
            <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-3">
              <span className="font-display text-lg text-ink-900">{t("common.total")}</span>
              <span className="font-display text-xl font-medium tabular-nums text-ink-900">
                {price(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {order.shippingAddress && (
          <div className="border-t border-ink-100 pt-5">
            <SectionLabel>
              <PinIcon size={14} className="text-bloom-600" />
              {t("order.deliverTo")}
            </SectionLabel>
            <address className="mt-2 text-sm not-italic leading-relaxed text-ink-600">
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
      </div>

      {footer ? (
        <div className="border-t border-ink-100 bg-cream-100/60 px-6 py-5 sm:px-8">{footer}</div>
      ) : null}
    </m.div>
  );
}

function Tracker({ stepIndex, t }: { stepIndex: number; t: (k: MessageKey) => string }) {
  return (
    <ol className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i <= stepIndex;
        const current = i === stepIndex;
        return (
          <li key={s.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span
                className={
                  "h-0.5 flex-1 " +
                  (i === 0 ? "bg-transparent" : done ? "bg-bloom-500" : "bg-ink-100")
                }
              />
              <span
                className={
                  "flex shrink-0 items-center justify-center rounded-full transition-all " +
                  (current
                    ? "h-4 w-4 bg-bloom-600 ring-4 ring-bloom-100"
                    : done
                    ? "h-3 w-3 bg-bloom-600"
                    : "h-3 w-3 bg-ink-200")
                }
              />
              <span
                className={
                  "h-0.5 flex-1 " +
                  (i === STEPS.length - 1
                    ? "bg-transparent"
                    : i < stepIndex
                    ? "bg-bloom-500"
                    : "bg-ink-100")
                }
              />
            </div>
            <span
              className={
                "hyphens-auto wrap-break-word text-center text-[10px] font-medium uppercase tracking-tight sm:text-[11px] sm:tracking-wider " +
                (done ? "text-ink-800" : "text-ink-400")
              }
            >
              {t(s.labelKey)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
      {children}
    </h2>
  );
}

function statusLabelKey(status: OrderStatus): MessageKey {
  const found = STEPS.find((s) => s.key === status);
  return found ? found.labelKey : "order.stepPlaced";
}

function StatusPill({ status, label }: { status: OrderStatus; label: string }) {
  const tone =
    status === "DELIVERED"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "CANCELLED"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-cream-50 text-bloom-700 ring-bloom-200";
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 " +
        tone
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className={"tabular-nums " + (accent ? "font-medium text-bloom-700" : "text-ink-800")}>
        {value}
      </span>
    </div>
  );
}
