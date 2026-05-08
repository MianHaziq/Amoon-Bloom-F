"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store";
import { authFulfilled, authPending, authRejected } from "@/store/slices/auth.slice";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { authApi } from "../api/auth.api";
import { env } from "@/config/env";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/services/http";
import { ROUTES } from "@/constants/routes";

const GIS_SCRIPT = "https://accounts.google.com/gsi/client";
const APPLE_SCRIPT =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

interface GoogleCredentialResponse {
  credential: string;
}
interface GoogleAccountsId {
  initialize(opts: {
    client_id: string;
    callback: (res: GoogleCredentialResponse) => void;
  }): void;
  prompt(): void;
}
interface GoogleNamespace {
  accounts: { id: GoogleAccountsId };
}

interface AppleAuthorization {
  authorization: { id_token: string };
  user?: {
    name?: { firstName?: string; lastName?: string };
    email?: string;
  };
}
interface AppleIDAuth {
  init(opts: {
    clientId: string;
    scope: string;
    redirectURI: string;
    usePopup: boolean;
  }): void;
  signIn(): Promise<AppleAuthorization>;
}
interface AppleIDNamespace {
  auth: AppleIDAuth;
}

declare global {
  interface Window {
    google?: GoogleNamespace;
    AppleID?: AppleIDNamespace;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("loadScript called outside browser"));
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed to load ${src}`)),
        { once: true }
      );
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );
    script.addEventListener(
      "error",
      () => reject(new Error(`Failed to load ${src}`)),
      { once: true }
    );
    document.head.appendChild(script);
  });
}

/**
 * Bridges Google Identity Services / Apple ID JS to our `authApi.google` and
 * `authApi.apple` endpoints. Click `signInWithGoogle` or `signInWithApple` to
 * trigger the flow. Provider scripts load on demand. If the matching client
 * ID env var is unset, the call short-circuits with an info toast — the
 * buttons stay safe to mount before the credentials exist.
 */
export function useOAuthSignIn() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const router = useRouter();
  const search = useSearchParams();
  const [pending, setPending] = useState<null | "google" | "apple">(null);

  const next = search.get("next");
  const resolveDestination = useCallback(
    (role: string | undefined) => {
      const isStaff = role === "ADMIN" || role === "MANAGER";
      if (next && next.startsWith("/")) {
        const nextIsAdmin = next.startsWith("/admin");
        return nextIsAdmin && !isStaff ? ROUTES.home : next;
      }
      return isStaff ? "/admin" : ROUTES.home;
    },
    [next]
  );

  const handleSession = useCallback(
    (
      session: Awaited<ReturnType<typeof authApi.google>>,
      providerLabel: string
    ) => {
      storage.set(STORAGE_KEYS.authToken, session.token);
      dispatch(authFulfilled(session));
      toast.success({
        title: `Signed in with ${providerLabel}`,
        description: session.user?.firstName
          ? `Welcome, ${session.user.firstName}.`
          : undefined,
      });
      router.replace(resolveDestination(session.user?.role));
    },
    [dispatch, toast, router, resolveDestination]
  );

  const surfaceError = useCallback(
    (providerLabel: string, err: unknown) => {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : `Could not sign in with ${providerLabel}.`;
      dispatch(authRejected(message));
      toast.error({ title: `${providerLabel} sign-in failed`, description: message });
    },
    [dispatch, toast]
  );

  const signInWithGoogle = useCallback(async () => {
    const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.info({
        title: "Google sign-in unavailable",
        description: "Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable this option.",
      });
      return;
    }
    setPending("google");
    dispatch(authPending());
    try {
      await loadScript(GIS_SCRIPT);
      const gis = window.google?.accounts.id;
      if (!gis) throw new Error("Google Identity Services failed to load");

      const credential = await new Promise<string>((resolve, reject) => {
        try {
          gis.initialize({
            client_id: clientId,
            callback: (res) => {
              if (res?.credential) resolve(res.credential);
              else reject(new Error("Google did not return a credential"));
            },
          });
          gis.prompt();
        } catch (e) {
          reject(e);
        }
      });

      const session = await authApi.google(credential);
      handleSession(session, "Google");
    } catch (err) {
      surfaceError("Google", err);
    } finally {
      setPending(null);
    }
  }, [dispatch, toast, handleSession, surfaceError]);

  const signInWithApple = useCallback(async () => {
    const clientId = env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    const redirectUri = env.NEXT_PUBLIC_APPLE_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      toast.info({
        title: "Apple sign-in unavailable",
        description:
          "Set NEXT_PUBLIC_APPLE_CLIENT_ID and NEXT_PUBLIC_APPLE_REDIRECT_URI to enable this option.",
      });
      return;
    }
    setPending("apple");
    dispatch(authPending());
    try {
      await loadScript(APPLE_SCRIPT);
      const apple = window.AppleID?.auth;
      if (!apple) throw new Error("Apple ID JS failed to load");

      apple.init({
        clientId,
        scope: "name email",
        redirectURI: redirectUri,
        usePopup: true,
      });

      const result = await apple.signIn();
      const idToken = result.authorization?.id_token;
      if (!idToken) throw new Error("Apple did not return an identity token");

      const session = await authApi.apple(idToken, {
        firstName: result.user?.name?.firstName,
        lastName: result.user?.name?.lastName,
        email: result.user?.email,
      });
      handleSession(session, "Apple");
    } catch (err) {
      // Apple emits `popup_closed_by_user` on cancel — silence that.
      const code =
        err && typeof err === "object" && "error" in err
          ? (err as { error?: string }).error
          : undefined;
      if (code === "popup_closed_by_user") {
        toast.info({ title: "Apple sign-in cancelled" });
      } else {
        surfaceError("Apple", err);
      }
    } finally {
      setPending(null);
    }
  }, [dispatch, toast, handleSession, surfaceError]);

  return { signInWithGoogle, signInWithApple, pending };
}
