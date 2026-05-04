import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import cartReducer from "./slices/cart.slice";
import uiReducer from "./slices/ui.slice";

export const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  ui: uiReducer,
});

export type RootReducer = typeof rootReducer;
