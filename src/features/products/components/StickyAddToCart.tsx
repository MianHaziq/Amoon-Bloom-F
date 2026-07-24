"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, CurrencyAmount } from "@/components/ui";
import { BagIcon } from "@/components/icons";
import { useCart } from "@/features/cart/hooks/useCart";
import { useAppDispatch } from "@/store";
import { toggleCartDrawer, setStickyAddToCartMounted } from "@/store/slices/ui.slice";
import { cn } from "@/lib/cn";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useT } from "@/i18n/useT";
import type { Product } from "../types";

interface StickyAddToCartProps {
  product: Product;
}

/**
 * Bottom-attached add-to-cart bar for mobile PDPs. Reveals only after the user
 * scrolls past the main "Add to cart" button so it doesn't compete with it.
 * Hidden on lg+ (the desktop panel stays in view next to the gallery).
 */
export function StickyAddToCart({ product }: StickyAddToCartProps) {
  const dispatch = useAppDispatch();
  const { add } = useCart();
  const { currency, locale } = useCurrency();
  const { t } = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after the hero panel scrolls out of view (~ first viewport).
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tell the global WhatsApp float button to lift clear of this bar for as
  // long as this PDP is mounted — tied to mount, not `visible`, so the button
  // doesn't hop up and down every time the bar slides in/out on scroll.
  useEffect(() => {
    dispatch(setStickyAddToCartMounted(true));
    return () => {
      dispatch(setStickyAddToCartMounted(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    if (!product.inStock) return;
    // This bar does a 1-click add with no option selection UI of its own. A
    // product with a gift-card/custom-name add-on needs that selection (custom
    // name is required once toggled on), so instead of silently skipping it,
    // scroll up to the main panel where those toggles live.
    if (product.giftCardEnabled || product.customNameEnabled) {
      document.getElementById("add-to-cart-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    // Open the drawer only once the mutation is confirmed; the thunk raises
    // its own error toast (e.g. "Only 3 in stock") if the server rejects.
    const res = await add(product, 1);
    if (res.ok) dispatch(toggleCartDrawer(true));
  };

  const primaryImage = product.images[0];

  return (
    <>
      {/* Reserve space so the fixed bar never overlaps the last content/footer
          on mobile (only present on PDPs, where this component renders). */}
      <div aria-hidden className="h-20 lg:hidden" />
      <div
        aria-hidden={!visible}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/95 backdrop-blur-lg transition-all duration-300 ease-out-soft lg:hidden",
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        )}
      >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {primaryImage && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-blush-50">
            <Image
              src={primaryImage.url}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-medium text-ink-900">
            {product.title}
          </p>
          <CurrencyAmount
            amount={product.price.amount}
            currency={currency}
            locale={locale}
            className="block text-sm font-semibold tabular-nums text-bloom-700"
          />
        </div>
        <Button
          size="md"
          onClick={handleAdd}
          disabled={!product.inStock}
          leadingIcon={<BagIcon size={16} />}
        >
          {product.inStock ? t("common.add") : t("common.soldOut")}
        </Button>
      </div>
      </div>
    </>
  );
}
