import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark" | "system";
export type Locale = "en" | "ar";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: "default" | "success" | "error" | "warning";
}

export interface UiState {
  theme: Theme;
  locale: Locale;
  isMobileNavOpen: boolean;
  isCartDrawerOpen: boolean;
  /** True while a PDP's mobile sticky add-to-cart bar is mounted, so the
   *  global WhatsApp float button (rendered in the shared layout, with no
   *  DOM relationship to the PDP) can lift itself clear of the bar instead
   *  of overlapping it. */
  isStickyAddToCartMounted: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  theme: "system",
  locale: "en",
  isMobileNavOpen: false,
  isCartDrawerOpen: false,
  isStickyAddToCartMounted: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
    toggleMobileNav(state, action: PayloadAction<boolean | undefined>) {
      state.isMobileNavOpen = action.payload ?? !state.isMobileNavOpen;
    },
    toggleCartDrawer(state, action: PayloadAction<boolean | undefined>) {
      state.isCartDrawerOpen = action.payload ?? !state.isCartDrawerOpen;
    },
    setStickyAddToCartMounted(state, action: PayloadAction<boolean>) {
      state.isStickyAddToCartMounted = action.payload;
    },
    pushToast(state, action: PayloadAction<Omit<Toast, "id"> & { id?: string }>) {
      const id =
        action.payload.id ??
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2));
      state.toasts.push({ ...action.payload, id });
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setTheme,
  setLocale,
  toggleMobileNav,
  toggleCartDrawer,
  setStickyAddToCartMounted,
  pushToast,
  dismissToast,
} = uiSlice.actions;

export default uiSlice.reducer;
