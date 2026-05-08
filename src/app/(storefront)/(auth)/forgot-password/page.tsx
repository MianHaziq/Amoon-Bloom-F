import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          Reset password
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
          Forgot password?
        </h1>
        <p className="text-ink-500">
          Enter your email and we&apos;ll send you a link to set a new one.
        </p>
      </header>
      <ForgotPasswordForm />
    </div>
  );
}
