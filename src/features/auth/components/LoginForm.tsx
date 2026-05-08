"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui";
import { ArrowRight, MailIcon } from "@/components/icons";
import { loginSchema, type LoginInput } from "../schemas";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/services/http";

export function LoginForm() {
  const { signin } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
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
        title: "Welcome back",
        description: session.user.firstName
          ? `Signed in as ${session.user.firstName}.`
          : undefined,
      });
      router.replace(destination);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error && err.message !== "Sign in failed"
          ? err.message
          : "Could not sign in. Please check your details and try again.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
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
        autoComplete="current-password"
        placeholder="••••••••"
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

      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex cursor-pointer items-center gap-2 text-ink-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-ink-300 accent-ink-900"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="font-medium text-bloom-700 hover:underline"
        >
          Forgot password
        </Link>
      </div>
      <Button
        type="submit"
        size="lg"
        isLoading={submitting}
        trailingIcon={<ArrowRight size={16} />}
      >
        Sign in
      </Button>
    </form>
  );
}
