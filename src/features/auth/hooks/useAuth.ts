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

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((s) => s.auth);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      dispatch(authPending());
      try {
        const session = await authApi.login(credentials);
        storage.set(STORAGE_KEYS.authToken, session.token);
        dispatch(authFulfilled(session));
        return session;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Login failed";
        dispatch(authRejected(message));
        throw e;
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      dispatch(authPending());
      try {
        const session = await authApi.register(payload);
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

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      storage.remove(STORAGE_KEYS.authToken);
      dispatch(logoutAction());
    }
  }, [dispatch]);

  return {
    user,
    status,
    error,
    isAuthenticated: status === "authenticated" && Boolean(user),
    login,
    register,
    logout,
  };
}
