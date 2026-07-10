"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { useAppDispatch, useAppSelector } from "@/store";
import { authFulfilled, logout } from "@/store/slices/auth.slice";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { queryKeys } from "@/services/queryKeys";
import { Spinner } from "@/components/ui/Loader";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

interface AdminShellProps {
  children: ReactNode;
  title?: string;
}

const SIGN_IN_REDIRECT = "/login?next=%2Fadmin";

/**
 * Wraps every `/admin/*` page. Handles three responsibilities:
 *   1. Hydrate auth state from localStorage (token may be set, redux empty
 *      after a fresh page load).
 *   2. Verify the token is still valid + the user is an admin/manager. Bad
 *      tokens get cleared; non-admin users get bounced to /.
 *   3. Render the admin chrome (sidebar + topbar) once auth is settled.
 *
 * Sign-in lives on the storefront `/login` page now — it auto-routes admins
 * and managers to `/admin` after they authenticate.
 */
export function AdminShell({ children, title }: AdminShellProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxToken = useAppSelector((s) => s.auth.token);
  const reduxUser = useAppSelector((s) => s.auth.user);
  const hydrated = useIsHydrated();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const token = reduxToken ?? (hydrated ? storage.get<string>(STORAGE_KEYS.authToken) : null);

  // Validate the token by fetching the profile. Skipped when there's no
  // token (handled by the redirect effect below).
  const profileQuery = useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => authApi.getProfile(),
    enabled: hydrated && Boolean(token) && !reduxUser,
    retry: false,
  });

  // Hydrate redux from a fresh profile fetch.
  useEffect(() => {
    if (profileQuery.data && token) {
      dispatch(authFulfilled({ user: profileQuery.data, token }));
    }
  }, [profileQuery.data, token, dispatch]);

  // Redirects: anonymous → /login?next=/admin; authenticated-but-not-admin → /.
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace(SIGN_IN_REDIRECT);
      return;
    }
    if (profileQuery.isError) {
      storage.remove(STORAGE_KEYS.authToken);
      dispatch(logout());
      router.replace(SIGN_IN_REDIRECT);
      return;
    }
    // Profile resolved but returned nothing — stale or corrupt token.
    if (profileQuery.isSuccess && !profileQuery.data) {
      storage.remove(STORAGE_KEYS.authToken);
      dispatch(logout());
      router.replace(SIGN_IN_REDIRECT);
      return;
    }
    // Non-admin/manager user — bounce to storefront immediately.
    const role = reduxUser?.role;
    if (reduxUser && role !== "ADMIN" && role !== "MANAGER") {
      router.replace("/");
    }
  }, [hydrated, token, profileQuery.isError, profileQuery.isSuccess, profileQuery.data, reduxUser, dispatch, router]);

  // Derived: we know for certain the user is not staff (role resolved, not admin/manager).
  const isDefinitelyUnauthorized =
    hydrated && !!reduxUser && reduxUser.role !== "ADMIN" && reduxUser.role !== "MANAGER";

  const handleOpenMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const handleCloseMobileNav = useCallback(() => setMobileNavOpen(false), []);

  // Pre-hydration or while validating: skeleton.
  const isLoading =
    !hydrated || (!reduxUser && (profileQuery.isPending || profileQuery.isFetching));
  const isAuthorized = reduxUser?.role === "ADMIN" || reduxUser?.role === "MANAGER";

  // Known non-admin: return null immediately — the redirect effect fires in parallel.
  // Prevents admin UI from ever rendering for unauthorized users.
  if (isDefinitelyUnauthorized) return null;

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream-50 font-sans">
      {/* Sticky so the nav stays put while the page content scrolls. */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:flex">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-ink-900/40"
            onClick={handleCloseMobileNav}
          />
          <div className="relative h-full w-64 max-w-[80vw]">
            <AdminSidebar onNavigate={handleCloseMobileNav} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} onOpenMobileNav={handleOpenMobileNav} />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
