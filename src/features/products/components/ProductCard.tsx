"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { BagIcon, StarIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/features/cart/cart.thunks";
import { pushToast } from "@/store/slices/ui.slice";
import { WishlistToggle } from "@/features/wishlist/components/WishlistToggle";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

const badgeMap: Record<
  NonNullable<Product["badge"]>,
  { tone: "bloom" | "gold" | "ink" | "blush"; key: MessageKey }
> = {
  new: { tone: "blush", key: "product.badgeNew" },
  bestseller: { tone: "gold", key: "product.badgeBestseller" },
  limited: { tone: "ink", key: "product.badgeLimited" },
  sale: { tone: "bloom", key: "product.badgeSale" },
};

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { currency, locale } = useCurrency();
  const { t } = useT();
  const primary = product.images[0];
  const secondary = product.images[1];
  const hasDiscount =
    product.compareAtPrice &&
    product.compareAtPrice.amount > product.price.amount;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    // Success toast only once the mutation is confirmed; the thunk raises its
    // own error toast (e.g. "Only 3 in stock") if the server rejects.
    const res = await dispatch(addToCart(product, 1));
    if (res.ok) {
      dispatch(
        pushToast({
          title: t("common.addedToCart"),
          description: product.title,
          variant: "success",
        })
      );
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl",
        className
      )}
    >
      <Link
        href={ROUTES.product(product.slug)}
        className="relative block overflow-hidden rounded-2xl bg-blush-50 transition-transform duration-300 ease-out-soft will-change-transform group-hover:-translate-y-1"
        aria-label={product.title}
      >
        <div className="relative aspect-square w-full">
          {primary && (
            <Image
              src={primary.url}
              alt={primary.alt}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
            />
          )}
          {secondary && (
            <Image
              src={secondary.url}
              alt={secondary.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </div>

        {/* Badges (top-start) */}
        <div className="absolute start-3 top-3 flex flex-col gap-2">
          {product.badge && (
            <Badge tone={badgeMap[product.badge].tone}>
              {t(badgeMap[product.badge].key)}
            </Badge>
          )}
          {!product.inStock && <Badge tone="neutral">{t("common.soldOut")}</Badge>}
        </div>

        {/* Wishlist (top-end) */}
        <div className="absolute end-3 top-3">
          <WishlistToggle product={product} size="md" stopPropagation />
        </div>

        {/* Quick add — always visible on touch; hover-reveal on desktop (lg+) */}
        <div className="absolute inset-x-2.5 bottom-2.5 translate-y-0 opacity-100 transition-all duration-300 sm:inset-x-3 sm:bottom-3 lg:pointer-events-none lg:translate-y-2 lg:opacity-0 lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            className="pointer-events-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900/95 px-4 py-2.5 text-xs font-medium text-white shadow-(--shadow-soft) backdrop-blur-sm transition-[background-color,transform] duration-200 hover:bg-ink-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            <BagIcon size={16} />
            {product.inStock ? t("common.quickAdd") : t("common.soldOut")}
          </button>
        </div>
      </Link>

      <div className="flex flex-col gap-1">
        <Link
          href={ROUTES.product(product.slug)}
          className="line-clamp-2 text-sm font-medium leading-snug tracking-tight text-ink-900 transition-colors hover:text-bloom-700 sm:text-base"
        >
          {product.title}
        </Link>
        {product.subtitle && (
          <p className="text-xs text-ink-500">{product.subtitle}</p>
        )}
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-ink-900">
              {formatCurrency(product.price.amount, currency, locale)}
            </span>
            {hasDiscount && product.compareAtPrice && (
              <span className="text-xs text-ink-400 line-through">
                {formatCurrency(
                  product.compareAtPrice.amount,
                  currency,
                  locale
                )}
              </span>
            )}
          </div>
          {product.rating && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-500">
              <StarIcon size={12} className="text-(--color-gold-500)" />
              {product.rating.toFixed(1)}
              {product.reviewCount && (
                <span className="text-ink-400">({product.reviewCount})</span>
              )}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
