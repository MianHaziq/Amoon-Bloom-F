import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { getServerT } from "@/i18n/server";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  const { t } = await getServerT();
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          {t("auth.resetPassword")}
        </p>
        <h1 className="font-display text-3xl font-medium leading-tight text-ink-900 sm:text-4xl md:text-5xl">
          {t("auth.forgotPassword")}
        </h1>
        <p className="text-ink-500">
          {t("auth.forgotSubtitle")}
        </p>
      </header>
      <ForgotPasswordForm />
    </div>
  );
}
