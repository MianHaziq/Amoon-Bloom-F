"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge, CurrencyAmount } from "@/components/ui";
import { BagIcon, StarIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/features/cart/cart.thunks";
import { toggleCartDrawer } from "@/store/slices/ui.slice";
import { WishlistToggle } from "@/features/wishlist/components/WishlistToggle";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useShowVatInclusive } from "@/features/vat/hooks/useShowVatInclusive";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";
import { productColorSwatches } from "../facets";
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
  const colors = productColorSwatches(product);
  const showVatInclusive = useShowVatInclusive();

  // Colour-variant image swap: hovering a dot previews its image, clicking pins
  // it — all in-place, no navigation. Falls back to the default primary image.
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [pinnedImg, setPinnedImg] = useState<string | null>(null);
  const activeColorImg = previewImg ?? pinnedImg;
  const shownUrl = activeColorImg ?? primary?.url;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    // Open the cart drawer only once the mutation is confirmed; the thunk
    // raises its own error toast (e.g. "Only 3 in stock") if the server rejects.
    const res = await dispatch(addToCart(product, 1));
    if (res.ok) {
      dispatch(toggleCartDrawer(true));
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
          {shownUrl && (
            <Image
              key={shownUrl}
              src={shownUrl}
              alt={primary?.alt ?? product.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
            />
          )}
          {/* Secondary hover image only when no colour is being previewed. */}
          {secondary && !activeColorImg && (
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

        {/* Quick add — mobile: floating icon circle (bottom-right corner) */}
        <div className="absolute bottom-2.5 inset-e-2.5 lg:hidden">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            aria-label={product.inStock ? t("common.quickAdd") : t("common.soldOut")}
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink-900 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-lg active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BagIcon size={15} />
          </button>
        </div>

        {/* Quick add — desktop: full-width bar, hover-reveal */}
        <div className="absolute inset-x-3 bottom-3 hidden pointer-events-none translate-y-2 opacity-0 transition-all duration-300 lg:block lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            className="pointer-events-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900/95 px-4 py-2.5 text-sm font-medium text-white shadow-(--shadow-soft) backdrop-blur-sm transition-[background-color,transform] duration-200 hover:bg-ink-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <BagIcon size={16} />
            {product.inStock ? t("common.quickAdd") : t("common.soldOut")}
          </button>
        </div>
      </Link>

      <div className="flex flex-col gap-1">
        {/* Category eyebrow — basic product detail only (matches the client's
            card: category · name · price · colour variants). */}
        {product.category && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bloom-700">
            {product.category}
          </p>
        )}
        <Link
          href={ROUTES.product(product.slug)}
          className="line-clamp-1 text-sm font-medium leading-snug tracking-tight text-ink-900 transition-colors hover:text-bloom-700 sm:text-base"
        >
          {product.title}
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <CurrencyAmount
              amount={product.price.amount}
              currency={currency}
              locale={locale}
              className="text-base font-semibold text-bloom-700"
            />
            {hasDiscount && product.compareAtPrice && (
              <CurrencyAmount
                amount={product.compareAtPrice.amount}
                currency={currency}
                locale={locale}
                className="text-xs text-ink-400 line-through"
              />
            )}
          </div>

          {colors.length > 0 ? (
            <span
              className="flex items-center gap-1.5"
              aria-label={t("a11y.availableColours")}
              onMouseLeave={() => setPreviewImg(null)}
            >
              {colors.slice(0, 4).map((c) => {
                const swatchClass = cn(
                  "h-3.5 w-3.5 rounded-full ring-1 ring-inset transition-shadow",
                  c.needsRing ? "ring-ink-200" : "ring-black/10",
                  pinnedImg && pinnedImg === c.image &&
                    "shadow-[0_0_0_2px_var(--color-bloom-500)]"
                );
                const style = { background: c.swatch ?? "var(--color-ink-100)" };
                // Only colours with a mapped image become interactive swappers.
                return c.image ? (
                  <button
                    key={c.value}
                    type="button"
                    title={c.value}
                    aria-label={c.value}
                    onMouseEnter={() => setPreviewImg(c.image ?? null)}
                    onFocus={() => setPreviewImg(c.image ?? null)}
                    onBlur={() => setPreviewImg(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPinnedImg((cur) => (cur === c.image ? null : c.image ?? null));
                    }}
                    className={cn(swatchClass, "cursor-pointer hover:scale-110")}
                    style={style}
                  />
                ) : (
                  <span key={c.value} title={c.value} className={swatchClass} style={style} />
                );
              })}
              {colors.length > 4 && (
                <span className="text-[10px] text-ink-400">
                  +{colors.length - 4}
                </span>
              )}
            </span>
          ) : product.rating ? (
            <span className="inline-flex items-center gap-1 text-xs text-ink-500">
              <StarIcon size={12} className="text-(--color-gold-500)" />
              {product.rating.toFixed(1)}
              {product.reviewCount && (
                <span className="text-ink-400">({product.reviewCount})</span>
              )}
            </span>
          ) : null}
        </div>
        {showVatInclusive && (
          <p className="text-xs font-medium text-bloom-600">
            {t("product.vatInclusive")}
          </p>
        )}
      </div>
    </article>
  );
}
