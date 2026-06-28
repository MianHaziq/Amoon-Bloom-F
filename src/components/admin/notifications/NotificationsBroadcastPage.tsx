"use client";

import { useState } from "react";
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
import type { ApiBroadcastInput } from "@/features/notifications/types";

const schema = z.object({
  kind: z.enum(["announcement", "promotion"]),
  title: z.string().min(1, "Title is required").max(120),
  body: z.string().min(1, "Message is required").max(1000),
  title_ar: z.string().optional(),
  body_ar: z.string().optional(),
  regionId: z.string(),
  dataJson: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NotificationsBroadcastPage() {
  const toast = useToast();
  const [pending, setPending] = useState<ApiBroadcastInput | null>(null);

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
        title: "Broadcast queued",
        description: `Job ${res.jobId} is sending now.`,
      });
      setPending(null);
      reset();
    },
    onError: (err) => toast.fromError("Could not send broadcast", err),
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
          message: "Must be a valid JSON object, e.g. {\"screen\":\"orders\"}",
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
    ? "all regions"
    : regionsQuery.data?.find((r) => r.id === regionId)?.name ?? "selected region";

  const audience =
    kind === "promotion"
      ? "customers who opted into promotional notifications"
      : "customers who opted into announcements";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Send a notification"
        description="Broadcast a push notification to customers. Delivery respects each customer's notification preferences."
      />

      <form onSubmit={onValid} className="flex flex-col gap-6" noValidate>
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">Type & audience</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                Type
              </label>
              <select
                {...register("kind")}
                className="block w-full rounded-2xl border border-ink-200 bg-white px-3 py-3 text-base text-ink-900 focus:border-bloom-500 focus:outline-none focus:ring-4 focus:ring-bloom-100"
              >
                <option value="announcement">Announcement</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                Region
              </label>
              <select
                {...register("regionId")}
                className="block w-full rounded-2xl border border-ink-200 bg-white px-3 py-3 text-base text-ink-900 focus:border-bloom-500 focus:outline-none focus:ring-4 focus:ring-bloom-100"
              >
                <option value="">All regions</option>
                {regionsQuery.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-500">
            This will reach {audience} in {regionLabel}.
          </p>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">Message (English)</h3>
          <Input
            label="Title"
            placeholder="New arrivals just dropped 🌸"
            error={errors.title?.message}
            {...register("title")}
          />
          <Textarea
            label="Body"
            rows={3}
            containerClassName="mt-3"
            placeholder="Explore the latest collection, now in store."
            error={errors.body?.message}
            {...register("body")}
          />
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">Message (Arabic)</h3>
          <p className="mb-4 text-xs text-ink-500">
            Optional. If left blank, Arabic-language customers receive the English
            copy.
          </p>
          <Input label="Title (AR)" dir="rtl" {...register("title_ar")} />
          <Textarea
            label="Body (AR)"
            rows={3}
            dir="rtl"
            containerClassName="mt-3"
            {...register("body_ar")}
          />
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">Deep link (advanced)</h3>
          <p className="mb-4 text-xs text-ink-500">
            Optional JSON object attached to the push for in-app routing, e.g.{" "}
            <code className="rounded bg-cream-100 px-1">{`{"screen":"orders"}`}</code>.
          </p>
          <Textarea
            label="Data payload (JSON)"
            rows={3}
            placeholder='{"screen":"product","id":"..."}'
            className="font-mono text-sm"
            error={errors.dataJson?.message}
            {...register("dataJson")}
          />
        </section>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Review & send
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(pending)}
        title="Send this broadcast?"
        description={`A ${pending?.kind} will be sent to ${audience} in ${regionLabel}. This cannot be undone.`}
        confirmLabel="Send now"
        loading={mutation.isPending}
        onConfirm={() => pending && mutation.mutate(pending)}
        onClose={() => setPending(null)}
      />
    </div>
  );
}
