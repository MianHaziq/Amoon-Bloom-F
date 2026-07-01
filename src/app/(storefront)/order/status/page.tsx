"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Container, Section, Input, Button, Card, Badge } from "@/components/ui";
import { ArrowRight, CheckCircleIcon } from "@/components/icons";
import { ordersApi } from "@/features/orders/api/orders.api";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/services/http";
import {
  ORDER_STATUS_LABEL_KEY,
  ORDER_STATUS_TONE,
} from "@/components/admin/orders/orderStatus";
import { formatCurrency } from "@/lib/format";
import { useT } from "@/i18n/useT";

const PROGRESS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export default function OrderStatusPage() {
  const { t } = useT();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const lookup = useMutation({
    mutationFn: (id: string) => ordersApi.getStatus(id),
    onError: (err) => {
      setError(
        err instanceof ApiError ? err.message : t("order.notFound")
      );
    },
    onSuccess: () => setError(null),
  });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) return;
    lookup.mutate(id);
  };

  const result = lookup.data;
  const currentIdx = result ? (PROGRESS as readonly string[]).indexOf(result.status) : -1;
  const cancelled = result?.status === "CANCELLED";

  return (
    <>
      <section className="bg-cream-50 pt-16 pb-10 lg:pt-24">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {t("order.statusEyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 sm:text-5xl md:text-6xl">
            {t("order.statusTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-500 sm:text-lg">
            {t("order.statusSubtitle")}
          </p>
        </Container>
      </section>

      <Section spacing="md" containerSize="md">
        <Card variant="elevated" padding="lg" className="flex flex-col gap-5">
          <form
            onSubmit={handleLookup}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <Input
              label={t("order.orderNumber")}
              placeholder={t("order.orderIdPlaceholder")}
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              containerClassName="flex-1"
            />
            <Button
              type="submit"
              size="lg"
              isLoading={lookup.isPending}
              trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
            >
              {t("order.checkStatus")}
            </Button>
          </form>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700"
            >
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="flex flex-col gap-4 rounded-2xl bg-cream-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircleIcon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs uppercase tracking-wider text-ink-500">
                      {t("order.orderLabel")} {result.id.slice(0, 8)}
                    </p>
                    <p className="font-display text-lg font-medium text-ink-900">
                      {formatCurrency(result.totalAmount)}
                    </p>
                  </div>
                </div>
                <Badge tone={ORDER_STATUS_TONE[result.status]}>
                  {t(ORDER_STATUS_LABEL_KEY[result.status])}
                </Badge>
              </div>

              {!cancelled ? (
                <div className="grid grid-cols-5 gap-1">
                  {PROGRESS.map((s, i) => {
                    const reached = i <= currentIdx;
                    return (
                      <div key={s} className="flex min-w-0 flex-col items-center gap-1">
                        <div
                          className={
                            "h-1.5 w-full rounded-full " +
                            (reached ? "bg-bloom-500" : "bg-ink-100")
                          }
                        />
                        <span
                          className={
                            "hyphens-auto wrap-break-word text-center text-[9px] uppercase tracking-tight sm:text-[10px] sm:tracking-wider " +
                            (reached ? "text-bloom-700" : "text-ink-400")
                          }
                        >
                          {t(ORDER_STATUS_LABEL_KEY[s])}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-bloom-700">
                  {t("order.cancelledNote")}
                </p>
              )}
            </div>
          ) : null}
        </Card>

        <p className="mt-6 text-center text-sm text-ink-500">
          {t("order.cantFind")}{" "}
          <Link
            href={ROUTES.contact}
            className="font-semibold text-bloom-700 hover:underline"
          >
            {t("order.messageConcierge")}
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
