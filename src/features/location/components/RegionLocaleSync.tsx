"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppStore } from "@/store";
import { setLocale } from "@/store/slices/ui.slice";
import {
  setCountryFromRegion,
  setCurrencyFromRegion,
} from "@/store/slices/location.slice";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { writeRegionCookie } from "@/features/location/region";
import { writeLocaleCookie } from "@/i18n";
import {
  parsePrefix,
  codeForSlug,
  REGION_SLUG_COOKIE,
} from "@/features/location/routing";

/**
 * Keeps client state in sync with the `/:region/:locale` URL, which is the
 * source of truth. `StoreProvider` only seeds Redux once per mount, so without
 * this a client-side navigation that changes the prefix — a locale/region
 * toggle, browser back/forward across regions, or a shared in-app link — would
 * leave Redux (and the `region`/`locale` cookies the axios `X-Region`
 * interceptor and SSR read) pointing at the old region/language.
 *
 * The region slug is mapped to the region CODE via the live regions list (the
 * same cache-shared query the pickers use); API scoping stays keyed by code.
 */
export function RegionLocaleSync() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { data: regions } = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
    staleTime: 5 * 60_000,
  });

  const parsed = pathname ? parsePrefix(pathname) : null;
  const regionSlug = parsed?.regionSlug;
  const locale = parsed?.locale;

  useEffect(() => {
    if (!locale) return;
    if (store.getState().ui.locale !== locale) {
      dispatch(setLocale(locale));
      writeLocaleCookie(locale);
    }
  }, [locale, dispatch, store]);

  // Authoritatively sync <html dir>/<lang> to the URL locale (the source of truth) after
  // every navigation. The root layout sets these at SSR but is NOT re-rendered on a
  // client-side locale switch (or, if it is, can re-assert a stale dir and clobber the
  // toggle's optimistic update) — so switching e.g. AR→EN could leave the page in RTL
  // alignment until a hard refresh. This effect runs post-commit, keyed on the URL locale,
  // so it always wins and both directions flip correctly without a refresh.
  useEffect(() => {
    if (!locale || typeof document === "undefined") return;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (!regionSlug || !regions?.length) return;
    document.cookie = `${REGION_SLUG_COOKIE}=${regionSlug}; path=/; max-age=31536000; samesite=lax`;
    const code = codeForSlug(regions, regionSlug);
    if (!code) return;
    if (store.getState().location.country !== code) {
      dispatch(setCountryFromRegion(code));
      const currency = regions.find((r) => r.code === code)?.currency;
      if (currency) dispatch(setCurrencyFromRegion(currency));
      writeRegionCookie(code);
    }
  }, [regionSlug, regions, dispatch, store]);

  return null;
}
