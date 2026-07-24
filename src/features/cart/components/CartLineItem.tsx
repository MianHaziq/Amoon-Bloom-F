"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "motion/react";
import { IconButton, CurrencyAmount } from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { listItem, microTransition } from "@/lib/motion";
import { QuantitySelector } from "@/features/products/components/QuantitySelector";
import { ROUTES } from "@/constants/routes";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useAppDispatch } from "@/store";
import { removeFromCart, setCartQuantity } from "@/features/cart/cart.thunks";
import { type CartItem } from "@/store/slices/cart.slice";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";

interface CartLineItemProps {
  item: CartItem;
  variant?: "drawer" | "page";
  onNavigate?: () => void;
}

export function CartLineItem({
  item,
  variant = "drawer",
  onNavigate,
}: CartLineItemProps) {
  const dispatch = useAppDispatch();
  const { currency, locale } = useCurrency();
  const { t } = useT();

  return (
    <m.article
      variants={listItem}
      initial="hidden"
      animate="show"
      exit="exit"
      className={cn(
        "flex gap-4",
        variant === "page" &&
          "rounded-2xl border border-ink-100 bg-white p-4"
      )}
    >
      <Link
        href={ROUTES.product(item.slug)}
        onClick={onNavigate}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-blush-50",
          variant === "drawer" ? "h-20 w-20" : "h-24 w-24 md:h-28 md:w-28"
        )}
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="120px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={ROUTES.product(item.slug)}
            onClick={onNavigate}
            className="min-w-0 font-display text-base font-medium leading-tight text-ink-900 hover:text-bloom-700"
          >
            {item.title}
          </Link>
          <m.p
            key={item.unitPrice * item.quantity}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={microTransition}
            className="shrink-0 text-sm font-semibold tabular-nums text-ink-900"
          >
            <CurrencyAmount
              amount={item.unitPrice * item.quantity}
              currency={currency}
              locale={locale}
            />
          </m.p>
        </div>
        <p className="mt-1 text-xs text-ink-500">
          <CurrencyAmount amount={item.unitPrice} currency={currency} locale={locale} />{" "}
          {t("cart.each")}
        </p>
        {(item.giftCardSelected || item.customName) && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.giftCardSelected && (
              <span className="inline-flex items-center rounded-full bg-ink-900 px-2 py-0.5 text-[11px] font-medium text-white">
                {t("product.giftCardBadge")}
              </span>
            )}
            {item.customName && (
              <span className="inline-flex items-center rounded-full bg-ink-900 px-2 py-0.5 text-[11px] font-medium text-white">
                {item.customName}
              </span>
            )}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantitySelector
            size="sm"
            value={item.quantity}
            onChange={(q) =>
              dispatch(setCartQuantity(item.productId, q))
            }
          />
          <IconButton
            label={t("common.remove")}
            variant="ghost"
            size="sm"
            onClick={() => dispatch(removeFromCart(item.productId))}
            className="text-ink-400"
          >
            <TrashIcon size={16} />
          </IconButton>
        </div>
      </div>
    </m.article>
  );
}
