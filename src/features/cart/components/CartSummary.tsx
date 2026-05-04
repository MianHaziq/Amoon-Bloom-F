"use client";

import Link from "next/link";
import { Button, Divider } from "@/components/ui";
import { ArrowRight, ShieldIcon, TruckIcon } from "@/components/icons";
import { useAppSelector } from "@/store";
import { formatCurrency } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";

interface CartSummaryProps {
  variant?: "page" | "checkout";
}

export function CartSummary({ variant = "page" }: CartSummaryProps) {
  const items = useAppSelector((s) => s.cart.items);
  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );
  const currency = items[0]?.currency ?? siteConfig.shipping.currency;
  const freeOver = siteConfig.shipping.freeOver;
  const shipping = subtotal >= freeOver || subtotal === 0 ? 0 : 25;
  const total = subtotal + shipping;
  const remaining = Math.max(0, freeOver - subtotal);

  return (
    <aside
      className="flex flex-col gap-5 rounded-3xl border border-ink-100 bg-white p-6 lg:sticky lg:top-24"
      aria-label="Order summary"
    >
      <h2 className="font-display text-2xl font-medium text-ink-900">
        Order summary
      </h2>

      {remaining > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl bg-blush-50 p-4 text-sm text-ink-700">
          <div className="flex items-center justify-between">
            <span>Spend {formatCurrency(remaining, currency)} more for free delivery</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-blush-200">
            <div
              className="h-full rounded-full bg-bloom-500 transition-all"
              style={{ width: `${Math.min(100, (subtotal / freeOver) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-600">Subtotal</dt>
          <dd className="font-medium tabular-nums text-ink-900">
            {formatCurrency(subtotal, currency)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-600">Delivery</dt>
          <dd className="font-medium tabular-nums text-ink-900">
            {shipping === 0 ? "Free" : formatCurrency(shipping, currency)}
          </dd>
        </div>
      </dl>

      <Divider />

      <div className="flex items-baseline justify-between">
        <span className="font-display text-lg text-ink-900">Total</span>
        <span className="font-display text-2xl font-medium tabular-nums text-ink-900">
          {formatCurrency(total, currency)}
        </span>
      </div>

      {variant === "page" && (
        <Link href={ROUTES.checkout} className="contents">
          <Button
            fullWidth
            size="xl"
            disabled={items.length === 0}
            trailingIcon={<ArrowRight size={16} />}
          >
            Continue to checkout
          </Button>
        </Link>
      )}

      <ul className="flex flex-col gap-2 pt-1 text-xs text-ink-500">
        <li className="inline-flex items-center gap-2">
          <TruckIcon size={14} className="text-bloom-600" />
          {siteConfig.shipping.sameDayCutoff}
        </li>
        <li className="inline-flex items-center gap-2">
          <ShieldIcon size={14} className="text-bloom-600" />
          Secure checkout · COD available in Dubai
        </li>
      </ul>
    </aside>
  );
}
