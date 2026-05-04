import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthSession, User } from "@/features/auth/types";

export interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authPending(state) {
      state.status = "loading";
      state.error = null;
    },
    authFulfilled(state, action: PayloadAction<AuthSession>) {
      state.status = "authenticated";
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    authRejected(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
  },
});

export const {
  authPending,
  authFulfilled,
  authRejected,
  logout,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
