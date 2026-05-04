import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark" | "system";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: "default" | "success" | "error" | "warning";
}

export interface UiState {
  theme: Theme;
  isMobileNavOpen: boolean;
  isCartDrawerOpen: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  theme: "system",
  isMobileNavOpen: false,
  isCartDrawerOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    toggleMobileNav(state, action: PayloadAction<boolean | undefined>) {
      state.isMobileNavOpen = action.payload ?? !state.isMobileNavOpen;
    },
    toggleCartDrawer(state, action: PayloadAction<boolean | undefined>) {
      state.isCartDrawerOpen = action.payload ?? !state.isCartDrawerOpen;
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
  toggleMobileNav,
  toggleCartDrawer,
  pushToast,
  dismissToast,
} = uiSlice.actions;

export default uiSlice.reducer;
