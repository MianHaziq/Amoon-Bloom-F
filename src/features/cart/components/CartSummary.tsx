"use client";

import Link from "next/link";
import { Button, Divider } from "@/components/ui";
import { ArrowRight, ShieldIcon, TruckIcon } from "@/components/icons";
import { useAppSelector } from "@/store";
import { formatCurrency } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { useCurrency } from "@/features/location/hooks/useCurrency";

interface CartSummaryProps {
  variant?: "page" | "checkout";
}

export function CartSummary({ variant = "page" }: CartSummaryProps) {
  const items = useAppSelector((s) => s.cart.items);
  const { currency, locale } = useCurrency();
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
      aria-label="Order summary"
    >
      <h2 className="font-display text-2xl font-medium text-ink-900">
        Order summary
      </h2>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-600">Subtotal</dt>
          <dd className="font-medium tabular-nums text-ink-900">
            {formatCurrency(subtotal, currency, locale)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-600">Delivery</dt>
          <dd className="font-medium tabular-nums text-ink-900">Free</dd>
        </div>
      </dl>

      <Divider />

      <div className="flex items-baseline justify-between">
        <span className="font-display text-lg text-ink-900">Total</span>
        <span className="font-display text-2xl font-medium tabular-nums text-ink-900">
          {formatCurrency(total, currency, locale)}
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
