"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/features/settings/api/settings.api";
import { queryKeys } from "@/services/queryKeys";
import { Button, Input } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Spinner } from "@/components/ui/Loader";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function SettingsAdminPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const schema = useMemo(
    () =>
      z.object({
        siteName: z.string().min(1, t("admin.settingsPage.siteNameRequired")),
        logo: z.string().url().nullable(),
        contactEmail: z
          .string()
          .email(t("admin.settingsPage.emailInvalid"))
          .or(z.literal(""))
          .nullable(),
        supportEmail: z
          .string()
          .email(t("admin.settingsPage.emailInvalid"))
          .or(z.literal(""))
          .nullable(),
        currency: z.string().min(3, t("admin.settingsPage.currencyRequired")),
        maintenanceMode: z.boolean(),
        allowGuestReviews: z.boolean(),
        hiddenPagesText: z.string(),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.admin(),
    queryFn: () => settingsApi.get(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      siteName: "",
      logo: null,
      contactEmail: "",
      supportEmail: "",
      currency: "USD",
      maintenanceMode: false,
      allowGuestReviews: true,
      hiddenPagesText: "",
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) return;
    const s = settingsQuery.data;
    reset({
      siteName: s.siteName,
      logo: s.logo,
      contactEmail: s.contactEmail ?? "",
      supportEmail: s.supportEmail ?? "",
      currency: s.currency,
      maintenanceMode: s.maintenanceMode,
      allowGuestReviews: s.allowGuestReviews,
      hiddenPagesText: (s.hiddenPages ?? []).join("\n"),
    });
  }, [settingsQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      toast.success({ title: t("admin.settingsPage.toastSaved") });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
    onError: (err) => toast.fromError(t("admin.settingsPage.toastSaveError"), err),
  });

  const submit = handleSubmit(async (v) => {
    const hiddenPages = v.hiddenPagesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    await updateMutation.mutateAsync({
      siteName: v.siteName,
      logo: v.logo,
      contactEmail: v.contactEmail || null,
      supportEmail: v.supportEmail || null,
      currency: v.currency,
      maintenanceMode: v.maintenanceMode,
      allowGuestReviews: v.allowGuestReviews,
      hiddenPages,
    });
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t("admin.settingsPage.title")}
        description={t("admin.settingsPage.description")}
        actions={
          isDirty ? (
            <Button onClick={submit} isLoading={updateMutation.isPending}>
              {t("admin.common.saveChanges")}
            </Button>
          ) : null
        }
      />

      {settingsQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : settingsQuery.isError ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          {t("admin.settingsPage.loadError")}
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="mb-4 font-display text-lg text-ink-900">
                {t("admin.settingsPage.brandHeading")}
              </h3>
              <Input
                label={t("admin.settingsPage.siteNameLabel")}
                error={errors.siteName?.message}
                {...register("siteName")}
              />
            </section>

            <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="mb-4 font-display text-lg text-ink-900">
                {t("admin.settingsPage.contactHeading")}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t("admin.settingsPage.contactEmailLabel")}
                  type="email"
                  error={errors.contactEmail?.message}
                  {...register("contactEmail")}
                />
                <Input
                  label={t("admin.settingsPage.supportEmailLabel")}
                  type="email"
                  error={errors.supportEmail?.message}
                  {...register("supportEmail")}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="mb-4 font-display text-lg text-ink-900">
                {t("admin.settingsPage.storefrontHeading")}
              </h3>
              <Input
                label={t("admin.settingsPage.currencyLabel")}
                hint={t("admin.settingsPage.currencyHint")}
                error={errors.currency?.message}
                {...register("currency")}
              />
              <div className="mt-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("maintenanceMode")}
                    className="h-5 w-5 accent-bloom-600"
                  />
                  <span>
                    <span className="text-sm font-medium text-ink-900">
                      {t("admin.settingsPage.maintenanceModeLabel")}
                    </span>
                    <span className="block text-xs text-ink-500">
                      {t("admin.settingsPage.maintenanceModeHint")}
                    </span>
                  </span>
                </label>
              </div>
              <div className="mt-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("allowGuestReviews")}
                    className="h-5 w-5 accent-bloom-600"
                  />
                  <span>
                    <span className="text-sm font-medium text-ink-900">
                      {t("admin.settingsPage.allowGuestReviewsLabel")}
                    </span>
                    <span className="block text-xs text-ink-500">
                      {t("admin.settingsPage.allowGuestReviewsHint")}
                    </span>
                  </span>
                </label>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                  {t("admin.settingsPage.hiddenPagesLabel")}
                </label>
                <textarea
                  rows={4}
                  placeholder={t("admin.settingsPage.hiddenPagesPlaceholder")}
                  {...register("hiddenPagesText")}
                  className="block w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100"
                />
                <p className="mt-1 text-xs text-ink-500">
                  {t("admin.settingsPage.hiddenPagesHint")}
                </p>
              </div>
            </section>
          </div>

          <aside>
            <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="mb-4 font-display text-lg text-ink-900">
                {t("admin.settingsPage.logoHeading")}
              </h3>
              <Controller
                control={control}
                name="logo"
                render={({ field }) => (
                  <ImageUpload value={field.value} onChange={field.onChange} path="uploads" label="" />
                )}
              />
            </section>
          </aside>

          <div className="lg:col-span-2 flex justify-end">
            <Button type="submit" size="lg" isLoading={updateMutation.isPending}>
              {t("admin.common.saveChanges")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
