"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { queryKeys } from "@/services/queryKeys";
import { useAppDispatch, useAppSelector } from "@/store";
import { authFulfilled, logout } from "@/store/slices/auth.slice";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";

/**
 * On mount, restores the auth session from a stored token by re-fetching the
 * profile. Renders nothing. Mount once at a layout root.
 *
 * Why not redux-persist: we want the token to remain authoritative (it's all
 * the backend trusts), and we want to validate that the token still works on
 * every fresh page load — a stored Redux blob could be stale or for a deleted
 * user.
 */
export function AuthHydrator() {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((s) => s.auth.user);

  // Token from storage; only run query if we have one and no in-memory user.
  const token =
    typeof window === "undefined"
      ? null
      : storage.get<string>(STORAGE_KEYS.authToken);

  const profileQuery = useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => authApi.getProfile(),
    enabled: Boolean(token) && !reduxUser,
    // Retry transient failures (network blip, aborted request during a dev
    // StrictMode remount), but fail fast on a definitive token rejection.
    retry: (count, err) => {
      const status = (err as { status?: number } | null)?.status;
      if (status === 401 || status === 403) return false;
      return count < 2;
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (profileQuery.data && token) {
      dispatch(authFulfilled({ user: profileQuery.data, token }));
    }
  }, [profileQuery.data, token, dispatch]);

  useEffect(() => {
    // Only tear down the session when the SERVER definitively rejects the token
    // (401/403) AND nobody is currently signed in. A transient/aborted error — common
    // in dev under React StrictMode, or on a brief network hiccup — must NEVER wipe a
    // valid or freshly-logged-in session. Previously this fired on *any* error and
    // removed the just-stored token, logging admins out right after login.
    if (!profileQuery.isError || reduxUser) return;
    const status = (profileQuery.error as { status?: number } | null)?.status;
    if (status === 401 || status === 403) {
      storage.remove(STORAGE_KEYS.authToken);
      dispatch(logout());
    }
  }, [profileQuery.isError, profileQuery.error, reduxUser, dispatch]);

  return null;
}
