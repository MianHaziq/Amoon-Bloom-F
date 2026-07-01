"use client";

import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export type CheckoutStep = "address" | "payment" | "summary" | "confirmation";

const STEP_ORDER: CheckoutStep[] = ["address", "payment", "summary", "confirmation"];

const STEP_LABEL: Record<CheckoutStep, string> = {
  address: "Address",
  payment: "Payment",
  summary: "Review",
  confirmation: "Confirmed",
};

interface CheckoutStepperProps {
  current: CheckoutStep;
  className?: string;
}

/**
 * Visualises the 4-step checkout flow (mobile spec §3.14). Renders horizontal
 * pills with a connector and a checkmark on completed steps. Each step is
 * non-interactive — navigation between steps lives on the page's Back/Next
 * buttons so we don't accidentally let people jump past validation.
 */
export function CheckoutStepper({ current, className }: CheckoutStepperProps) {
  const currentIdx = STEP_ORDER.indexOf(current);

  return (
    <nav
      aria-label="Checkout progress"
      className={cn("flex w-full items-center", className)}
    >
      <ol className="flex w-full items-center gap-2">
        {STEP_ORDER.map((step, idx) => {
          const completed = idx < currentIdx;
          const active = idx === currentIdx;

          return (
            <li
              key={step}
              className="flex flex-1 items-center gap-2"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors",
                  completed && "bg-bloom-600 text-white",
                  active && "bg-ink-900 text-white",
                  !completed && !active && "bg-cream-100 text-ink-500"
                )}
              >
                {completed ? <CheckIcon size={12} /> : idx + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-medium uppercase tracking-[0.12em] transition-colors",
                  // On mobile only the active step keeps its label so the row
                  // never overflows; all labels show from sm up.
                  active ? "inline" : "hidden sm:inline",
                  (completed || active) ? "text-ink-900" : "text-ink-400"
                )}
              >
                {STEP_LABEL[step]}
              </span>
              {idx < STEP_ORDER.length - 1 ? (
                <span
                  className={cn(
                    "ml-1 h-px flex-1 transition-colors",
                    idx < currentIdx ? "bg-bloom-600" : "bg-ink-100"
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
