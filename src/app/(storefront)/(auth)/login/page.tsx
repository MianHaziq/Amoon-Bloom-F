import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { AuthSocialButtons } from "@/features/auth/components/AuthSocialButtons";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          Welcome back
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
          Sign in to your boutique.
        </h1>
        <p className="text-ink-500">
          Track orders, save favourites, and reorder in one tap.
        </p>
      </header>

      <AuthSocialButtons />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-ink-600">
        New to Amoon Bloom?{" "}
        <Link
          href={ROUTES.register}
          className="font-semibold text-bloom-700 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
