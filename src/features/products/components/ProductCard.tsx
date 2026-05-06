"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge, IconButton } from "@/components/ui";
import { HeartIcon, BagIcon, StarIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import { useAppDispatch } from "@/store";
import { addItem } from "@/store/slices/cart.slice";
import { pushToast } from "@/store/slices/ui.slice";
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
          <IconButton
            label="Save to wishlist"
            variant="subtle"
            size="sm"
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <HeartIcon size={16} />
          </IconButton>
        </div>

        {/* Quick add (bottom, on hover) */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            className="pointer-events-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-medium text-white shadow-(--shadow-soft) hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <BagIcon size={16} />
            {product.inStock ? "Quick add" : "Sold out"}
          </button>
        </div>
      </Link>

      <div className="flex flex-col gap-1">
        <Link
          href={ROUTES.product(product.slug)}
          className="font-display text-lg font-medium leading-snug text-ink-900 transition-colors hover:text-bloom-700"
        >
          {product.title}
        </Link>
        {product.subtitle && (
          <p className="text-xs text-ink-500">{product.subtitle}</p>
        )}
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-ink-900">
              {formatCurrency(product.price.amount, product.price.currency)}
            </span>
            {hasDiscount && product.compareAtPrice && (
              <span className="text-xs text-ink-400 line-through">
                {formatCurrency(
                  product.compareAtPrice.amount,
                  product.compareAtPrice.currency
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
