import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import cartReducer from "./slices/cart.slice";
import locationReducer from "./slices/location.slice";
import uiReducer from "./slices/ui.slice";
import wishlistReducer from "./slices/wishlist.slice";

export const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  location: locationReducer,
  ui: uiReducer,
  wishlist: wishlistReducer,
});

export type RootReducer = typeof rootReducer;
