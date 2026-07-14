"use client";

import Link from "next/link";
import { m } from "motion/react";
import { Button, Divider, CurrencyAmount } from "@/components/ui";
import { ArrowRight, ShieldIcon, TruckIcon } from "@/components/icons";
import { useAppSelector } from "@/store";
import { microTransition } from "@/lib/motion";
import { ROUTES } from "@/constants/routes";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useRegionCopy } from "@/features/location/hooks/useRegionCopy";
import { useT } from "@/i18n/useT";

interface CartSummaryProps {
  variant?: "page" | "checkout";
}

export function CartSummary({ variant = "page" }: CartSummaryProps) {
  const items = useAppSelector((s) => s.cart.items);
  const { currency, locale } = useCurrency();
  const regionCopy = useRegionCopy();
  const { t } = useT();
  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );
  // The backend does not charge shipping, so the total is simply the subtotal
  // (promo discounts are applied by the backend at checkout).
  const total = subtotal;

  return (
    <aside
      className="flex flex-col gap-5 rounded-3xl border border-ink-100 bg-white p-6 lg:sticky lg:top-24"
      aria-label={t("cart.orderSummary")}
    >
      <h2 className="font-display text-2xl font-medium text-ink-900">
        {t("cart.orderSummary")}
      </h2>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-600">{t("common.subtotal")}</dt>
          <m.dd
            key={subtotal}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={microTransition}
            className="font-medium tabular-nums text-ink-900"
          >
            <CurrencyAmount amount={subtotal} currency={currency} locale={locale} />
          </m.dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-600">{t("common.delivery")}</dt>
          <dd className="font-medium tabular-nums text-ink-900">{t("common.free")}</dd>
        </div>
      </dl>

      <Divider />

      <div className="flex items-baseline justify-between">
        <span className="font-display text-lg text-ink-900">{t("common.total")}</span>
        <m.span
          key={total}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={microTransition}
          className="font-display text-2xl font-medium tabular-nums text-ink-900"
        >
          <CurrencyAmount amount={total} currency={currency} locale={locale} />
        </m.span>
      </div>

      {variant === "page" && (
        <Link href={ROUTES.checkout} className="contents">
          <Button
            fullWidth
            size="xl"
            disabled={items.length === 0}
            trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
          >
            {t("cart.checkout")}
          </Button>
        </Link>
      )}

      <ul className="flex flex-col gap-2 pt-1 text-xs text-ink-500">
        <li className="inline-flex items-center gap-2">
          <TruckIcon size={14} className="text-bloom-600" />
          {t("cart.cutoff", { city: regionCopy.city })}
        </li>
        <li className="inline-flex items-center gap-2">
          <ShieldIcon size={14} className="text-bloom-600" />
          {t("cart.secureCod", { city: regionCopy.city })}
        </li>
      </ul>
    </aside>
  );
}
