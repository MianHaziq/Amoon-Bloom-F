"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  authFulfilled,
  authPending,
  authRejected,
  logout as logoutAction,
} from "@/store/slices/auth.slice";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storage } from "@/lib/storage";
import { authApi } from "../api/auth.api";
import type { AuthCredentials, RegisterPayload } from "../types";

/**
 * Auth hook — bridges API calls, redux state, and persistent token storage.
 * UI components should never touch the slice or storage directly.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((s) => s.auth);

  const signin = useCallback(
    async (credentials: AuthCredentials) => {
      dispatch(authPending());
      try {
        const session = await authApi.signin(credentials);
        storage.set(STORAGE_KEYS.authToken, session.token);
        dispatch(authFulfilled(session));
        return session;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Sign in failed";
        dispatch(authRejected(message));
        throw e;
      }
    },
    [dispatch]
  );

  const signup = useCallback(
    async (payload: RegisterPayload) => {
      dispatch(authPending());
      try {
        const session = await authApi.signup(payload);
        storage.set(STORAGE_KEYS.authToken, session.token);
        dispatch(authFulfilled(session));
        return session;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Sign up failed";
        dispatch(authRejected(message));
        throw e;
      }
    },
    [dispatch]
  );

  const signOut = useCallback(() => {
    storage.remove(STORAGE_KEYS.authToken);
    dispatch(logoutAction());
  }, [dispatch]);

  return {
    user,
    status,
    error,
    isAuthenticated: status === "authenticated" && Boolean(user),
    signin,
    signup,
    signOut,
  };
}
