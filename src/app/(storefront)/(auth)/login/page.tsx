import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { AuthSocialButtons } from "@/features/auth/components/AuthSocialButtons";
import { ROUTES } from "@/constants/routes";
import { getServerT } from "@/i18n/server";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const { t } = await getServerT();
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          {t("auth.welcomeBack")}
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
          {t("auth.signInSubtitle")}
        </h1>
        <p className="text-ink-500">
          {t("auth.loginPerks")}
        </p>
      </header>

      <Suspense fallback={null}>
        <AuthSocialButtons />
      </Suspense>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-ink-600">
        {t("auth.newToStore")}{" "}
        <Link
          href={ROUTES.register}
          className="font-semibold text-bloom-700 hover:underline"
        >
          {t("auth.createAccount")}
        </Link>
      </p>
    </div>
  );
}
