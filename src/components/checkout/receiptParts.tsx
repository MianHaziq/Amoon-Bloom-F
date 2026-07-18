"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { m } from "motion/react";
import { Button, CurrencyAmount } from "@/components/ui";
import {
  CheckIcon,
  TruckIcon,
  SparkleIcon,
  PinIcon,
  PhoneIcon,
  MailIcon,
  DocumentIcon,
  DownloadIcon,
} from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { formatCurrency, intlLocale } from "@/lib/format";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useT } from "@/i18n/useT";
import { siteConfig } from "@/config/site";
import type { MessageKey } from "@/i18n";
import type { ApiOrder, OrderStatus, PaymentStatus } from "@/features/orders/types";

/**
 * Shared post-order pieces. `ReceiptCard` renders a professional, print-ready
 * invoice/receipt (branded header, order/customer/payment meta, an aligned
 * items table, and an emphasised totals column) reused by both the
 * authenticated receipt (OrderReceipt) and the guest confirmation
 * (GuestOrderSuccess). `ConfirmationHero`/`ReceiptStage` frame it with the
 * on-screen success moment (excluded from print).
 */

const STEPS: { key: OrderStatus; labelKey: MessageKey }[] = [
  { key: "PENDING", labelKey: "order.stepPlaced" },
  { key: "CONFIRMED", labelKey: "order.stepConfirmed" },
  { key: "PROCESSING", labelKey: "order.stepPreparing" },
  { key: "SHIPPED", labelKey: "order.stepOnTheWay" },
  { key: "DELIVERED", labelKey: "order.stepDelivered" },
];

// Shared column template so the items table header and every row stay aligned.
// Mobile collapses to "details | amount"; sm+ expands to the full four columns.
const ITEM_COLS =
  "grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_3rem_6.5rem_7rem] items-center gap-x-4";

/** Clean white stage — the receipt is the focus, no decorative surface tint. */
export function ReceiptStage({ children }: { children: ReactNode }) {
  return (
    <section className="receipt-stage relative overflow-hidden bg-cream-50">
      <div
        aria-hidden
        className="no-print pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(55%_100%_at_50%_0,var(--color-bloom-50)_0%,transparent_72%)]"
      />
      {children}
    </section>
  );
}

/** Animated success seal + gold-flanked eyebrow + title + body. Screen-only. */
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
      className="no-print flex flex-col items-center text-center"
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
 * The professional receipt/invoice — branded header, order/customer/payment
 * meta, an aligned items table, and an emphasised totals column. Shared by the
 * authed receipt and the guest confirmation; screen actions live alongside it
 * in `ReceiptActions`.
 */
export function ReceiptCard({ order }: { order: ApiOrder }) {
  const { t, locale } = useT();
  const { currency } = useCurrency();

  const subtotal =
    order.subtotalAmount ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = order.discountAmount ?? 0;
  const vatAmount = order.vatAmount ?? order.taxAmount ?? 0;
  const showVat = order.vatRatePercent != null && vatAmount > 0;
  const shipping = order.shippingAmount ?? 0;
  const stepIndex = STEPS.findIndex((s) => s.key === order.status);
  const cancelled = order.status === "CANCELLED";
  const orderRef = order.orderNumber ? `#${order.orderNumber}` : `#${order.id.slice(0, 8)}`;
  const dateStr = new Date(order.createdAt).toLocaleDateString(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const price = (n: number) => (
    <CurrencyAmount amount={n} currency={currency} locale={locale} />
  );

  const email = order.guestEmail ?? null;
  const addr = order.shippingAddress;
  const addressLine = addr
    ? [
        // Area/zone is the current checkout's primary location field; fall back
        // to legacy street/city/country for orders placed before it existed.
        addr.area,
        addr.deliveryZoneName,
        addr.apartment,
        addr.streetAddress,
        addr.city,
        addr.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="receipt-print-area mt-10 overflow-hidden rounded-2xl border border-ink-200/80 bg-cream-50 shadow-(--shadow-soft)"
    >
      {/* Branded header: company identity + document title/meta */}
      <header className="flex flex-col gap-6 border-b border-ink-100 px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-9 sm:py-7">
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt={siteConfig.name} className="h-8 w-auto self-start" />
          <div>
            <p className="font-display text-base font-medium text-ink-900">{siteConfig.name}</p>
            <p className="text-xs text-ink-400">{siteConfig.legalEntity}</p>
          </div>
          <p className="text-xs text-ink-500">{siteConfig.contact.email}</p>
        </div>

        <div className="sm:text-end">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bloom-700">
            {t("order.receipt")}
          </p>
          <p className="mt-1 font-display text-2xl font-medium tabular-nums text-ink-900">
            {orderRef}
          </p>
          <p className="mt-1 text-xs text-ink-500">{dateStr}</p>
        </div>
      </header>

      {/* Meta grid: customer · order details · payment */}
      <div className="grid gap-6 border-b border-ink-100 px-6 py-6 sm:grid-cols-3 sm:px-9">
        <div>
          <SectionLabel>
            <PinIcon size={13} className="text-bloom-600" />
            {t("order.deliverTo")}
          </SectionLabel>
          <div className="mt-2.5 space-y-1 text-sm not-italic leading-relaxed text-ink-600">
            {addr?.fullName && (
              <p className="font-medium text-ink-900">{addr.fullName}</p>
            )}
            {addressLine && <p>{addressLine}</p>}
            {addr?.phone && (
              <p className="flex items-center gap-1.5 sm:justify-start">
                <PhoneIcon size={12} className="shrink-0 text-ink-400" />
                <span className="tabular-nums">{addr.phone}</span>
              </p>
            )}
            {email && (
              <p className="flex items-center gap-1.5">
                <MailIcon size={12} className="shrink-0 text-ink-400" />
                <span className="truncate">{email}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <SectionLabel>{t("order.orderDetails")}</SectionLabel>
          <dl className="mt-2.5 space-y-1.5 text-sm">
            <MetaRow label={t("order.orderNumber")} value={<span className="tabular-nums">{orderRef}</span>} />
            <MetaRow label={t("account.placedOn")} value={dateStr} />
            <MetaRow
              label={t("order.status")}
              value={<StatusBadge tone={orderStatusTone(order.status)} label={t(statusLabelKey(order.status))} />}
            />
          </dl>
        </div>

        <div>
          <SectionLabel>{t("order.paymentDetails")}</SectionLabel>
          <dl className="mt-2.5 space-y-1.5 text-sm">
            <MetaRow
              label={t("order.method")}
              value={order.paymentMethod === "COD" ? t("checkout.cod") : order.paymentMethod}
            />
            <MetaRow
              label={t("order.paymentStatus")}
              value={
                <StatusBadge
                  tone={paymentTone(order.paymentStatus)}
                  label={t(paymentLabelKey(order.paymentStatus))}
                />
              }
            />
          </dl>
        </div>
      </div>

      {/* COD callout */}
      {order.paymentMethod === "COD" && order.paymentStatus !== "PAID" && !cancelled && (
        <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl border border-bloom-100 bg-bloom-50/60 p-4 sm:mx-9">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-50 text-bloom-700 shadow-(--shadow-soft)">
            <TruckIcon size={18} />
          </span>
          <p className="text-sm text-ink-700">
            {t("order.codReady", { amount: formatCurrency(order.totalAmount, currency, locale) })}
          </p>
        </div>
      )}

      {/* Items table */}
      <div className="px-6 pt-7 sm:px-9">
        <SectionLabel>{t("order.itemsPurchased")}</SectionLabel>
        <div className={`${ITEM_COLS} mt-3 border-b border-ink-200 pb-2`}>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            {t("order.colItem")}
          </span>
          <span className="hidden text-center text-[11px] font-semibold uppercase tracking-wider text-ink-400 sm:block">
            {t("common.qty")}
          </span>
          <span className="hidden text-end text-[11px] font-semibold uppercase tracking-wider text-ink-400 sm:block">
            {t("order.colUnit")}
          </span>
          <span className="text-end text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            {t("order.colAmount")}
          </span>
        </div>

        <ul className="divide-y divide-ink-100">
          {order.items.map((item) => (
            <li key={item.id} className={`${ITEM_COLS} py-3.5`}>
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-blush-50 ring-1 ring-ink-100">
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
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {item.product?.title ?? t("order.itemFallback")}
                  </p>
                  {(item.giftCardSelected || item.customName) && (
                    <p className="mt-0.5 truncate text-xs text-bloom-700">
                      {[item.giftCardSelected ? t("product.giftCardBadge") : null, item.customName]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {/* Mobile-only per-unit breakdown (columns are hidden on mobile) */}
                  <p className="mt-0.5 text-xs text-ink-500 tabular-nums sm:hidden">
                    {t("common.qty")} {item.quantity} · {price(item.price)}
                  </p>
                </div>
              </div>
              <span className="hidden text-center text-sm text-ink-600 tabular-nums sm:block">
                {item.quantity}
              </span>
              <span className="hidden text-end text-sm text-ink-600 tabular-nums sm:block">
                {price(item.price)}
              </span>
              <span className="text-end text-sm font-medium text-ink-900 tabular-nums">
                {price(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Totals — right-aligned summary column */}
      <div className="px-6 pb-7 pt-5 sm:px-9">
        <div className="ms-auto flex flex-col gap-2 text-sm sm:w-80">
          <TotalRow label={t("common.subtotal")} value={price(subtotal)} />
          {discount > 0 && (
            <TotalRow
              label={
                order.appliedPromoCode
                  ? `${t("common.discount")} (${order.appliedPromoCode})`
                  : t("common.discount")
              }
              value={<>− {price(discount)}</>}
              accent
            />
          )}
          {showVat && (
            <TotalRow
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
          )}
          <TotalRow
            label={t("common.delivery")}
            value={shipping > 0 ? price(shipping) : t("common.free")}
          />
          <div className="mt-2 flex items-baseline justify-between border-t-2 border-ink-900/85 pt-3">
            <span className="font-display text-lg text-ink-900">{t("common.total")}</span>
            <span className="font-display text-2xl font-medium tabular-nums text-ink-900">
              {price(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Order tracker — helpful on screen, omitted from the printed invoice */}
      {!cancelled && stepIndex >= 0 && (
        <div className="no-print border-t border-ink-100 px-6 py-6 sm:px-9">
          <SectionLabel>{t("order.whatsNext")}</SectionLabel>
          <div className="mt-4">
            <Tracker stepIndex={stepIndex} t={t} />
          </div>
        </div>
      )}

      {cancelled && (
        <div className="border-t border-ink-100 px-6 py-4 sm:px-9">
          <p className="text-sm font-medium text-(--color-danger)">{t("order.cancelledNote")}</p>
        </div>
      )}

      {/* Thank-you strip — reads like an invoice footer */}
      <div className="border-t border-ink-100 bg-cream-100/50 px-6 py-4 text-center sm:px-9">
        <p className="text-xs text-ink-500">
          {t("order.receiptFooter", { brand: siteConfig.name })}
        </p>
      </div>
    </m.div>
  );
}

/**
 * Print / Download-PDF toolbar. Both actions route through the browser's native
 * print dialog (whose "Save as PDF" destination produces the download), so no
 * new dependency or business logic is introduced. Optional `children` render
 * before the print controls for context actions (Back, Track, …).
 */
export function ReceiptActions({ children }: { children?: ReactNode }) {
  const { t } = useT();
  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };
  return (
    <div className="no-print mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
      {children}
      <Button
        size="lg"
        variant="outline"
        fullWidth
        className="sm:w-auto"
        leadingIcon={<DocumentIcon size={16} />}
        onClick={handlePrint}
      >
        {t("order.print")}
      </Button>
      <Button
        size="lg"
        fullWidth
        className="sm:w-auto"
        leadingIcon={<DownloadIcon size={16} />}
        onClick={handlePrint}
      >
        {t("order.downloadPdf")}
      </Button>
    </div>
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
    <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
      {children}
    </h2>
  );
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-end font-medium text-ink-900">{value}</dd>
    </div>
  );
}

function TotalRow({
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

type BadgeTone = "success" | "pending" | "danger" | "neutral";

function StatusBadge({ tone, label }: { tone: BadgeTone; label: string }) {
  const tones: Record<BadgeTone, string> = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    danger: "bg-rose-50 text-rose-700 ring-rose-200",
    neutral: "bg-cream-100 text-bloom-700 ring-bloom-200",
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset " +
        tones[tone]
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

function orderStatusTone(status: OrderStatus): BadgeTone {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

function paymentTone(status: PaymentStatus): BadgeTone {
  if (status === "PAID") return "success";
  if (status === "FAILED") return "danger";
  return "pending";
}

function paymentLabelKey(status: PaymentStatus): MessageKey {
  if (status === "PAID") return "order.paid";
  if (status === "FAILED") return "order.failed";
  return "order.unpaid";
}

function statusLabelKey(status: OrderStatus): MessageKey {
  const found = STEPS.find((s) => s.key === status);
  return found ? found.labelKey : "order.stepPlaced";
}
