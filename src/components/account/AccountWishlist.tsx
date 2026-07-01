"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { TrashIcon, BagIcon, HeartIcon } from "@/components/icons";
import { useAppDispatch, useAppSelector } from "@/store";
import { removeWishlistItem } from "@/store/slices/wishlist.slice";
import { addItem } from "@/store/slices/cart.slice";
import { pushToast } from "@/store/slices/ui.slice";
import { formatCurrency } from "@/lib/format";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useT } from "@/i18n/useT";
import { ROUTES } from "@/constants/routes";

export function AccountWishlist() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.wishlist.items);
  const { currency, locale } = useCurrency();
  const { t } = useT();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-ink-100 bg-white px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bloom-50 text-bloom-700">
          <HeartIcon size={22} />
        </div>
        <div>
          <h2 className="font-display text-xl text-ink-900">
            {t("wishlist.emptyTitle")}
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {t("wishlist.emptyBody")}
          </p>
        </div>
        <Link href={ROUTES.shop} className="contents">
          <Button>{t("common.browseBoutique")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
      {items.map((item) => (
        <li
          key={item.productId}
          className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
        >
          <Link
            href={ROUTES.product(item.slug)}
            className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-blush-50"
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : null}
          </Link>

          <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <Link
                href={ROUTES.product(item.slug)}
                className="font-display text-lg text-ink-900 transition-colors hover:text-bloom-700"
              >
                {item.title}
              </Link>
              <p className="mt-0.5 text-sm font-medium text-ink-700">
                {formatCurrency(item.unitPrice, currency, locale)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                leadingIcon={<BagIcon size={14} />}
                onClick={() => {
                  dispatch(
                    addItem({
                      product: {
                        id: item.productId,
                        slug: item.slug,
                        title: item.title,
                        description: "",
                        price: {
                          amount: item.unitPrice,
                          currency: item.currency,
                        },
                        images: item.imageUrl
                          ? [{ url: item.imageUrl, alt: item.title }]
                          : [],
                        category: "",
                        categorySlug: "",
                        inStock: true,
                      },
                    })
                  );
                  dispatch(
                    pushToast({
                      title: t("common.addedToCart"),
                      description: item.title,
                      variant: "success",
                    })
                  );
                }}
              >
                {t("common.addToCart")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leadingIcon={<TrashIcon size={14} />}
                onClick={() => dispatch(removeWishlistItem(item.productId))}
              >
                {t("common.remove")}
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
