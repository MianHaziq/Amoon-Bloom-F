import { Suspense } from "react";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { AuthSocialButtons } from "@/features/auth/components/AuthSocialButtons";
import { ROUTES } from "@/constants/routes";
import { getServerT } from "@/i18n/server";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const { t } = await getServerT();
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          {t("auth.joinTitle")}
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
          {t("auth.createSubtitle")}
        </h1>
        <p className="text-ink-500">
          {t("auth.registerPerks")}
        </p>
      </header>

      <Suspense fallback={null}>
        <AuthSocialButtons />
      </Suspense>
      <RegisterForm />

      <p className="text-center text-sm text-ink-600">
        {t("auth.haveAccount")}{" "}
        <Link
          href={ROUTES.login}
          className="font-semibold text-bloom-700 hover:underline"
        >
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  );
}
