"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui";
import { ArrowRight, EyeIcon, EyeOffIcon, MailIcon } from "@/components/icons";
import { makeLoginSchema, type LoginInput } from "../schemas";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/services/http";
import { useT } from "@/i18n/useT";

export function LoginForm() {
  const { signin } = useAuth();
  const { t } = useT();
  const toast = useToast();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const schema = useMemo(() => makeLoginSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSubmitting(true);
    try {
      const session = await signin(values);
      const role = session.user?.role;
      const isStaff = role === "ADMIN" || role === "MANAGER";

      // Resolve destination. An explicit `?next=` wins, except when a
      // customer somehow lands on a /admin next URL — they'd just get
      // bounced back here, so we drop it. Staff with no `next` go to /admin.
      let destination: string;
      if (next && next.startsWith("/")) {
        const nextIsAdmin = next.startsWith("/admin");
        destination = nextIsAdmin && !isStaff ? ROUTES.home : next;
      } else {
        destination = isStaff ? "/admin" : ROUTES.home;
      }

      toast.success({
        title: t("auth.welcomeBack"),
        description: session.user.firstName
          ? t("auth.signedInAs", { name: session.user.firstName })
          : undefined,
      });
      router.replace(destination);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error && err.message !== "Sign in failed"
          ? err.message
          : t("auth.signInError");
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        placeholder="layla@example.com"
        leadingIcon={<MailIcon size={16} />}
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label={t("auth.password")}
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        trailingIcon={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="flex items-center text-ink-400 transition-colors hover:text-ink-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        }
        {...register("password")}
      />

      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700"
        >
          {formError}
        </div>
      ) : null}

      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex cursor-pointer items-center gap-2 text-ink-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-ink-300 accent-ink-900"
          />
          {t("auth.rememberMe")}
        </label>
        <Link
          href="/forgot-password"
          className="font-medium text-bloom-700 hover:underline"
        >
          {t("auth.forgotPassword")}
        </Link>
      </div>
      <Button
        type="submit"
        size="lg"
        isLoading={submitting}
        trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
      >
        {t("auth.signIn")}
      </Button>
    </form>
  );
}
