"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui";
import { ArrowRight, MailIcon, UserIcon } from "@/components/icons";
import { registerSchema, type RegisterInput } from "../schemas";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/services/http";

export function RegisterForm() {
  const { signup } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSubmitting(true);
    const trimmed = values.name.trim();
    const [firstName, ...rest] = trimmed.split(/\s+/);
    const lastName = rest.join(" ");
    try {
      const session = await signup({
        email: values.email,
        password: values.password,
        firstName,
        lastName: lastName || firstName,
        name: trimmed,
      });
      toast.success({
        title: "Welcome to Amoon Bloom",
        description: session.user.firstName
          ? `Signed in as ${session.user.firstName}.`
          : undefined,
      });
      router.replace(ROUTES.home);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Sign up failed";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        label="Full name"
        autoComplete="name"
        placeholder="Layla Al Mansouri"
        leadingIcon={<UserIcon size={16} />}
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="layla@example.com"
        leadingIcon={<MailIcon size={16} />}
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint="Use a mix of letters, numbers, and symbols."
        error={errors.password?.message}
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

      <Button
        type="submit"
        size="lg"
        isLoading={submitting}
        trailingIcon={<ArrowRight size={16} />}
      >
        Create account
      </Button>
      <p className="text-center text-xs text-ink-500">
        By creating an account you agree to our{" "}
        <a href="/terms" className="font-medium text-ink-900 hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="font-medium text-ink-900 hover:underline">
          Privacy
        </a>
        .
      </p>
    </form>
  );
}
