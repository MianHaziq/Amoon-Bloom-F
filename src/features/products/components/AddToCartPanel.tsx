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
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { formatCurrency } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store";
import { pushToast, toggleCartDrawer } from "@/store/slices/ui.slice";
import { toggleWishlistItem } from "@/store/slices/wishlist.slice";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import type { Product } from "../types";

interface AddToCartPanelProps {
  product: Product;
}

/** Yes/No pill pair — same visual language as OptionPicker's pills. */
function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useT();
  const pill = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-all",
      active
        ? "border-ink-900 bg-ink-900 text-white"
        : "border-ink-200 bg-white text-ink-900 hover:border-ink-400"
    );
  return (
    <div className="flex shrink-0 gap-2">
      <button type="button" onClick={() => onChange(false)} aria-pressed={!value} className={pill(!value)}>
        {t("product.optionNo")}
      </button>
      <button type="button" onClick={() => onChange(true)} aria-pressed={value} className={pill(value)}>
        {t("product.optionYes")}
      </button>
    </div>
  );
}

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const dispatch = useAppDispatch();
  const { add } = useCart();
  const { t } = useT();
  const { currency, locale } = useCurrency();
  // Selection is owned by PdpImageProvider (shared with ProductGallery) so picking a
  // colour here and clicking its photo in the gallery are the same action.
  const { selected, selectOption } = usePdpImage();
  const wishlisted = useAppSelector((s) =>
    s.wishlist.items.some((i) => i.productId === product.id)
  );
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Gift card add-on: free personalized message, opted into per add-to-cart.
  const [giftCard, setGiftCard] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [sendBlankCard, setSendBlankCard] = useState(false);
  // Custom name add-on: paid, requires a name once selected.
  const [customNameSelected, setCustomNameSelected] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNameError, setCustomNameError] = useState(false);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  const handleAdd = async () => {
    if (!product.inStock) return;
    if (product.customNameEnabled && customNameSelected && !customName.trim()) {
      setCustomNameError(true);
      return;
    }
    // Only confirm (toast + open drawer + "Added ✓") once the mutation succeeds.
    // For signed-in users the server enforces stock and the thunk toasts the
    // reason on rejection; guests always succeed locally.
    const res = await add(
      product,
      qty,
      Object.keys(selected).length > 0 ? selected : null,
      {
        giftCardSelected: product.giftCardEnabled ? giftCard : undefined,
        customName:
          product.customNameEnabled && customNameSelected ? customName.trim() : undefined,
        message: product.giftCardEnabled && giftCard ? (sendBlankCard ? null : giftMessage.trim() || null) : undefined,
      }
    );
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
    <div id="add-to-cart-panel" className="flex flex-col gap-5">
      {product.options && product.options.length > 0 && (
        <div className="flex flex-col gap-5">
          {product.options.map((opt) => (
            <OptionPicker
              key={opt.id}
              title={opt.title}
              options={opt.options}
              colors={opt.optionColors}
              value={selected[opt.id] ?? null}
              onChange={(v) => selectOption(opt.id, v)}
            />
          ))}
        </div>
      )}

      {product.giftCardEnabled && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-900">{t("product.giftCardOption")}</p>
              <p className="text-xs text-ink-500">{t("product.giftCardComplimentary")}</p>
            </div>
            <YesNoToggle value={giftCard} onChange={setGiftCard} />
          </div>
          {giftCard && (
            <div className="flex flex-col gap-2 rounded-2xl border border-ink-100 bg-white p-4">
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                disabled={sendBlankCard}
                placeholder={t("product.giftCardMessagePlaceholder")}
                rows={3}
                className="w-full resize-none rounded-xl border border-ink-200 p-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100 disabled:bg-ink-50 disabled:text-ink-400"
              />
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-ink-600">
                <input
                  type="checkbox"
                  checked={sendBlankCard}
                  onChange={(e) => setSendBlankCard(e.target.checked)}
                  className="h-4 w-4 accent-bloom-600"
                />
                {t("product.giftCardBlankOption")}
              </label>
            </div>
          )}
        </div>
      )}

      {product.customNameEnabled && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white px-4 py-3">
            <p className="text-sm font-medium text-ink-900">
              {t("product.customNameOption", {
                price: formatCurrency(product.customNamePrice ?? 0, currency, locale),
              })}
            </p>
            <YesNoToggle
              value={customNameSelected}
              onChange={(v) => {
                setCustomNameSelected(v);
                if (!v) setCustomNameError(false);
              }}
            />
          </div>
          {customNameSelected && (
            <div>
              <input
                type="text"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  if (customNameError) setCustomNameError(false);
                }}
                placeholder={t("product.customNamePlaceholder")}
                className={cn(
                  "w-full rounded-xl border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-4",
                  customNameError
                    ? "border-danger focus:ring-danger/10"
                    : "border-ink-200 focus:border-bloom-400 focus:ring-bloom-100"
                )}
              />
              {customNameError && (
                <p className="mt-1 text-xs text-danger">{t("product.customNameRequired")}</p>
              )}
            </div>
          )}
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
