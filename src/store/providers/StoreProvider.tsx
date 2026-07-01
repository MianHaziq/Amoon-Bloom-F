"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import { setLocale, type Locale } from "@/store/slices/ui.slice";

interface StoreProviderProps {
  children: ReactNode;
  /** Locale resolved server-side from the cookie, so client components render
   *  in the right language on first paint (no English flash in Arabic). */
  initialLocale?: Locale;
}

/**
 * Lazy initialiser via `useState` so the store is created exactly once per
 * client mount. We avoid `useRef` here — React 19 / Next 16 flag accessing
 * `ref.current` during render.
 */
export function StoreProvider({ children, initialLocale }: StoreProviderProps) {
  const [store] = useState(() => {
    const s = makeStore();
    if (initialLocale && initialLocale !== "en") {
      s.dispatch(setLocale(initialLocale));
    }
    return s;
  });
  return <Provider store={store}>{children}</Provider>;
}
