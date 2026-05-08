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
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (profileQuery.data && token) {
      dispatch(authFulfilled({ user: profileQuery.data, token }));
    }
  }, [profileQuery.data, token, dispatch]);

  useEffect(() => {
    if (profileQuery.isError) {
      storage.remove(STORAGE_KEYS.authToken);
      dispatch(logout());
    }
  }, [profileQuery.isError, dispatch]);

  return null;
}
