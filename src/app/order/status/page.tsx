"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Container,
  Section,
  Input,
  Button,
  Card,
} from "@/components/ui";
import {
  ArrowRight,
  TruckIcon,
  CheckCircleIcon,
  SparkleIcon,
} from "@/components/icons";
import { ROUTES } from "@/constants/routes";

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<null | "pending" | "found">(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setStatus("pending");
    setTimeout(() => setStatus("found"), 700);
  };

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
          <form onSubmit={handleLookup} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Input
              label="Order number"
              placeholder="e.g. AMB-2026-12345"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              containerClassName="flex-1"
            />
            <Button
              type="submit"
              size="lg"
              isLoading={status === "pending"}
              trailingIcon={<ArrowRight size={16} />}
            >
              Check status
            </Button>
          </form>

          {status === "found" && (
            <div className="flex flex-col gap-4 rounded-2xl bg-cream-50 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircleIcon size={18} />
                </span>
                <div>
                  <p className="font-display text-lg font-medium text-ink-900">
                    Order {orderId.toUpperCase()} — out for delivery
                  </p>
                  <p className="text-sm text-ink-500">
                    Expected today before 6 PM.
                  </p>
                </div>
              </div>
              <ol className="grid gap-3 sm:grid-cols-3">
                <li className="rounded-xl border border-ink-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-bloom-700">
                    Composed
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm text-ink-700">
                    <SparkleIcon size={14} className="text-bloom-700" />
                    Hand-packed in-studio
                  </p>
                </li>
                <li className="rounded-xl border border-ink-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-bloom-700">
                    Dispatched
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm text-ink-700">
                    <TruckIcon size={14} className="text-bloom-700" />
                    Courier on the way
                  </p>
                </li>
                <li className="rounded-xl border border-ink-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-bloom-700">
                    Delivery
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    Estimated today, before 6 PM
                  </p>
                </li>
              </ol>
            </div>
          )}
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
