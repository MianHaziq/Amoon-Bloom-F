"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { m, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui";
import { BagIcon, HeartIcon, CheckIcon, SparkleIcon, PencilIcon } from "@/components/icons";
import { microTransition } from "@/lib/motion";
import { QuantitySelector } from "./QuantitySelector";
import { OptionPicker } from "./OptionPicker";
import { ShippingLeadNote } from "./ShippingLeadNote";
import { YesNoToggle } from "./YesNoToggle";
import { GiftCardModal, type GiftCardEntry } from "./GiftCardModal";
import { CustomNameModal, type CustomNameEntry } from "./CustomNameModal";
import { CashArrangementModal, type CashUnitEntry } from "./CashArrangementModal";
import { usePdpImage, type PdpAddResult } from "./PdpImageContext";
import { useCart } from "@/features/cart/hooks/useCart";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { formatCurrency } from "@/lib/format";
import { cashArrangementApi } from "@/features/cash-arrangement/api/cash-arrangement.api";
import { queryKeys } from "@/services/queryKeys";
import { useAppDispatch, useAppSelector } from "@/store";
import { pushToast, toggleCartDrawer } from "@/store/slices/ui.slice";
import { toggleWishlistItem } from "@/store/slices/wishlist.slice";
import type { CartLineCashArrangement } from "@/store/slices/cart.slice";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import type { Product } from "../types";

interface AddToCartPanelProps {
  product: Product;
  /** Same-day cutoff ("HH:mm") when same-day delivery is enabled for the current
   *  region/zone; null when not offered. Drives the same-day line in ShippingLeadNote. */
  sameDayCutoff?: string | null;
  /** Region code — only used to key the cash-arrangement eligibility query. */
  regionCode?: string;
}

/** One unit's captured add-ons, ready to add to cart. */
interface UnitConfig {
  giftCardSelected: boolean;
  message: string | null;
  customName: string | null;
  cashArrangement: CartLineCashArrangement | null;
}

export function AddToCartPanel({ product, sameDayCutoff, regionCode }: AddToCartPanelProps) {
  const dispatch = useAppDispatch();
  const { add } = useCart();
  const { t } = useT();
  const { currency, locale } = useCurrency();
  // Selection is owned by PdpImageProvider (shared with ProductGallery) so picking a
  // colour here and clicking its photo in the gallery are the same action.
  // `registerAddHandler` lets the mobile sticky bar trigger this panel's exact
  // add-to-cart with the live colour/name/gift-card/qty (it lives elsewhere in the tree).
  const { selected, selectOption, registerAddHandler, activeVariant } = usePdpImage();
  const wishlisted = useAppSelector((s) =>
    s.wishlist.items.some((i) => i.productId === product.id)
  );
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Gift card add-on: complimentary, opted into with an inline Yes/No. The toggle
  // only RECORDS the choice — the modal that collects ONE card message per unit
  // (see GiftCardModal) opens later, when "Add to cart" is clicked (see
  // startAddFlow), so it always reflects whatever quantity the shopper has settled
  // on by then rather than whatever it was the moment they said "Yes".
  const [giftCard, setGiftCard] = useState(false);
  const [giftCards, setGiftCards] = useState<GiftCardEntry[]>([]);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  // Custom name add-on: paid, opted into with an inline Yes/No — same deferred-to-
  // add-click pattern as the gift card above.
  const [customNameSelected, setCustomNameSelected] = useState(false);
  const [customNames, setCustomNames] = useState<CustomNameEntry[]>([]);
  const [customNameModalOpen, setCustomNameModalOpen] = useState(false);
  // Which step of the "Add to cart" confirmation chain is currently open (if any).
  // Drives onGiftSave/onCustomNameSave: only advance the chain (or actually add to
  // cart) when a modal's Save/Cancel fires AS PART OF that chain — a Save/Cancel
  // from the standalone "Edit" button (addStep === "idle") just records the entries.
  const [addStep, setAddStep] = useState<"idle" | "gift" | "customName">("idle");
  // Resolves the in-flight startAddFlow() promise once the chain finishes (added,
  // or the shopper cancelled a step) — lets the mobile sticky bar's requestAdd()
  // await the SAME multi-step confirmation instead of racing ahead of it.
  const pendingAddResolveRef = useRef<
    ((result: PdpAddResult | PromiseLike<PdpAddResult>) => void) | null
  >(null);

  // Cash arrangement add-on: opted into with an inline Yes/No that opens a modal collecting
  // ONE cash arrangement per unit (see CashArrangementModal), so a shopper buying several can
  // attach a different cash amount to each. Region-level eligibility resolve (no zone) —
  // authoritative fee/denominations for the real cart+zone are re-resolved at order time.
  const cashQuery = useQuery({
    queryKey: queryKeys.cashArrangement.resolve(regionCode, undefined, [product.id]),
    queryFn: () => cashArrangementApi.resolve({ cartLines: [{ productId: product.id }] }),
    enabled: Boolean(regionCode),
  });
  const cashConfig = cashQuery.data;
  const cashEligible = Boolean(cashConfig?.eligible);
  const [cashEnabled, setCashEnabled] = useState(false);
  const [cashEntries, setCashEntries] = useState<CashUnitEntry[]>([]);
  const [cashModalOpen, setCashModalOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  // If the product becomes ineligible (or the toggle is turned off), drop any collected cash.
  const onCashToggle = (v: boolean) => {
    if (v) {
      setCashEnabled(true);
      setCashModalOpen(true);
    } else {
      setCashEnabled(false);
      setCashEntries([]);
    }
  };
  const onCashCancel = () => {
    setCashModalOpen(false);
    if (cashEntries.length === 0) setCashEnabled(false);
  };
  const onCashSave = (entries: CashUnitEntry[]) => {
    setCashModalOpen(false);
    const anyIncluded = entries.some((e) => e.included && Number(e.cashAmount) > 0);
    setCashEnabled(anyIncluded);
    setCashEntries(anyIncluded ? entries : []);
  };
  const includedCashCount = cashEntries.filter((e) => e.included && Number(e.cashAmount) > 0).length;

  // Settles the in-flight startAddFlow() promise (if any) — called whenever the
  // chain finishes, whether by actually adding to cart or by a cancel abort.
  const settleAddFlow = (result: PdpAddResult | Promise<PdpAddResult>) => {
    const resolve = pendingAddResolveRef.current;
    pendingAddResolveRef.current = null;
    resolve?.(result);
  };

  // --- Gift card toggle + modal wiring -------------------------------------
  // The toggle only records the choice now — see startAddFlow for when the modal
  // actually opens. The "Yes"/"No" still flips instantly so the UI responds.
  const onGiftToggle = (v: boolean) => {
    setGiftCard(v);
    if (!v) setGiftCards([]);
  };
  const onGiftCancel = () => {
    setGiftModalOpen(false);
    // Cancelling before any card was saved leaves the toggle at "No".
    if (giftCards.length === 0) setGiftCard(false);
    // A cancel mid-"Add to cart" aborts the whole add — nothing gets added with
    // half-confirmed personalization. The shopper can just click Add again.
    if (addStep === "gift") {
      setAddStep("idle");
      settleAddFlow({ ok: false });
    }
  };
  const onGiftSave = (entries: GiftCardEntry[]) => {
    setGiftModalOpen(false);
    const anyIncluded = entries.some((e) => e.included);
    const nextGiftCards = anyIncluded ? entries : [];
    setGiftCard(anyIncluded);
    setGiftCards(nextGiftCards);

    if (addStep !== "gift") return; // opened via the standalone "Edit" button — just save
    if (customNameSelected) {
      setAddStep("customName");
      setCustomNameModalOpen(true);
    } else {
      setAddStep("idle");
      settleAddFlow(handleAdd({ giftCards: nextGiftCards }));
    }
  };
  const includedCardCount = giftCards.filter((e) => e.included).length;

  // --- Custom name toggle + modal wiring (mirrors the gift card) ------------
  const onCustomNameToggle = (v: boolean) => {
    setCustomNameSelected(v);
    if (!v) setCustomNames([]);
  };
  const onCustomNameCancel = () => {
    setCustomNameModalOpen(false);
    // Cancelling before any name was saved leaves the toggle at "No".
    if (customNames.length === 0) setCustomNameSelected(false);
    if (addStep === "customName") {
      setAddStep("idle");
      settleAddFlow({ ok: false });
    }
  };
  const onCustomNameSave = (entries: CustomNameEntry[]) => {
    setCustomNameModalOpen(false);
    const anyIncluded = entries.some((e) => e.included && e.name.trim());
    const nextCustomNames = anyIncluded ? entries : [];
    setCustomNameSelected(anyIncluded);
    setCustomNames(nextCustomNames);

    if (addStep !== "customName") return; // opened via the standalone "Edit" button
    setAddStep("idle");
    // Custom name is always the LAST step of the chain (gift card, if any, ran
    // first and its entries already committed a render ago) — perform the add.
    settleAddFlow(handleAdd({ customNames: nextCustomNames }));
  };
  const includedNameCount = customNames.filter((e) => e.included && e.name.trim()).length;

  // Current variant selection (title-keyed) + the representative photo of that variant.
  const buildSelection = () => {
    const selectedByTitle = (product.options ?? []).reduce<Record<string, string>>(
      (acc, opt) => {
        const value = selected[opt.id];
        if (value && value.trim()) acc[opt.title] = value;
        return acc;
      },
      {}
    );
    const variantImage = (() => {
      const group = product.options?.find(
        (o) =>
          o.optionImages?.some((u) => u?.trim()) ||
          o.optionImageSets?.some((set) => set.some((u) => u?.trim()))
      );
      if (!group) return undefined;
      const idx = group.options.indexOf(selected[group.id] ?? "");
      if (idx < 0) return undefined;
      const set = (group.optionImageSets?.[idx] ?? [])
        .map((u) => u?.trim())
        .filter(Boolean) as string[];
      const single = group.optionImages?.[idx]?.trim();
      return (set.length ? set[0] : single) || undefined;
    })();
    return {
      selectedByTitle: Object.keys(selectedByTitle).length > 0 ? selectedByTitle : null,
      variantImage,
    };
  };

  const confirmAdded = () => {
    dispatch(toggleCartDrawer(true));
    setJustAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1600);
  };

  // `overrides` carries a step's just-saved entries when handleAdd is invoked in
  // the SAME event-handler tick as setGiftCards/setCustomNames (that state hasn't
  // rendered yet, so reading it from the closure would see the stale array) — see
  // onGiftSave/onCustomNameSave. Any step that already committed in an EARLIER
  // tick (there's a full render between chain steps) is safely read from state.
  const handleAdd = async (overrides?: {
    giftCards?: GiftCardEntry[];
    customNames?: CustomNameEntry[];
  }): Promise<PdpAddResult> => {
    if (!product.inStock) return { ok: false };
    const { selectedByTitle, variantImage } = buildSelection();
    const effectiveGiftCards = overrides?.giftCards ?? giftCards;
    const effectiveCustomNames = overrides?.customNames ?? customNames;

    // One config per unit: each unit's own gift card (message, or none), its own custom
    // name (or none), and its own cash arrangement (amount/denom/note, or none). A unit
    // past the saved entries (qty raised afterwards) gets a sensible default.
    const units: UnitConfig[] = Array.from({ length: qty }, (_, i) => {
      const entry = giftCard ? effectiveGiftCards[i] ?? { included: true, message: "" } : undefined;
      const hasCard = !!entry?.included;
      const nameEntry = customNameSelected ? effectiveCustomNames[i] : undefined;
      const unitName = nameEntry?.included && nameEntry.name.trim() ? nameEntry.name.trim() : null;
      const cEntry = cashEnabled && cashEligible ? cashEntries[i] : undefined;
      const cashAmt = cEntry && cEntry.included ? Number(cEntry.cashAmount) : 0;
      const cashArrangement: CartLineCashArrangement | null =
        cashAmt > 0
          ? { cashAmount: cashAmt, denomination: cEntry!.denomination ?? null, note: (cEntry!.note ?? "").trim() }
          : null;
      return {
        giftCardSelected: hasCard,
        message: hasCard ? entry!.message.trim() || null : null,
        customName: unitName,
        cashArrangement,
      };
    });

    // Group identical unit configs so the same personalization becomes one line of the right
    // quantity; distinct ones (different messages, card vs no card, or DIFFERENT cash) stay
    // separate lines.
    const groups = new Map<string, { unit: UnitConfig; count: number }>();
    for (const u of units) {
      const cashKey = u.cashArrangement
        ? [u.cashArrangement.cashAmount, u.cashArrangement.denomination, u.cashArrangement.note]
        : null;
      const key = JSON.stringify([u.giftCardSelected, u.message ?? "", u.customName ?? "", cashKey]);
      const g = groups.get(key);
      if (g) g.count += 1;
      else groups.set(key, { unit: u, count: 1 });
    }

    let anyOk = false;
    // Sequential so the first add creates the server cart row before the rest fire.
    for (const { unit, count } of groups.values()) {
      const res = await add(product, count, selectedByTitle, {
        variantImage,
        giftCardSelected: unit.giftCardSelected,
        message: unit.message,
        customName: unit.customName,
        cashArrangement: unit.cashArrangement,
      });
      if (res.ok) anyOk = true;
    }
    if (!anyOk) return { ok: false };
    confirmAdded();
    return { ok: true };
  };

  // Entry point for the "Add to cart" button (and the mobile sticky bar, via
  // requestAdd). If either add-on is turned on, walks the shopper through its
  // modal FIRST — Gift card, then Custom name — so what they confirm always
  // matches the quantity on screen right now, then performs the actual add. Only
  // resolves once the whole chain settles (added, or aborted by a cancel).
  const startAddFlow = (): Promise<PdpAddResult> => {
    if (!product.inStock) return Promise.resolve({ ok: false });
    return new Promise<PdpAddResult>((resolve) => {
      pendingAddResolveRef.current = resolve;
      if (giftCard) {
        setAddStep("gift");
        setGiftModalOpen(true);
      } else if (customNameSelected) {
        setAddStep("customName");
        setCustomNameModalOpen(true);
      } else {
        pendingAddResolveRef.current = null;
        resolve(handleAdd());
      }
    });
  };

  // Expose this panel's add handler to the shared PDP context via a stable wrapper
  // that always calls the latest `startAddFlow` (which closes over the current
  // qty/colour/name/gift-card state). Lets the mobile sticky bar run the same
  // add-to-cart confirmation chain.
  const latestAdd = useRef(startAddFlow);
  useEffect(() => {
    latestAdd.current = startAddFlow;
  });
  useEffect(() => {
    const stable = () => latestAdd.current();
    registerAddHandler(stable);
    return () => registerAddHandler(null);
  }, [registerAddHandler]);

  return (
    <div id="add-to-cart-panel" className="flex flex-col gap-5">
      {product.deliveryLeadDays != null && (
        <ShippingLeadNote days={product.deliveryLeadDays} sameDayCutoff={sameDayCutoff} />
      )}

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

      {activeVariant?.contents ? (
        <p className="rounded-2xl border border-ink-100 bg-cream-50 px-4 py-3 text-sm text-ink-700">
          {activeVariant.contents}
        </p>
      ) : null}

      {product.giftCardEnabled && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-900">{t("product.giftCardOption")}</p>
              <p className="text-xs text-ink-500">{t("product.giftCardComplimentary")}</p>
            </div>
            <YesNoToggle value={giftCard} onChange={onGiftToggle} />
          </div>
          {giftCard && includedCardCount > 0 && (
            <button
              type="button"
              onClick={() => setGiftModalOpen(true)}
              className="flex items-center justify-between gap-3 rounded-xl border border-blush-100 bg-blush-50/60 px-3.5 py-2.5 text-left transition-colors hover:bg-blush-50"
            >
              <span className="inline-flex items-center gap-2 text-sm text-ink-700">
                <SparkleIcon size={14} className="text-bloom-500" />
                {includedCardCount === 1
                  ? t("product.giftCardSummaryOne")
                  : t("product.giftCardSummaryMany", { count: includedCardCount })}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-bloom-700">
                <PencilIcon size={12} />
                {t("product.giftCardEdit")}
              </span>
            </button>
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
            <YesNoToggle value={customNameSelected} onChange={onCustomNameToggle} />
          </div>
          {customNameSelected && includedNameCount > 0 && (
            <button
              type="button"
              onClick={() => setCustomNameModalOpen(true)}
              className="flex items-center justify-between gap-3 rounded-xl border border-blush-100 bg-blush-50/60 px-3.5 py-2.5 text-left transition-colors hover:bg-blush-50"
            >
              <span className="inline-flex items-center gap-2 text-sm text-ink-700">
                <PencilIcon size={14} className="text-bloom-500" />
                {includedNameCount === 1
                  ? t("product.customNameSummaryOne")
                  : t("product.customNameSummaryMany", { count: includedNameCount })}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-bloom-700">
                <PencilIcon size={12} />
                {t("product.giftCardEdit")}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Per-unit cash arrangement — placed above the quantity/add row (like the gift card),
          matching the client layout. Only shown when eligible for this product/region. */}
      {cashEligible && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-900">{t("checkout.cashArrangementTitle")}</p>
              <p className="text-xs text-ink-500">{t("checkout.cashArrangementSubtitle")}</p>
            </div>
            <YesNoToggle value={cashEnabled} onChange={onCashToggle} />
          </div>
          {cashEnabled && includedCashCount > 0 && (
            <button
              type="button"
              onClick={() => setCashModalOpen(true)}
              className="flex items-center justify-between gap-3 rounded-xl border border-blush-100 bg-blush-50/60 px-3.5 py-2.5 text-left transition-colors hover:bg-blush-50"
            >
              <span className="inline-flex items-center gap-2 text-sm text-ink-700">
                <SparkleIcon size={14} className="text-bloom-500" />
                {includedCashCount === 1
                  ? t("product.cashSummaryOne")
                  : t("product.cashSummaryMany", { count: includedCashCount })}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-bloom-700">
                <PencilIcon size={12} />
                {t("product.giftCardEdit")}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Quantity + Add to cart in one row (client-style); the quantity box matches the
          button height. Sold-out state is shown on the button itself, so no separate note. */}
      <div className="flex items-stretch gap-3">
        <QuantitySelector value={qty} onChange={setQty} />
        <m.div className="flex-1" whileTap={{ scale: 0.98 }}>
          <Button
            fullWidth
            size="xl"
            onClick={startAddFlow}
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
      </div>

      <Button
        fullWidth
        size="lg"
        variant="outline"
        leadingIcon={<HeartIcon size={18} className={cn(wishlisted && "fill-current")} />}
        aria-pressed={wishlisted}
        onClick={() => {
          dispatch(toggleWishlistItem({ product }));
          dispatch(
            pushToast({
              title: wishlisted ? t("wishlist.removed") : t("wishlist.saved"),
              description: product.title,
              variant: wishlisted ? "default" : "success",
            })
          );
        }}
      >
        {wishlisted ? t("common.saved") : t("common.save")}
      </Button>

      {product.giftCardEnabled && (
        <GiftCardModal
          open={giftModalOpen}
          quantity={qty}
          initial={giftCards}
          onCancel={onGiftCancel}
          onSave={onGiftSave}
        />
      )}

      {product.customNameEnabled && (
        <CustomNameModal
          open={customNameModalOpen}
          quantity={qty}
          initial={customNames}
          price={product.customNamePrice}
          currency={currency}
          locale={locale}
          onCancel={onCustomNameCancel}
          onSave={onCustomNameSave}
        />
      )}

      {cashEligible && cashConfig && (
        <CashArrangementModal
          open={cashModalOpen}
          quantity={qty}
          config={cashConfig}
          initial={cashEntries}
          currency={currency}
          locale={locale}
          onCancel={onCashCancel}
          onSave={onCashSave}
        />
      )}
    </div>
  );
}
