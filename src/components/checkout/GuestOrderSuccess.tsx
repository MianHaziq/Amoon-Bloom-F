"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { CheckIcon, ArrowRight, SparkleIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";
import type { ApiOrder } from "@/features/orders/types";
import { ReceiptStage, ConfirmationHero, ReceiptCard } from "./receiptParts";

const BENEFITS: MessageKey[] = [
  "order.benefitTrack",
  "order.benefitHistory",
  "order.benefitAddresses",
  "order.benefitUpdates",
  "order.benefitFaster",
];

/**
 * Post-purchase experience for a GUEST order. Renders the boutique receipt from
 * the order stashed in sessionStorage at checkout (guests can't refetch
 * GET /orders/:id), then a create-account nudge — Shopify-style. Degrades to a
 * plain confirmation if the stash is missing (e.g. a refresh).
 */
export function GuestOrderSuccess() {
  const { t } = useT();
  const hydrated = useIsHydrated();

  const order = useMemo<ApiOrder | null>(() => {
    if (!hydrated) return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.guestOrder);
      return raw ? (JSON.parse(raw) as ApiOrder) : null;
    } catch {
      return null;
    }
  }, [hydrated]);

  return (
    <ReceiptStage>
      <Container className="relative max-w-2xl py-14 sm:py-20">
        <ConfirmationHero
          eyebrow={t("order.confirmed")}
          title={t("order.placedTitle")}
          body={t("order.guestThankYouBody")}
        />

        {order ? <ReceiptCard order={order} /> : null}

        {/* Create-account nudge — the heart of the guest post-purchase flow. */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-bloom-200 bg-linear-to-br from-bloom-50 to-blush-50 p-6 shadow-(--shadow-lift) sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-xl font-medium text-ink-900 sm:text-2xl">
            <SparkleIcon size={18} className="text-gold-500" />
            {t("order.createAccountTitle")}
          </h2>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {BENEFITS.map((key) => (
              <li key={key} className="flex items-center gap-3 text-sm text-ink-700">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bloom-600 text-white">
                  <CheckIcon size={12} />
                </span>
                {t(key)}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-ink-500">{t("order.guestLinkHint")}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={ROUTES.register} className="contents">
              <Button
                size="lg"
                fullWidth
                className="sm:w-auto"
                trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
              >
                {t("order.createAccountCta")}
              </Button>
            </Link>
            <Link href={ROUTES.login} className="contents">
              <Button size="lg" variant="outline" fullWidth className="sm:w-auto">
                {t("order.loginCta")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link href={ROUTES.shop} className="contents">
            <Button size="lg" variant="ghost">
              {t("common.continueShopping")}
            </Button>
          </Link>
        </div>
      </Container>
    </ReceiptStage>
  );
}
