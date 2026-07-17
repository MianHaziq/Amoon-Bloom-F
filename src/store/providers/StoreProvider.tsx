"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import { setLocale, type Locale } from "@/store/slices/ui.slice";
import { setCountryFromRegion, setActiveRegions } from "@/store/slices/location.slice";
import { DEFAULT_COUNTRY, type CountryCode } from "@/features/location/data";
import type { ActiveRegionEntry } from "@/features/location/activeRegions";

interface StoreProviderProps {
  children: ReactNode;
  /** Locale resolved server-side from the cookie, so client components render
   *  in the right language on first paint (no English flash in Arabic). */
  initialLocale?: Locale;
  /** Country resolved server-side from the `region` cookie (see
   *  `getServerRegion` + `getCountryByRegionCode`), so client components
   *  render the right region on first paint instead of always defaulting to
   *  UAE and then flipping post-hydration (which throws a hydration
   *  mismatch for a returning visitor whose region is Saudi Arabia). */
  initialCountry?: CountryCode;
  /** Which regions are currently active (admin-controlled), resolved
   *  server-side so the picker/pill reflect a hidden region immediately on
   *  first paint instead of only after a client-side fetch. */
  initialActiveRegions?: ActiveRegionEntry[];
  /** Fallback region for a visitor whose current country is no longer active. */
  initialDefaultCountry?: CountryCode;
}

/**
 * Lazy initialiser via `useState` so the store is created exactly once per
 * client mount. We avoid `useRef` here — React 19 / Next 16 flag accessing
 * `ref.current` during render.
 */
export function StoreProvider({
  children,
  initialLocale,
  initialCountry,
  initialActiveRegions,
  initialDefaultCountry,
}: StoreProviderProps) {
  const [store] = useState(() => {
    const s = makeStore();
    if (initialLocale && initialLocale !== "en") {
      s.dispatch(setLocale(initialLocale));
    }
    if (initialCountry && initialCountry !== DEFAULT_COUNTRY) {
      s.dispatch(setCountryFromRegion(initialCountry));
    }
    if (initialActiveRegions) {
      s.dispatch(
        setActiveRegions({
          activeRegions: initialActiveRegions,
          defaultCountry: initialDefaultCountry ?? DEFAULT_COUNTRY,
        })
      );
    }
    return s;
  });
  return <Provider store={store}>{children}</Provider>;
}
