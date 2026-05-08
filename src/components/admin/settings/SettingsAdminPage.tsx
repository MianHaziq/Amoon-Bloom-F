"use client";

import { useEffect } from "react";
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

const schema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  logo: z.string().url().nullable(),
  contactEmail: z.string().email("Enter a valid email").or(z.literal("")).nullable(),
  supportEmail: z.string().email("Enter a valid email").or(z.literal("")).nullable(),
  currency: z.string().min(3, "ISO currency code, e.g. USD"),
  maintenanceMode: z.boolean(),
  hiddenPagesText: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function SettingsAdminPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

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
      hiddenPagesText: (s.hiddenPages ?? []).join("\n"),
    });
  }, [settingsQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      toast.success({ title: "Settings saved" });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
    onError: (err) => toast.fromError("Could not save settings", err),
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
      hiddenPages,
    });
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Settings"
        description="Site-wide configuration."
        actions={
          isDirty ? (
            <Button onClick={submit} isLoading={updateMutation.isPending}>
              Save changes
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
          Could not load settings.
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="mb-4 font-display text-lg text-ink-900">Brand</h3>
              <Input
                label="Site name"
                error={errors.siteName?.message}
                {...register("siteName")}
              />
            </section>

            <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="mb-4 font-display text-lg text-ink-900">Contact</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Contact email"
                  type="email"
                  error={errors.contactEmail?.message}
                  {...register("contactEmail")}
                />
                <Input
                  label="Support email"
                  type="email"
                  error={errors.supportEmail?.message}
                  {...register("supportEmail")}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="mb-4 font-display text-lg text-ink-900">Storefront</h3>
              <Input
                label="Currency"
                hint="ISO 4217 code, e.g. USD, AED, EUR"
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
                      Maintenance mode
                    </span>
                    <span className="block text-xs text-ink-500">
                      Show a holding page on the storefront.
                    </span>
                  </span>
                </label>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                  Hidden pages
                </label>
                <textarea
                  rows={4}
                  placeholder="One path per line, e.g. /branches"
                  {...register("hiddenPagesText")}
                  className="block w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100"
                />
                <p className="mt-1 text-xs text-ink-500">
                  Hidden routes won&apos;t render in the storefront navigation.
                </p>
              </div>
            </section>
          </div>

          <aside>
            <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="mb-4 font-display text-lg text-ink-900">Logo</h3>
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
              Save changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
