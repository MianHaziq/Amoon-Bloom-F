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
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
} from "@/components/admin/orders/orderStatus";
import { formatCurrency } from "@/lib/format";

const PROGRESS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const lookup = useMutation({
    mutationFn: (id: string) => ordersApi.getStatus(id),
    onError: (err) => {
      setError(
        err instanceof ApiError ? err.message : "Could not find that order."
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
            Track your order
          </p>
          <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-ink-900 md:text-6xl">
            Order status.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-500">
            Enter the order number from your confirmation email to see where
            your gift is.
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
              label="Order number"
              placeholder="Enter your order ID"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              containerClassName="flex-1"
            />
            <Button
              type="submit"
              size="lg"
              isLoading={lookup.isPending}
              trailingIcon={<ArrowRight size={16} />}
            >
              Check status
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
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircleIcon size={18} />
                  </span>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-ink-500">
                      Order {result.id.slice(0, 8)}
                    </p>
                    <p className="font-display text-lg font-medium text-ink-900">
                      {formatCurrency(result.totalAmount)}
                    </p>
                  </div>
                </div>
                <Badge tone={ORDER_STATUS_TONE[result.status]}>
                  {ORDER_STATUS_LABEL[result.status]}
                </Badge>
              </div>

              {!cancelled ? (
                <div className="grid grid-cols-5 gap-1">
                  {PROGRESS.map((s, i) => {
                    const reached = i <= currentIdx;
                    return (
                      <div key={s} className="flex flex-col items-center gap-1">
                        <div
                          className={
                            "h-1.5 w-full rounded-full " +
                            (reached ? "bg-bloom-500" : "bg-ink-100")
                          }
                        />
                        <span
                          className={
                            "text-[10px] uppercase tracking-wider " +
                            (reached ? "text-bloom-700" : "text-ink-400")
                          }
                        >
                          {ORDER_STATUS_LABEL[s]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-bloom-700">
                  This order was cancelled.
                </p>
              )}
            </div>
          ) : null}
        </Card>

        <p className="mt-6 text-center text-sm text-ink-500">
          Can&rsquo;t find your order?{" "}
          <Link
            href={ROUTES.contact}
            className="font-semibold text-bloom-700 hover:underline"
          >
            Message our concierge
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
