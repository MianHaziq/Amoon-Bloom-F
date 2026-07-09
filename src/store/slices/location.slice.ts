import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_COUNTRY, getCountry, type CountryCode } from "@/features/location/data";

export interface LocationState {
  country: CountryCode;
  city: string;
  /**
   * `true` once the user has explicitly picked a country/city. Defaults stay
   * "soft" so the storefront can render server-side without forcing onboarding.
   */
  hasChosen: boolean;
}

const fallback = getCountry(DEFAULT_COUNTRY);
const initialState: LocationState = {
  country: DEFAULT_COUNTRY,
  city: fallback.defaultCity,
  hasChosen: false,
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
  },
});

export const {
  setCountry,
  setCity,
  setLocation,
  setLocationFromStorage,
  setCountryFromRegion,
} = locationSlice.actions;
export default locationSlice.reducer;
