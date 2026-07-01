"use client";

import Image from "next/image";
import Link from "next/link";
import { IconButton } from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { QuantitySelector } from "@/features/products/components/QuantitySelector";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useAppDispatch } from "@/store";
import {
  removeItem,
  updateQuantity,
  type CartItem,
} from "@/store/slices/cart.slice";
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
    <article
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
          variant === "drawer" ? "h-24 w-20" : "h-28 w-24 md:h-32 md:w-28"
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
          <p className="shrink-0 text-sm font-semibold tabular-nums text-ink-900">
            {formatCurrency(item.unitPrice * item.quantity, currency, locale)}
          </p>
        </div>
        <p className="mt-1 text-xs text-ink-500">
          {formatCurrency(item.unitPrice, currency, locale)} {t("cart.each")}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantitySelector
            size="sm"
            value={item.quantity}
            onChange={(q) =>
              dispatch(updateQuantity({ productId: item.productId, quantity: q }))
            }
          />
          <IconButton
            label={t("common.remove")}
            variant="ghost"
            size="sm"
            onClick={() => dispatch(removeItem(item.productId))}
            className="text-ink-400 hover:text-ink-900"
          >
            <TrashIcon size={16} />
          </IconButton>
        </div>
      </div>
    </article>
  );
}
