"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface PdpImageCtx {
  /** Colour-selected image URL that should override the gallery, or null. */
  activeUrl: string | null;
  setActiveUrl: (url: string | null) => void;
}

const Ctx = createContext<PdpImageCtx>({
  activeUrl: null,
  setActiveUrl: () => {},
});

/**
 * Shares the colour-selected image between the option picker (AddToCartPanel)
 * and the gallery on a product page. It's a thin client wrapper — its children
 * are passed through untouched, so the server-rendered title/price/perks keep
 * their SSR.
 */
export function PdpImageProvider({ children }: { children: React.ReactNode }) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const value = useMemo(() => ({ activeUrl, setActiveUrl }), [activeUrl]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePdpImage = () => useContext(Ctx);
