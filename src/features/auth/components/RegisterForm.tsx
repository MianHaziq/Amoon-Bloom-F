"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui";
import { ArrowRight, MailIcon, UserIcon } from "@/components/icons";
import { makeRegisterSchema, type RegisterInput } from "../schemas";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/services/http";
import { useT } from "@/i18n/useT";

export function RegisterForm() {
  const { signup } = useAuth();
  const { t } = useT();
  const toast = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const schema = useMemo(() => makeRegisterSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSubmitting(true);
    const trimmed = values.name.trim();
    try {
      const session = await signup({
        email: values.email,
        password: values.password,
        fullName: trimmed,
      });
      toast.success({
        title: t("auth.welcomeToStore"),
        description: session.user.firstName
          ? t("auth.signedInAs", { name: session.user.firstName })
          : undefined,
      });
      router.replace(ROUTES.home);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : t("auth.signupError");
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        label={t("auth.fullName")}
        autoComplete="name"
        placeholder={t("auth.fullNamePlaceholder")}
        leadingIcon={<UserIcon size={16} />}
        error={errors.name?.message}
        {...register("name")}
      />
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
        type="password"
        autoComplete="new-password"
        placeholder={t("auth.passwordPlaceholder")}
        hint={t("auth.passwordHint")}
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
        trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
      >
        {t("auth.createAccount")}
      </Button>
      <p className="text-center text-xs text-ink-500">
        {t("auth.terms")}
      </p>
    </form>
  );
}
