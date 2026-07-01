import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { getServerT } from "@/i18n/server";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage() {
  const { t } = await getServerT();
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          {t("auth.newPasswordEyebrow")}
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
          {t("auth.setNewTitle")}
        </h1>
        <p className="text-ink-500">
          {t("auth.resetSubtitle")}
        </p>
      </header>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
