"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { overlayBackdrop, dialogPanel } from "@/lib/motion";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useT } from "@/i18n/useT";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md" | "lg";
  closeOnBackdropClick?: boolean;
  className?: string;
}

const sizeMap: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  size = "md",
  closeOnBackdropClick = true,
  className,
}: ModalProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  // Mount-gate the portal so SSR (null) and the first client render (null)
  // agree, avoiding the body-portal hydration mismatch.
  const mounted = useIsHydrated();
  const { t } = useT();

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  // Keep mounted while closing so AnimatePresence can play the exit; the portal
  // itself is gated only on hydration.
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-100 flex items-end justify-center sm:items-center"
        >
          <m.button
            aria-label={t("common.close")}
            type="button"
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            variants={overlayBackdrop}
            initial="hidden"
            animate="show"
            exit="exit"
          />
          <m.div
            variants={dialogPanel}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              "relative flex max-h-[90dvh] w-full flex-col overflow-hidden bg-white shadow-(--shadow-lift)",
              "rounded-t-3xl sm:m-4 sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl",
              sizeMap[size],
              className
            )}
          >
            {(title || description) && (
              <div className="border-b border-ink-100 px-6 py-5">
                {title && (
                  <h3 className="font-display text-xl font-medium text-ink-900 sm:text-2xl">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="mt-1 text-sm text-ink-500">{description}</p>
                )}
              </div>
            )}
            <div className="overflow-y-auto px-6 py-5">{children}</div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
