import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { COUNTRIES, DEFAULT_COUNTRY, getCountry, type CountryCode } from "@/features/location/data";
import type { ActiveRegionEntry } from "@/features/location/activeRegions";

export interface LocationState {
  country: CountryCode;
  city: string;
  /**
   * `true` once the user has explicitly picked a country/city. Defaults stay
   * "soft" so the storefront can render server-side without forcing onboarding.
   */
  hasChosen: boolean;
  /**
   * Which storefront regions are currently active (admin-controlled). Seeds
   * "fail-open" as both static countries so nothing regresses before real data
   * arrives (SSR) or if a later client fetch fails — see `setActiveRegions`.
   */
  activeRegions: ActiveRegionEntry[];
  /** Fallback region for a visitor whose current country is no longer active. */
  defaultCountry: CountryCode;
}

const fallback = getCountry(DEFAULT_COUNTRY);
const initialState: LocationState = {
  country: DEFAULT_COUNTRY,
  city: fallback.defaultCity,
  hasChosen: false,
  activeRegions: COUNTRIES.map((c) => ({ code: c.regionCode, country: c.code })),
  defaultCountry: DEFAULT_COUNTRY,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setCountry(state, action: PayloadAction<CountryCode>) {
      state.country = action.payload;
      const def = getCountry(action.payload);
      // Reset city to the first city of the new country so we don't keep
      // a Dubai pin on a Saudi address.
      if (!(def.cities as readonly string[]).includes(state.city)) {
        state.city = def.defaultCity;
      }
      state.hasChosen = true;
    },
    setCity(state, action: PayloadAction<string>) {
      state.city = action.payload;
      state.hasChosen = true;
    },
    setLocation(
      state,
      action: PayloadAction<{ country: CountryCode; city: string }>
    ) {
      state.country = action.payload.country;
      state.city = action.payload.city;
      state.hasChosen = true;
    },
    setLocationFromStorage(
      state,
      action: PayloadAction<Partial<LocationState>>
    ) {
      // Validate before applying — stored data could be from an old schema.
      if (action.payload.country) {
        const def = getCountry(action.payload.country as CountryCode);
        state.country = def.code;
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
    setCountryFromRegion(state, action: PayloadAction<CountryCode>) {
      const def = getCountry(action.payload);
      state.country = def.code;
      if (!(def.cities as readonly string[]).includes(state.city)) {
        state.city = def.defaultCity;
      }
    },
    /**
     * Refreshes which regions are currently active (SSR seed on every page
     * load, or the client's tab-refocus check — see `LocationPersistence`).
     * Also silently corrects `country`/`city` if the current selection is no
     * longer active, so a visitor whose region just got hidden by an admin
     * never stays pointed at it. Deliberately leaves `hasChosen` untouched —
     * an auto-correction isn't a user pick (mirrors `setCountryFromRegion`).
     */
    setActiveRegions(
      state,
      action: PayloadAction<{ activeRegions: ActiveRegionEntry[]; defaultCountry: CountryCode }>
    ) {
      const { activeRegions, defaultCountry } = action.payload;
      state.activeRegions = activeRegions;
      state.defaultCountry = defaultCountry;
      const stillActive = activeRegions.some((r) => r.country === state.country);
      if (!stillActive) {
        const def = getCountry(defaultCountry);
        state.country = def.code;
        if (!(def.cities as readonly string[]).includes(state.city)) {
          state.city = def.defaultCity;
        }
      }
    },
  },
});

export const {
  setCountry,
  setCity,
  setLocation,
  setLocationFromStorage,
  setCountryFromRegion,
  setActiveRegions,
} = locationSlice.actions;
export default locationSlice.reducer;
