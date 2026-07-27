import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_REGION_CODE } from "@/features/location/region";
import { siteConfig } from "@/config/site";

export interface LocationState {
  /** The backend region's `code` (e.g. "UAE", "SA") — regions are admin-managed
   * data (`GET /regions`), not a fixed compile-time list. */
  country: string;
  /**
   * The active region's currency code (e.g. "AED", "SAR"), seeded server-side
   * from the `region` cookie + live regions list (see `StoreProvider`'s
   * `initialCurrency` prop). This is a HYDRATION-STABLE mirror of the currency:
   * `useCurrency` reads it for the first render so SSR and the first client
   * render always agree on the currency symbol, then switches to the live
   * `GET /regions` lookup post-hydration (which resolves the same value, so no
   * flash, but stays reactive to a client-side region switch). Without this,
   * the currency was resolved purely from the react-query cache whose
   * availability on the first client render could differ from SSR — flipping
   * the AED/SAR sign and throwing a hydration mismatch on the price glyph.
   */
  currency: string;
  /** A delivery zone's `name` (e.g. "Dubai") — display/prefill convenience
   * only; never used for pricing or checkout validation (see DeliveryZone). */
  city: string;
  /**
   * `true` once the user has explicitly picked a country/city. Defaults stay
   * "soft" so the storefront can render server-side without forcing onboarding.
   */
  hasChosen: boolean;
  /** Which storefront regions are currently active (admin-controlled). Seeds
   * "fail-open" with just the default so nothing regresses before real data
   * arrives (SSR) or if a later client fetch fails — see `setActiveRegions`. */
  activeRegions: string[];
  /** Fallback region for a visitor whose current country is no longer active. */
  defaultCountry: string;
}

const initialState: LocationState = {
  country: DEFAULT_REGION_CODE,
  currency: siteConfig.currency,
  // No synchronous default city available now that zones are admin data —
  // left blank until live zone data resolves one (LocationSheet/DeliverToPill
  // both degrade gracefully to an empty string).
  city: "",
  hasChosen: false,
  activeRegions: [DEFAULT_REGION_CODE],
  defaultCountry: DEFAULT_REGION_CODE,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    /**
     * Sets country + city together. Callers own picking a city that's valid
     * for the country (they have the live delivery-zone data on hand for
     * rendering anyway — see `LocationSheet`) since the reducer itself can no
     * longer do that validation synchronously against admin-managed data.
     */
    setLocation(state, action: PayloadAction<{ country: string; city: string }>) {
      state.country = action.payload.country;
      state.city = action.payload.city;
      state.hasChosen = true;
    },
    setLocationFromStorage(
      state,
      action: PayloadAction<Partial<LocationState>>
    ) {
      // Validate before applying — stored data could be from an old schema.
      if (action.payload.country && typeof action.payload.country === "string") {
        state.country = action.payload.country;
      }
      if (action.payload.city && typeof action.payload.city === "string") {
        state.city = action.payload.city;
      }
      if (typeof action.payload.hasChosen === "boolean") {
        state.hasChosen = action.payload.hasChosen;
      }
    },
    /**
     * Seeds the store's country from the `region` cookie at creation time (see
     * `StoreProvider`'s `initialCountry` prop), so the client's first render
     * already matches what the server rendered from that same cookie —
     * otherwise client components (which read Redux, not the cookie) always
     * start from the hardcoded UAE default and throw a hydration mismatch the
     * moment a returning visitor's real region differs. Deliberately leaves
     * `hasChosen` untouched: this isn't a user pick, so the localStorage
     * hydration in `LocationPersistence` still takes precedence if present.
     */
    setCountryFromRegion(state, action: PayloadAction<string>) {
      state.country = action.payload;
    },
    /**
     * Seeds the active currency from the server-resolved region (see
     * `StoreProvider`'s `initialCurrency`). SSR-seed only — mirrors
     * `setCountryFromRegion`; the live `GET /regions` lookup in `useCurrency`
     * takes over after hydration so a client-side region switch still updates
     * the currency without a full reload.
     */
    setCurrencyFromRegion(state, action: PayloadAction<string>) {
      if (action.payload) state.currency = action.payload;
    },
    /**
     * Refreshes which regions are currently active (SSR seed on every page
     * load, or the client's tab-refocus check — see `LocationPersistence`).
     * Also silently corrects `country` (and clears `city`, since it may no
     * longer belong to the new country) if the current selection is no longer
     * active, so a visitor whose region just got hidden by an admin never
     * stays pointed at it. Deliberately leaves `hasChosen` untouched — an
     * auto-correction isn't a user pick (mirrors `setCountryFromRegion`).
     */
    setActiveRegions(
      state,
      action: PayloadAction<{ activeRegions: string[]; defaultCountry: string }>
    ) {
      const { activeRegions, defaultCountry } = action.payload;
      state.activeRegions = activeRegions;
      state.defaultCountry = defaultCountry;
      if (!activeRegions.includes(state.country)) {
        state.country = defaultCountry;
        state.city = "";
      }
    },
  },
});

export const {
  setLocation,
  setLocationFromStorage,
  setCountryFromRegion,
  setCurrencyFromRegion,
  setActiveRegions,
} = locationSlice.actions;
export default locationSlice.reducer;
