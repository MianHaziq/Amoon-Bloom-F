"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "motion/react";
import { Container, Button, CurrencyAmount } from "@/components/ui";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import {
  CheckCircleIcon,
  CheckIcon,
  TruckIcon,
  ArrowRight,
} from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { formatCurrency, intlLocale } from "@/lib/format";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";
import type { ApiOrder } from "@/features/orders/types";

const BENEFITS: MessageKey[] = [
  "order.benefitTrack",
  "order.benefitHistory",
  "order.benefitAddresses",
  "order.benefitUpdates",
  "order.benefitFaster",
];

/**
 * Post-purchase experience for a GUEST order. Renders from the order stashed in
 * sessionStorage at checkout (guests can't refetch GET /orders/:id) and nudges
 * the customer to create an account — Shopify-style. Degrades gracefully to a
 * simple "order placed" confirmation if the stash is missing (e.g. a refresh).
 */
export function GuestOrderSuccess() {
  const { currency, locale } = useCurrency();
  const { t, locale: uiLocale } = useT();
  const hydrated = useIsHydrated();

  // Read the stashed order only after hydration so SSR and the first client
  // render match (avoids the setState-in-effect + hydration-mismatch pitfalls).
  const order = useMemo<ApiOrder | null>(() => {
    if (!hydrated) return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.guestOrder);
      return raw ? (JSON.parse(raw) as ApiOrder) : null;
    } catch {
      return null;
    }
  }, [hydrated]);

  const money = (n: number) => formatCurrency(n, currency, locale);
  const subtotal =
    order?.subtotalAmount ??
    order?.items.reduce((s, i) => s + i.price * i.quantity, 0) ??
    0;
  const discount = order?.discountAmount ?? 0;
  const vatAmount = order?.vatAmount ?? order?.taxAmount ?? 0;
  const showVat = order != null && order.vatRatePercent != null && vatAmount > 0;

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
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
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"
        >
          <CheckCircleIcon size={28} />
        </m.span>
        <m.p
          variants={staggerItem}
          className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700"
        >
          {t("order.confirmed")}
        </m.p>
        <m.h1
          variants={staggerItem}
          className="mt-2 font-display text-4xl font-medium leading-tight text-ink-900 sm:text-5xl"
        >
          {t("order.placedTitle")}
        </m.h1>
        <m.p
          variants={staggerItem}
          className="mt-3 max-w-md text-sm text-ink-500 sm:text-base"
        >
          {t("order.guestThankYouBody")}
        </m.p>
      </m.div>

      <div className="mt-10 flex flex-col gap-6">
        {/* Order summary — only when we have the stashed order. */}
        {order ? (
          <>
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
                {new Date(order.createdAt).toLocaleDateString(
                  intlLocale(uiLocale),
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </p>
            </div>

            {order.paymentMethod === "COD" ? (
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
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-ink-100 bg-white p-5">
              <h2 className="mb-4 font-display text-lg font-medium text-ink-900">
                {t("cart.orderSummary")}
              </h2>
              <ul className="flex flex-col divide-y divide-ink-100">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blush-50">
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
                    </div>
                    <p className="shrink-0 text-sm font-medium tabular-nums text-ink-900">
                      <CurrencyAmount
                        amount={item.price * item.quantity}
                        currency={currency}
                        locale={locale}
                      />
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-1.5 border-t border-ink-100 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-600">{t("common.subtotal")}</span>
                  <span className="tabular-nums text-ink-900">
                    <CurrencyAmount amount={subtotal} currency={currency} locale={locale} />
                  </span>
                </div>
                {discount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-600">
                      {order.appliedPromoCode
                        ? `${t("common.discount")} (${order.appliedPromoCode})`
                        : t("common.discount")}
                    </span>
                    <span className="tabular-nums font-medium text-bloom-700">
                      −{" "}
                      <CurrencyAmount amount={discount} currency={currency} locale={locale} />
                    </span>
                  </div>
                ) : null}
                {showVat ? (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-600">
                      {order!.vatInclusive
                        ? t("order.vatIncludedLabel", { rate: order!.vatRatePercent! })
                        : t("order.vatLabel", { rate: order!.vatRatePercent! })}
                    </span>
                    <span className="tabular-nums text-ink-900">
                      {!order!.vatInclusive && "+ "}
                      <CurrencyAmount amount={vatAmount} currency={currency} locale={locale} />
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-ink-600">{t("common.delivery")}</span>
                  <span className="tabular-nums text-ink-900">
                    {t("common.free")}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between border-t border-ink-100 pt-3">
                  <span className="font-display text-lg text-ink-900">
                    {t("common.total")}
                  </span>
                  <span className="font-display text-xl font-medium tabular-nums text-ink-900">
                    <CurrencyAmount amount={order.totalAmount} currency={currency} locale={locale} />
                  </span>
                </div>
              </div>
            </div>

            {order.shippingAddress ? (
              <div className="rounded-2xl border border-ink-100 bg-white p-5">
                <h2 className="mb-2 font-display text-lg font-medium text-ink-900">
                  {t("order.deliverTo")}
                </h2>
                <address className="text-sm not-italic leading-relaxed text-ink-600">
                  {order.shippingAddress.fullName ? (
                    <span className="block font-medium text-ink-900">
                      {order.shippingAddress.fullName}
                    </span>
                  ) : null}
                  {[
                    order.shippingAddress.apartment,
                    order.shippingAddress.streetAddress,
                    order.shippingAddress.city,
                    order.shippingAddress.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  {order.shippingAddress.phone ? (
                    <span className="mt-1 block">
                      {order.shippingAddress.phone}
                    </span>
                  ) : null}
                </address>
              </div>
            ) : null}
          </>
        ) : null}

        {/* Create-account nudge — the heart of the guest post-purchase flow. */}
        <div className="rounded-2xl border border-bloom-200 bg-linear-to-br from-bloom-50 to-cream-50 p-6 sm:p-7">
          <h2 className="font-display text-xl font-medium text-ink-900 sm:text-2xl">
            {t("order.createAccountTitle")}
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {BENEFITS.map((key) => (
              <li key={key} className="flex items-center gap-3 text-sm text-ink-700">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bloom-600 text-white">
                  <CheckIcon size={12} />
                </span>
                {t(key)}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-500">{t("order.guestLinkHint")}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={ROUTES.register} className="contents">
              <Button
                size="lg"
                trailingIcon={
                  <ArrowRight size={16} className="rtl:-scale-x-100" />
                }
              >
                {t("order.createAccountCta")}
              </Button>
            </Link>
            <Link href={ROUTES.login} className="contents">
              <Button size="lg" variant="outline">
                {t("order.loginCta")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Link href={ROUTES.shop} className="contents">
            <Button size="lg" variant="ghost">
              {t("common.continueShopping")}
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
