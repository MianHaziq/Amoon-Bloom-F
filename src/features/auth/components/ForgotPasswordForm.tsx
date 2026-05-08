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

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
        err instanceof ApiError ? err.message : "Could not send reset email";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  });

  if (done) {
    return (
      <div className="flex flex-col items-start gap-3">
        <CheckCircleIcon size={24} className="text-(--color-success)" />
        <h2 className="font-display text-2xl text-ink-900">Check your email</h2>
        <p className="text-sm text-ink-500">
          If an account exists for that email, we&apos;ve sent a password
          reset link. The link expires in 30 minutes.
        </p>
        <Link
          href="/login"
          className="mt-2 text-sm font-medium text-bloom-700 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        label="Email"
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
        trailingIcon={<ArrowRight size={16} />}
      >
        Send reset link
      </Button>
      <p className="text-center text-sm text-ink-500">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-bloom-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
