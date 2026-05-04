"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui";
import { ArrowRight, MailIcon } from "@/components/icons";
import { loginSchema, type LoginInput } from "../schemas";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/ui.slice";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    dispatch(
      pushToast({
        title: "Welcome back",
        description: "Sign in is mocked for now.",
        variant: "success",
      })
    );
    router.push(ROUTES.home);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
