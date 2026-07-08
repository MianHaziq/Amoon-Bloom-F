"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Input, Textarea } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { regionsApi } from "@/features/regions/api/regions.api";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import { queryKeys } from "@/services/queryKeys";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import type { ApiBroadcastInput } from "@/features/notifications/types";

export function NotificationsBroadcastPage() {
  const toast = useToast();
  const { t } = useT();
  const [pending, setPending] = useState<ApiBroadcastInput | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        kind: z.enum(["announcement", "promotion"]),
        title: z.string().min(1, t("admin.notificationsPage.titleRequired")).max(120),
        body: z.string().min(1, t("admin.notificationsPage.bodyRequired")).max(1000),
        title_ar: z.string().optional(),
        body_ar: z.string().optional(),
        regionId: z.string(),
        dataJson: z.string().optional(),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: "announcement",
      title: "",
      body: "",
      title_ar: "",
      body_ar: "",
      regionId: "",
      dataJson: "",
    },
  });

  const kind = watch("kind");
  const regionId = watch("regionId");

  const mutation = useMutation({
    mutationFn: (payload: ApiBroadcastInput) => notificationsApi.broadcast(payload),
    onSuccess: (res) => {
      toast.success({
        title: t("admin.notificationsPage.toastQueued"),
        description: t("admin.notificationsPage.toastQueuedDescription", {
          jobId: res.jobId,
        }),
      });
      setPending(null);
      reset();
    },
    onError: (err) => toast.fromError(t("admin.notificationsPage.toastSendError"), err),
  });

  // Validate + assemble the payload, then open the confirm dialog. Sending
  // happens only after confirmation since a broadcast reaches many customers.
  const onValid = handleSubmit((v) => {
    let data: Record<string, unknown> | undefined;
    const raw = v.dataJson?.trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("not an object");
        }
        data = parsed as Record<string, unknown>;
      } catch {
        setError("dataJson", {
          message: t("admin.notificationsPage.invalidJsonError"),
        });
        return;
      }
    }

    setPending({
      kind: v.kind,
      title: v.title.trim(),
      body: v.body.trim(),
      title_ar: v.title_ar?.trim() || undefined,
      body_ar: v.body_ar?.trim() || undefined,
      regionId: v.regionId || undefined,
      data,
    });
  });

  const regionLabel = !regionId
    ? t("admin.notificationsPage.allRegionsPhrase")
    : regionsQuery.data?.find((r) => r.id === regionId)?.name ??
      t("admin.notificationsPage.selectedRegionPhrase");

  const audience =
    kind === "promotion"
      ? t("admin.notificationsPage.audiencePromotion")
      : t("admin.notificationsPage.audienceAnnouncement");

  const pendingKindLabel =
    pending?.kind === "promotion"
      ? t("admin.notificationsPage.kindPromotion")
      : t("admin.notificationsPage.kindAnnouncement");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={t("admin.notificationsPage.title")}
        description={t("admin.notificationsPage.description")}
      />

      <form onSubmit={onValid} className="flex flex-col gap-6" noValidate>
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">
            {t("admin.notificationsPage.typeAudienceHeading")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                {t("admin.notificationsPage.typeLabel")}
              </label>
              <select
                {...register("kind")}
                className="block w-full rounded-2xl border border-ink-200 bg-white px-3 py-3 text-base text-ink-900 focus:border-bloom-500 focus:outline-none focus:ring-4 focus:ring-bloom-100"
              >
                <option value="announcement">
                  {t("admin.notificationsPage.typeAnnouncement")}
                </option>
                <option value="promotion">
                  {t("admin.notificationsPage.typePromotion")}
                </option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                {t("admin.notificationsPage.regionFieldLabel")}
              </label>
              <select
                {...register("regionId")}
                className="block w-full rounded-2xl border border-ink-200 bg-white px-3 py-3 text-base text-ink-900 focus:border-bloom-500 focus:outline-none focus:ring-4 focus:ring-bloom-100"
              >
                <option value="">{t("admin.notificationsPage.allRegionsOption")}</option>
                {regionsQuery.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-500">
            {t("admin.notificationsPage.reachSummary", { audience, region: regionLabel })}
          </p>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">
            {t("admin.notificationsPage.messageEnHeading")}
          </h3>
          <Input
            label={t("admin.notificationsPage.titleFieldLabel")}
            placeholder="New arrivals just dropped 🌸"
            error={errors.title?.message}
            {...register("title")}
          />
          <Textarea
            label={t("admin.notificationsPage.bodyFieldLabel")}
            rows={3}
            containerClassName="mt-3"
            placeholder="Explore the latest collection, now in store."
            error={errors.body?.message}
            {...register("body")}
          />
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">
            {t("admin.notificationsPage.messageArHeading")}
          </h3>
          <p className="mb-4 text-xs text-ink-500">
            {t("admin.notificationsPage.messageArHint")}
          </p>
          <Input
            label={t("admin.notificationsPage.titleArFieldLabel")}
            dir="rtl"
            {...register("title_ar")}
          />
          <Textarea
            label={t("admin.notificationsPage.bodyArFieldLabel")}
            rows={3}
            dir="rtl"
            containerClassName="mt-3"
            {...register("body_ar")}
          />
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">
            {t("admin.notificationsPage.deepLinkHeading")}
          </h3>
          <p className="mb-4 text-xs text-ink-500">
            {t("admin.notificationsPage.deepLinkHint")}{" "}
            <code className="rounded bg-cream-100 px-1">{`{"screen":"orders"}`}</code>.
          </p>
          <Textarea
            label={t("admin.notificationsPage.dataPayloadLabel")}
            rows={3}
            placeholder='{"screen":"product","id":"..."}'
            className="font-mono text-sm"
            error={errors.dataJson?.message}
            {...register("dataJson")}
          />
        </section>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            {t("admin.notificationsPage.submitButton")}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(pending)}
        title={t("admin.notificationsPage.confirmTitle")}
        description={t("admin.notificationsPage.confirmDescription", {
          kind: pendingKindLabel,
          audience,
          region: regionLabel,
        })}
        confirmLabel={t("admin.notificationsPage.confirmSendNow")}
        loading={mutation.isPending}
        onConfirm={() => pending && mutation.mutate(pending)}
        onClose={() => setPending(null)}
      />
    </div>
  );
}
