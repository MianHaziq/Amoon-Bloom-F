"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { Spinner } from "@/components/ui/Loader";
import { useIsHydrated } from "@/hooks/useIsHydrated";

/**
 * Client-side guard for `/account/*` routes. Waits for the storefront's
 * `<AuthHydrator>` to populate redux, then redirects unauthenticated users
 * to `/login?next=...` so they can return after signing in.
 */
export function AccountGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useIsHydrated();

  const token = hydrated ? storage.get<string>(STORAGE_KEYS.authToken) : null;

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      const next = encodeURIComponent(pathname || "/account");
      router.replace(`/login?next=${next}`);
    }
  }, [hydrated, token, pathname, router]);

  if (!hydrated || !token || (token && !user)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
