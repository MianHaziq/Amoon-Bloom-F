"use client";

import Link from "next/link";
import { m, AnimatePresence } from "motion/react";
import { Button, Drawer, Divider, CurrencyAmount } from "@/components/ui";
import { ArrowRight, BagIcon } from "@/components/icons";
import { CartLineItem } from "./CartLineItem";
import { OrderDeliveryNote, maxCartLeadDays } from "./OrderDeliveryNote";
import { microTransition } from "@/lib/motion";
import { ROUTES } from "@/constants/routes";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleCartDrawer } from "@/store/slices/ui.slice";
import { useT } from "@/i18n/useT";

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const { t, tc } = useT();
  const open = useAppSelector((s) => s.ui.isCartDrawerOpen);
  const items = useAppSelector((s) => s.cart.items);
  const close = () => dispatch(toggleCartDrawer(false));
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce(
    (s, i) => s + i.unitPrice * i.quantity,
    0
  );
  const orderLeadDays = maxCartLeadDays(items);
  const { currency, locale } = useCurrency();

  return (
    <Drawer
      open={open}
      onClose={close}
      title={t("cart.title")}
      description={
        items.length > 0
          ? tc(itemCount, "units.itemOne", "units.itemOther")
          : t("cart.momentTagline")
      }
      width="max-w-md"
    >
      {items.length === 0 ? (
        <EmptyCart onContinue={close} />
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex flex-1 flex-col gap-5 px-6 py-5">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartLineItem
                  key={item.productId}
                  item={item}
                  onNavigate={close}
                />
              ))}
            </AnimatePresence>
          </div>

          <footer className="border-t border-ink-100 bg-cream-50 px-6 py-5">
            {orderLeadDays != null && (
              <OrderDeliveryNote days={orderLeadDays} className="mb-4" />
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-600">{t("common.subtotal")}</span>
              <m.span
                key={subtotal}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={microTransition}
                className="font-display text-xl font-medium tabular-nums text-ink-900"
              >
                <CurrencyAmount amount={subtotal} currency={currency} locale={locale} />
              </m.span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              {t("cart.deliveryNote")}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={ROUTES.checkout}
                onClick={close}
                className="contents"
              >
                <Button
                  fullWidth
                  size="lg"
                  trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
                >
                  {t("checkout.title")}
                </Button>
              </Link>
              <Link href={ROUTES.cart} onClick={close} className="contents">
                <Button fullWidth size="lg" variant="outline">
                  {t("common.viewFullCart")}
                </Button>
              </Link>
            </div>
          </footer>
        </div>
      )}
    </Drawer>
  );
}

function EmptyCart({ onContinue }: { onContinue: () => void }) {
  const { t } = useT();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
        <BagIcon size={28} />
      </span>
      <div>
        <h3 className="font-display text-xl text-ink-900">{t("cart.empty")}</h3>
        <p className="mt-2 max-w-xs text-sm text-ink-500">
          {t("cart.emptyBody")}
        </p>
      </div>
      <Divider />
      <Link href={ROUTES.shop} onClick={onContinue} className="contents">
        <Button size="lg" trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}>
          {t("common.browseBoutique")}
        </Button>
      </Link>
    </div>
  );
}
