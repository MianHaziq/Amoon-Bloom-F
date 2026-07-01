"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { ArrowRight, CheckCircleIcon, MailIcon } from "@/components/icons";
import { authApi } from "../api/auth.api";
import { ApiError } from "@/services/http";
import { useT } from "@/i18n/useT";
import { useMemo } from "react";

type Values = { email: string };

export function ForgotPasswordForm() {
  const { t } = useT();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("validation.email")),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await authApi.forgotPassword(email);
      setDone(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t("auth.sendError");
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  });

  if (done) {
    return (
      <div className="flex flex-col items-start gap-3">
        <CheckCircleIcon size={24} className="text-(--color-success)" />
        <h2 className="font-display text-2xl text-ink-900">{t("auth.checkEmailTitle")}</h2>
        <p className="text-sm text-ink-500">
          {t("auth.checkEmailBody")}
        </p>
        <Link
          href="/login"
          className="mt-2 text-sm font-medium text-bloom-700 hover:underline"
        >
          {t("auth.backToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        leadingIcon={<MailIcon size={16} />}
        placeholder="layla@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700"
        >
          {formError}
        </div>
      ) : null}
      <Button
        type="submit"
        size="lg"
        isLoading={submitting}
        trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
      >
        {t("auth.sendResetLink")}
      </Button>
      <p className="text-center text-sm text-ink-500">
        {t("auth.rememberedIt")}{" "}
        <Link href="/login" className="font-medium text-bloom-700 hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </form>
  );
}
