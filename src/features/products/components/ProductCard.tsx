"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { BagIcon, StarIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import { useAppDispatch } from "@/store";
import { addItem } from "@/store/slices/cart.slice";
import { pushToast } from "@/store/slices/ui.slice";
import { WishlistToggle } from "@/features/wishlist/components/WishlistToggle";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

const badgeMap: Record<
  NonNullable<Product["badge"]>,
  { tone: "bloom" | "gold" | "ink" | "blush"; label: string }
> = {
  new: { tone: "blush", label: "New in" },
  bestseller: { tone: "gold", label: "Bestseller" },
  limited: { tone: "ink", label: "Limited" },
  sale: { tone: "bloom", label: "Sale" },
};

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { currency, locale } = useCurrency();
  const primary = product.images[0];
  const secondary = product.images[1];
  const hasDiscount =
    product.compareAtPrice &&
    product.compareAtPrice.amount > product.price.amount;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    dispatch(addItem({ product }));
    dispatch(
      pushToast({
        title: "Added to cart",
        description: product.title,
        variant: "success",
      })
    );
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
        className="relative block overflow-hidden rounded-2xl bg-blush-50"
        aria-label={product.title}
      >
        <div className="relative aspect-4/5 w-full">
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

        {/* Badges (top-left) */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.badge && (
            <Badge tone={badgeMap[product.badge].tone}>
              {badgeMap[product.badge].label}
            </Badge>
          )}
          {!product.inStock && <Badge tone="neutral">Sold out</Badge>}
        </div>

        {/* Wishlist (top-right) */}
        <div className="absolute right-3 top-3">
          <WishlistToggle product={product} stopPropagation />
        </div>

        {/* Quick add — always visible on touch; hover-reveal on desktop (lg+) */}
        <div className="absolute inset-x-2.5 bottom-2.5 translate-y-0 opacity-100 transition-all duration-300 sm:inset-x-3 sm:bottom-3 lg:pointer-events-none lg:translate-y-2 lg:opacity-0 lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            className="pointer-events-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900/95 px-4 py-2.5 text-xs font-medium text-white shadow-(--shadow-soft) backdrop-blur-sm transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            <BagIcon size={16} />
            {product.inStock ? "Quick add" : "Sold out"}
          </button>
        </div>
      </Link>

      <div className="flex flex-col gap-1">
        <Link
          href={ROUTES.product(product.slug)}
          className="line-clamp-2 font-display text-sm font-medium leading-snug text-ink-900 transition-colors hover:text-bloom-700 sm:text-lg"
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
