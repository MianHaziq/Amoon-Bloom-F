import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { AuthSocialButtons } from "@/features/auth/components/AuthSocialButtons";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          Join the boutique
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
          Create your account.
        </h1>
        <p className="text-ink-500">
          Same-day delivery, member-only edits, and a faster checkout.
        </p>
      </header>

      <AuthSocialButtons />
      <RegisterForm />

      <p className="text-center text-sm text-ink-600">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-semibold text-bloom-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
