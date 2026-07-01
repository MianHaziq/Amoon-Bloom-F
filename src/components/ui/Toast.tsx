"use client";

import { useEffect } from "react";
import { m, AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/store";
import { dismissToast, type Toast as ToastModel } from "@/store/slices/ui.slice";
import { cn } from "@/lib/cn";
import { baseTransition, microTransition } from "@/lib/motion";
import { useT } from "@/i18n/useT";

const variantStyles: Record<ToastModel["variant"], string> = {
  default: "bg-white border-ink-200 text-ink-900",
  success: "bg-emerald-50 border-emerald-200 text-emerald-900",
  error: "bg-rose-50 border-rose-200 text-rose-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
};

const ICONS: Record<ToastModel["variant"], string> = {
  default: "•",
  success: "✓",
  error: "!",
  warning: "!",
};

function ToastItem({ toast }: { toast: ToastModel }) {
  const dispatch = useAppDispatch();
  const { t } = useT();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), 5000);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <m.div
      role="status"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: baseTransition }}
      exit={{ opacity: 0, y: 8, scale: 0.98, transition: microTransition }}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-(--shadow-lift)",
        variantStyles[toast.variant]
      )}
    >
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-current/10 text-xs font-semibold"
      >
        {ICONS[toast.variant]}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dispatch(dismissToast(toast.id))}
        className="-mt-1 -me-1 rounded-full p-1 text-current/60 hover:bg-current/10"
        aria-label={t("common.dismiss")}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M6 6 18 18M18 6 6 18" />
        </svg>
      </button>
    </m.div>
  );
}

export function ToastViewport() {
  const toasts = useAppSelector((s) => s.ui.toasts);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-4 inset-s-4 inset-e-4 z-200 flex flex-col gap-3 sm:bottom-6 sm:inset-s-auto sm:inset-e-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
