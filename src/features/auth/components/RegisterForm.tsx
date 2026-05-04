"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui";
import { ArrowRight, MailIcon, UserIcon } from "@/components/icons";
import { registerSchema, type RegisterInput } from "../schemas";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/ui.slice";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    dispatch(
      pushToast({
        title: "Welcome to Amoon Bloom",
        description: "Account created — sign in is mocked for now.",
        variant: "success",
      })
    );
    router.push(ROUTES.home);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
