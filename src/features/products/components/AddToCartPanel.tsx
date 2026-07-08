"use client";

import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui";
import { BagIcon, HeartIcon, CheckIcon } from "@/components/icons";
import { microTransition } from "@/lib/motion";
import { QuantitySelector } from "./QuantitySelector";
import { OptionPicker } from "./OptionPicker";
import { usePdpImage } from "./PdpImageContext";
import { useCart } from "@/features/cart/hooks/useCart";
import { useAppDispatch, useAppSelector } from "@/store";
import { pushToast, toggleCartDrawer } from "@/store/slices/ui.slice";
import { toggleWishlistItem } from "@/store/slices/wishlist.slice";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import type { Product } from "../types";

interface AddToCartPanelProps {
  product: Product;
}

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const dispatch = useAppDispatch();
  const { add } = useCart();
  const { t } = useT();
  const { setActiveUrl, setActiveImages } = usePdpImage();
  const wishlisted = useAppSelector((s) =>
    s.wishlist.items.some((i) => i.productId === product.id)
  );
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (product.options ?? []).map((o) => [o.id, o.options[0] ?? ""])
    )
  );

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  const handleAdd = async () => {
    if (!product.inStock) return;
    // Only confirm (toast + open drawer + "Added ✓") once the mutation succeeds.
    // For signed-in users the server enforces stock and the thunk toasts the
    // reason on rejection; guests always succeed locally.
    const res = await add(product, qty);
    if (!res.ok) return;
    dispatch(
      pushToast({
        title: t("common.addedToCart"),
        description: `${qty} × ${product.title}`,
        variant: "success",
      })
    );
    dispatch(toggleCartDrawer(true));
    // Brief inline acknowledgement on the button itself.
    setJustAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="flex flex-col gap-5">
      {product.options && product.options.length > 0 && (
        <div className="flex flex-col gap-5">
          {product.options.map((opt) => (
            <OptionPicker
              key={opt.id}
              title={opt.title}
              options={opt.options}
              value={selected[opt.id] ?? null}
              onChange={(v) => {
                setSelected((prev) => ({ ...prev, [opt.id]: v }));
                // If this value has mapped photos, swap the gallery to its set
                // (first photo becomes the main image).
                const idx = opt.options.indexOf(v);
                const set = (opt.optionImageSets?.[idx] ?? [])
                  .map((u) => u.trim())
                  .filter(Boolean);
                const single = opt.optionImages?.[idx]?.trim();
                const gallery = set.length > 0 ? set : single ? [single] : [];
                if (gallery.length > 0) {
                  setActiveImages(gallery);
                  setActiveUrl(gallery[0]);
                }
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <QuantitySelector value={qty} onChange={setQty} />
        <span className="text-sm text-ink-500">
          {product.inStock
            ? t("product.inStockReady")
            : t("product.currentlySoldOut")}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <m.div className="sm:flex-2" whileTap={{ scale: 0.98 }}>
          <Button
            fullWidth
            size="xl"
            onClick={handleAdd}
            disabled={!product.inStock}
            leadingIcon={
              product.inStock && justAdded ? (
                <m.span
                  key="check"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={microTransition}
                >
                  <CheckIcon size={18} />
                </m.span>
              ) : (
                <BagIcon size={18} />
              )
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={justAdded ? "added" : "add"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={microTransition}
                className="inline-block"
              >
                {!product.inStock
                  ? t("common.soldOut")
                  : justAdded
                  ? t("common.addedToCart")
                  : t("common.addToCart")}
              </m.span>
            </AnimatePresence>
          </Button>
        </m.div>
        <Button
          fullWidth
          size="xl"
          variant="outline"
          leadingIcon={<HeartIcon size={18} className={cn(wishlisted && "fill-current")} />}
          className="sm:flex-1"
          aria-pressed={wishlisted}
          onClick={() => {
            dispatch(toggleWishlistItem({ product }));
            dispatch(
              pushToast({
                title: wishlisted
                  ? t("wishlist.removed")
                  : t("wishlist.saved"),
                description: product.title,
                variant: wishlisted ? "default" : "success",
              })
            );
          }}
        >
          {wishlisted ? t("common.saved") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}
