"use client";

import Link from "next/link";
import { Button, Drawer, Divider } from "@/components/ui";
import { ArrowRight, BagIcon } from "@/components/icons";
import { CartLineItem } from "./CartLineItem";
import { formatCurrency, pluralize } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/config/site";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleCartDrawer } from "@/store/slices/ui.slice";

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.isCartDrawerOpen);
  const items = useAppSelector((s) => s.cart.items);
  const close = () => dispatch(toggleCartDrawer(false));
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce(
    (s, i) => s + i.unitPrice * i.quantity,
    0
  );
  const currency = items[0]?.currency ?? siteConfig.shipping.currency;

  return (
    <Drawer
      open={open}
      onClose={close}
      title="Your cart"
      description={
        items.length > 0
          ? pluralize(itemCount, "item")
          : "Composed for the moment."
      }
      width="max-w-md"
    >
      {items.length === 0 ? (
        <EmptyCart onContinue={close} />
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex flex-1 flex-col gap-5 px-6 py-5">
            {items.map((item) => (
              <CartLineItem
                key={item.productId}
                item={item}
                onNavigate={close}
              />
            ))}
          </div>

          <footer className="border-t border-ink-100 bg-cream-50 px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-600">Subtotal</span>
              <span className="font-display text-xl font-medium tabular-nums text-ink-900">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              Delivery & taxes calculated at checkout.
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
                  trailingIcon={<ArrowRight size={16} />}
                >
                  Checkout
                </Button>
              </Link>
              <Link href={ROUTES.cart} onClick={close} className="contents">
                <Button fullWidth size="lg" variant="outline">
                  View full cart
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
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
        <BagIcon size={28} />
      </span>
      <div>
        <h3 className="font-display text-xl text-ink-900">Your cart is quiet</h3>
        <p className="mt-2 max-w-xs text-sm text-ink-500">
          Add a bouquet, a cake, or a hand-poured candle to get started.
        </p>
      </div>
      <Divider />
      <Link href={ROUTES.shop} onClick={onContinue} className="contents">
        <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
          Browse the boutique
        </Button>
      </Link>
    </div>
  );
}
