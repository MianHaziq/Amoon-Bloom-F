"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Lazy initialiser via `useState` so the store is created exactly once per
 * client mount. We avoid `useRef` here — React 19 / Next 16 flag accessing
 * `ref.current` during render.
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState(() => makeStore());
  return <Provider store={store}>{children}</Provider>;
}
