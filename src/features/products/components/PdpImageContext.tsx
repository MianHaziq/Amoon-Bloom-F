"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product, ProductVariant, ProductVariantColor } from "../types";
import { firstImageForValue, photoBearingGroups, resolveActivePhotoGroup } from "../variantResolution";

/** Result of an add-to-cart attempt driven from the shared PDP selection. */
export interface PdpAddResult {
  ok: boolean;
  /** True when a required custom name is toggled on but left empty — the caller
   *  (e.g. the sticky bar) should surface the panel's name input to fill it. */
  needsName?: boolean;
}

export interface GalleryPhoto {
  /** The option group this photo belongs to (e.g. the "Colour" option's id), or "" for a plain product photo with no variant. */
  optionId: string;
  /** The option value this photo represents (e.g. "Pink"), or "" for a plain product photo. */
  value: string;
  url: string;
}

interface PdpImageCtx {
  /** Selected value per option group id, e.g. { "opt_colour": "Pink" }. */
  selected: Record<string, string>;
  /** Pick a value for one option group — swaps the gallery to that value's photo(s). */
  selectOption: (optionId: string, value: string) => void;
  /** The photo currently shown as the main image. */
  activeUrl: string | null;
  /** Show one specific photo. If it belongs to a variant, that variant is selected too, so the gallery and the option picker never disagree about what's on screen. */
  setActiveUrl: (url: string) => void;
  /** Every thumbnail to render under the main photo. */
  gallery: GalleryPhoto[];
  /** The option group CURRENTLY driving the gallery (its selected value has a photo),
   *  or null if nothing currently selected has one. A product can have more than one
   *  photo-bearing group (e.g. Size AND Colour both with their own photos) — this is
   *  whichever one is winning for the current selection, see `resolveActivePhotoGroup`. */
  activePhotoGroupId: string | null;
  /** The variant (e.g. size) matching the current selection of the product's
   *  `isVariantAxis` option group — its price/photos/subtitle should override the
   *  product's own. Null when the product has no variants, or (transiently) no
   *  value is selected for that group yet. */
  activeVariant: ProductVariant | null;
  /** The colour currently selected FOR THE ACTIVE VARIANT — e.g. Large's own Pink/
   *  Blue/Red are entirely independent from Medium's Blue/Black. Null when the
   *  active variant has no colours of its own (the vast majority). Its photo takes
   *  priority over everything else in `activeUrl` while set. */
  activeVariantColor: ProductVariantColor | null;
  /** Pick a colour for the CURRENT active variant. Remembers the choice per variant
   *  id, so flipping Size back and forth keeps each size's own last pick. */
  selectVariantColor: (colorId: string) => void;
  /** AddToCartPanel registers its add-to-cart handler here so the mobile sticky
   *  bar (rendered elsewhere in the tree) can trigger the SAME add with the live
   *  colour / name / gift-card / quantity selection. Pass null on unmount. */
  registerAddHandler: (fn: (() => Promise<PdpAddResult>) | null) => void;
  /** Run the registered add-to-cart handler. Resolves { ok:false } if none is
   *  registered yet (e.g. the panel hasn't mounted). */
  requestAdd: () => Promise<PdpAddResult>;
}

const Ctx = createContext<PdpImageCtx | null>(null);

/**
 * Single source of truth for a PDP's photo gallery + variant selection, shared by
 * `ProductGallery` and `AddToCartPanel` (siblings — neither renders the other).
 *
 * Derives everything from `product` up front so the FIRST paint already matches the
 * default selection (previously the gallery started from the product's plain photos
 * and only snapped to the right variant photo after the shopper clicked an option
 * once — a mismatched photo on load for any multi-variant product).
 *
 * When an option group carries photos (`optionImages`/`optionImageSets`), the gallery
 * shows EVERY variant's photo(s) as thumbnails — not just the selected one's — so a
 * shopper can preview other variants without opening the option picker. Clicking any
 * thumbnail both swaps the main photo and selects that variant.
 */
export function PdpImageProvider({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  // Every option group that carries its own photos, in priority order (their order
  // in `options` — reordering the groups in the admin form changes which one wins
  // when more than one has a photo for the current selection). A product can have
  // MORE than one photo-bearing group at once — e.g. a priced "Size" axis with its
  // own per-size photos AND a separate "Colour"/"Color Theme" group with its own
  // per-colour photos. See variantResolution.ts for the shared resolution logic
  // (also used by AddToCartPanel for the cart-line thumbnail, so they never drift).
  const photoGroups = useMemo(() => photoBearingGroups(product.options), [product.options]);

  // The (at most one) option group whose values are priced Product.variants
  // (e.g. "Size") — often ALSO one of photoGroups (a size also carries its own
  // photos), but tracked separately since a variant's price/subtitle matter even
  // when it carries no photo of its own.
  const variantOption = useMemo(
    () => (product.options ?? []).find((o) => o.isVariantAxis) ?? null,
    [product.options]
  );

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (product.options ?? []).map((o) => {
        // The variant axis opens on its DEFAULT variant (not just the first value),
        // matching what the product's own price/photo already show before any
        // selection — so the first paint never disagrees with what's picked.
        if (o.isVariantAxis && product.variants?.length) {
          const def = product.variants.find((v) => v.isDefault);
          const val = def
            ? o.options.find((val) => val === def.optionValue || val === def.optionValue_ar)
            : undefined;
          return [o.id, val ?? o.options[0] ?? ""];
        }
        return [o.id, o.options[0] ?? ""];
      })
    )
  );
  const activeVariant = useMemo<ProductVariant | null>(() => {
    if (!variantOption || !product.variants?.length) return null;
    const val = selected[variantOption.id];
    return (
      product.variants.find((v) => v.optionValue === val || v.optionValue_ar === val) ?? null
    );
  }, [variantOption, selected, product.variants]);

  // Which colour is picked FOR EACH variant that has any (e.g. { largeId: "pink-id",
  // mediumId: "blue-id" }) — keyed by variant id so switching Size back and forth
  // keeps each size's own last choice instead of resetting every time. Seeded once
  // at mount (same up-front-derivation principle as `selected` above) so the first
  // paint already shows the right colour for whichever variant opens by default.
  const [selectedColorByVariantId, setSelectedColorByVariantId] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        (product.variants ?? [])
          .filter((v) => v.colors && v.colors.length > 0)
          .map((v) => [v.id, v.colors!.find((c) => c.isDefault)?.id ?? v.colors![0].id])
      )
  );
  const activeVariantColor = useMemo<ProductVariantColor | null>(() => {
    if (!activeVariant?.colors?.length) return null;
    const pickedId = selectedColorByVariantId[activeVariant.id];
    return (
      activeVariant.colors.find((c) => c.id === pickedId) ??
      activeVariant.colors.find((c) => c.isDefault) ??
      activeVariant.colors[0] ??
      null
    );
  }, [activeVariant, selectedColorByVariantId]);

  // Explicit thumbnail click — shows that exact photo even when its variant has
  // several. Cleared on a fresh option-picker selection so the new variant's own
  // first photo takes over, matching what picking a colour has always done.
  const [urlOverride, setUrlOverride] = useState<string | null>(null);
  // Which photo-bearing group the shopper most recently picked a photo-having value
  // from — e.g. a product with BOTH a photographed "Size" and a photographed
  // "Colour" group: picking a new colour should swap to ITS photo even though Size
  // comes first in the default priority order (see resolveActivePhotoGroup). Null
  // until the shopper interacts with a photo-bearing group; the default order
  // (whichever group is listed first) governs the very first paint.
  const [lastPickedPhotoGroupId, setLastPickedPhotoGroupId] = useState<string | null>(null);

  // Every photo-bearing group's every value's photos, flattened and browsable as
  // thumbnails — same "preview every option" UX a single group always had, just
  // spanning however many photo-bearing groups this product actually has.
  const allVariantPhotos = useMemo<GalleryPhoto[]>(() => {
    return photoGroups.flatMap((group) =>
      group.options.flatMap((value, idx) => {
        const set = (group.optionImageSets?.[idx] ?? [])
          .map((u) => u?.trim())
          .filter(Boolean) as string[];
        const single = group.optionImages?.[idx]?.trim();
        const urls = set.length > 0 ? set : single ? [single] : [];
        return urls.map((url) => ({ optionId: group.id, value, url }));
      })
    );
  }, [photoGroups]);

  // When the ACTIVE variant has its own colours (e.g. Large's Pink/Blue/Red), they
  // take over the gallery entirely for this render — the variant's own photo(s)
  // plus each of ITS colours' own photo(s), tagged so setActiveUrl below can tell
  // them apart from the generic multi-group system. A different size's colours
  // never leak in: switching Size recomputes this from scratch. Falls back to the
  // generic `allVariantPhotos` (photoGroups) when the active variant has no
  // colours of its own — fully backward compatible with everything built before.
  const variantScopedPhotos = useMemo<GalleryPhoto[] | null>(() => {
    if (!activeVariant?.colors?.length) return null;
    const ownPhotos = activeVariant.images.map((url) => ({
      optionId: "__variantOwn",
      value: activeVariant.optionValue,
      url,
    }));
    const colorPhotos = activeVariant.colors.flatMap((c) =>
      c.images.map((url) => ({ optionId: "__variantColor", value: c.id, url }))
    );
    return [...ownPhotos, ...colorPhotos];
  }, [activeVariant]);
  const effectiveVariantPhotos = variantScopedPhotos ?? allVariantPhotos;

  const baseGallery = useMemo<GalleryPhoto[]>(
    () => product.images.map((img) => ({ optionId: "", value: "", url: img.url })),
    [product.images]
  );

  // The gallery is EVERY uploaded product image (in upload order) — not only the
  // ones assigned to a variant. Images that double as a variant photo keep their
  // {optionId, value} so clicking their thumbnail still selects that variant;
  // images attached to no option show as plain photos instead of being dropped.
  // Any variant photo whose URL isn't among the base images (a variant uploaded
  // its own distinct image) is appended so it's never lost either.
  const gallery = useMemo<GalleryPhoto[]>(() => {
    if (effectiveVariantPhotos.length === 0) return baseGallery;
    const variantByUrl = new Map(effectiveVariantPhotos.map((g) => [g.url, g]));
    const seen = new Set<string>();
    const merged: GalleryPhoto[] = [];
    for (const photo of baseGallery) {
      merged.push(variantByUrl.get(photo.url) ?? photo);
      seen.add(photo.url);
    }
    for (const g of effectiveVariantPhotos) {
      if (!seen.has(g.url)) {
        merged.push(g);
        seen.add(g.url);
      }
    }
    return merged;
  }, [effectiveVariantPhotos, baseGallery]);

  // The group the shopper most recently picked a photo from wins; falls back to
  // the default (definition) order when that group no longer has one for its
  // current value, or nothing's been picked yet (see resolveActivePhotoGroup).
  // Irrelevant (but harmless to compute) whenever the active variant owns the
  // gallery via its own colours instead — see activeUrl below.
  const activePhotoGroup = useMemo(
    () => resolveActivePhotoGroup(product.options, selected, lastPickedPhotoGroupId),
    [product.options, selected, lastPickedPhotoGroupId]
  );
  // The active variant's own colour photo wins first (most specific choice a
  // shopper can make), then falls through to the variant's own default photo, then
  // the generic multi-group system, then the plain gallery.
  const activeUrl =
    urlOverride ??
    (variantScopedPhotos
      ? activeVariantColor?.images[0] ?? activeVariant?.images[0] ?? null
      : activePhotoGroup?.images[0] ?? null) ??
    gallery[0]?.url ??
    null;

  // Bridge so the sticky bar can reuse the panel's exact add-to-cart logic
  // (which owns qty / gift-card / custom-name state) instead of duplicating it.
  const addHandlerRef = useRef<(() => Promise<PdpAddResult>) | null>(null);
  const registerAddHandler = useCallback(
    (fn: (() => Promise<PdpAddResult>) | null) => {
      addHandlerRef.current = fn;
    },
    []
  );
  const requestAdd = useCallback(
    () => (addHandlerRef.current ? addHandlerRef.current() : Promise.resolve({ ok: false })),
    []
  );

  const selectOption = (optionId: string, value: string) => {
    setSelected((prev) => ({ ...prev, [optionId]: value }));
    setUrlOverride(null);
    // Only claim "most recently picked" when this group actually has a photo for
    // the NEW value — picking a size with no photo of its own shouldn't blank out
    // whatever colour photo was showing.
    const group = photoGroups.find((g) => g.id === optionId);
    if (group && firstImageForValue(group, value)) {
      setLastPickedPhotoGroupId(optionId);
    }
  };

  const selectVariantColor = (colorId: string) => {
    if (!activeVariant) return;
    setSelectedColorByVariantId((prev) => ({ ...prev, [activeVariant.id]: colorId }));
    setUrlOverride(null);
  };

  const setActiveUrl = (url: string) => {
    setUrlOverride(url);
    const match = effectiveVariantPhotos.find((g) => g.url === url);
    if (!match) return;
    if (match.optionId === "__variantColor") {
      // Update the selection directly (not via selectVariantColor) — that helper
      // also clears urlOverride, which we just explicitly set to this exact photo.
      if (activeVariant) {
        setSelectedColorByVariantId((prev) => ({ ...prev, [activeVariant.id]: match.value }));
      }
      return;
    }
    if (match.optionId === "__variantOwn") return; // already on this variant, nothing to select
    setSelected((prev) => ({ ...prev, [match.optionId]: match.value }));
    setLastPickedPhotoGroupId(match.optionId);
  };

  const value = useMemo<PdpImageCtx>(
    () => ({
      selected,
      selectOption,
      activeUrl,
      setActiveUrl,
      gallery,
      activePhotoGroupId: activePhotoGroup?.group.id ?? null,
      activeVariant,
      activeVariantColor,
      selectVariantColor,
      registerAddHandler,
      requestAdd,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, activeUrl, gallery, activePhotoGroup, activeVariant, activeVariantColor, registerAddHandler, requestAdd]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePdpImage(): PdpImageCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("usePdpImage must be used within a PdpImageProvider");
  }
  return ctx;
}
