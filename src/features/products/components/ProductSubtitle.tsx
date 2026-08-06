"use client";

import { usePdpImage } from "./PdpImageContext";

interface ProductSubtitleProps {
  /** Product-level subtitle, shown when the active variant has no subtitle of its own. */
  subtitle?: string;
}

/**
 * Title-adjacent subtitle line on the PDP. Only ever rendered inside PdpImageProvider,
 * so it reads the currently selected variant (e.g. size) and shows THAT variant's own
 * subtitle when set — overriding the product-level subtitle — otherwise falls back to
 * the product subtitle. Renders nothing when neither exists.
 */
export function ProductSubtitle({ subtitle }: ProductSubtitleProps) {
  const { activeVariant } = usePdpImage();
  const text = activeVariant?.subtitle?.trim() || subtitle?.trim() || "";
  if (!text) return null;
  return <p className="mt-2 text-base text-ink-500">{text}</p>;
}
