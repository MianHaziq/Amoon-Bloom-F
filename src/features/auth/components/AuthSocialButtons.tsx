"use client";

import { Button, Divider } from "@/components/ui";
import { useOAuthSignIn } from "../hooks/useOAuthSignIn";
import { useT } from "@/i18n/useT";

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 1 0 24 44c11 0 19.6-8 19.6-20 0-1.2-.1-2.4-.4-3.5Z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 0 0 6.3 14.7Z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44Z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.4-4.2 5.7l6.2 5.2C40.8 36.4 44 30.7 44 24c0-1.2-.1-2.4-.4-3.5Z"
    />
  </svg>
);

const AppleMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.4 12.7c0-2.4 2-3.6 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.1-2.8.9-3.6.9s-1.9-.8-3.1-.8c-1.6 0-3 .9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.2 1.7 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.1.8 2.2-1.2 3-2.4c.5-.7.9-1.4 1.2-2.2-.2-.1-2.6-1-2.6-4Zm-2.5-7.9c.7-.8 1.2-2 1-3.1-1 .1-2.2.7-2.9 1.6-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.5Z" />
  </svg>
);

export function AuthSocialButtons() {
  const { signInWithGoogle, signInWithApple, pending } = useOAuthSignIn();
  const { t } = useT();

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          leadingIcon={<GoogleMark />}
          onClick={signInWithGoogle}
          isLoading={pending === "google"}
          disabled={pending !== null}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          leadingIcon={<AppleMark />}
          onClick={signInWithApple}
          isLoading={pending === "apple"}
          disabled={pending !== null}
        >
          Apple
        </Button>
      </div>
      <Divider label={t("auth.orWithEmail")} />
    </div>
  );
}
