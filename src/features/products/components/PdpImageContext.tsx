"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../types";

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
  /** The option group driving the gallery (has photos), or null if the product has none. */
  visualOptionId: string | null;
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
  // The option group that carries photos drives the gallery. Products only ever
  // have one such option in practice (colour) — first match wins.
  const visualOption = useMemo(
    () =>
      (product.options ?? []).find(
        (o) =>
          o.optionImages?.some((u) => u?.trim()) ||
          o.optionImageSets?.some((set) => set.some((u) => u?.trim()))
      ) ?? null,
    [product.options]
  );

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries((product.options ?? []).map((o) => [o.id, o.options[0] ?? ""]))
  );
  // Explicit thumbnail click — shows that exact photo even when its variant has
  // several. Cleared on a fresh option-picker selection so the new variant's own
  // first photo takes over, matching what picking a colour has always done.
  const [urlOverride, setUrlOverride] = useState<string | null>(null);

  const variantGallery = useMemo<GalleryPhoto[]>(() => {
    if (!visualOption) return [];
    return visualOption.options.flatMap((value, idx) => {
      const set = (visualOption.optionImageSets?.[idx] ?? [])
        .map((u) => u?.trim())
        .filter(Boolean) as string[];
      const single = visualOption.optionImages?.[idx]?.trim();
      const urls = set.length > 0 ? set : single ? [single] : [];
      return urls.map((url) => ({ optionId: visualOption.id, value, url }));
    });
  }, [visualOption]);

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
    if (variantGallery.length === 0) return baseGallery;
    const variantByUrl = new Map(variantGallery.map((g) => [g.url, g]));
    const seen = new Set<string>();
    const merged: GalleryPhoto[] = [];
    for (const photo of baseGallery) {
      merged.push(variantByUrl.get(photo.url) ?? photo);
      seen.add(photo.url);
    }
    for (const g of variantGallery) {
      if (!seen.has(g.url)) {
        merged.push(g);
        seen.add(g.url);
      }
    }
    return merged;
  }, [variantGallery, baseGallery]);

  const selectedValue = visualOption ? selected[visualOption.id] : null;
  const activeUrl =
    urlOverride ??
    gallery.find((g) => !visualOption || g.value === selectedValue)?.url ??
    gallery[0]?.url ??
    null;

  const selectOption = (optionId: string, value: string) => {
    setSelected((prev) => ({ ...prev, [optionId]: value }));
    setUrlOverride(null);
  };

  const setActiveUrl = (url: string) => {
    setUrlOverride(url);
    const match = variantGallery.find((g) => g.url === url);
    if (match) setSelected((prev) => ({ ...prev, [match.optionId]: match.value }));
  };

  const value = useMemo<PdpImageCtx>(
    () => ({
      selected,
      selectOption,
      activeUrl,
      setActiveUrl,
      gallery,
      visualOptionId: visualOption?.id ?? null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, activeUrl, gallery, visualOption]
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
