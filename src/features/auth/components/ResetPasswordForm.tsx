"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { ArrowRight, CheckCircleIcon } from "@/components/icons";
import { authApi } from "../api/auth.api";
import { ApiError } from "@/services/http";

const schema = z
  .object({
    newPassword: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") ?? "";
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    token ? null : "Missing or invalid reset token. Please request a new email."
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await authApi.resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => router.replace("/login"), 1500);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Could not reset password"
      );
    } finally {
      setSubmitting(false);
    }
  });

  if (done) {
    return (
      <div className="flex flex-col items-start gap-3">
        <CheckCircleIcon size={24} className="text-(--color-success)" />
        <h2 className="font-display text-2xl text-ink-900">Password reset</h2>
        <p className="text-sm text-ink-500">
          You can now sign in with your new password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.newPassword?.message}
        disabled={!token}
        {...register("newPassword")}
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirm?.message}
        disabled={!token}
        {...register("confirm")}
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
        disabled={!token}
        trailingIcon={<ArrowRight size={16} />}
      >
        Reset password
      </Button>
      <p className="text-center text-sm text-ink-500">
        <Link href="/login" className="font-medium text-bloom-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
