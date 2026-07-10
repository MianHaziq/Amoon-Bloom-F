"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { overlayBackdrop, drawerPanel } from "@/lib/motion";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useT } from "@/i18n/useT";

type Side = "left" | "right";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: Side;
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Renders outside the scroll area, pinned to the drawer's bottom edge. */
  footer?: ReactNode;
  className?: string;
  width?: string;
}

export function Drawer({
  open,
  onClose,
  side = "right",
  children,
  title,
  description,
  footer,
  className,
  width = "max-w-md",
}: DrawerProps) {
  // Defer portal to a post-mount tick so the server render (null) and the
  // first client render (also null) match — only the second client pass
  // creates the portal and inserts nodes into <body>.
  const mounted = useIsHydrated();
  const { t, dir } = useT();

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handle);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100">
          <m.button
            aria-label={t("common.close")}
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            variants={overlayBackdrop}
            initial="hidden"
            animate="show"
            exit="exit"
          />
          <m.aside
            role="dialog"
            aria-modal="true"
            // Direction-aware slide (RTL-safe): the panel hides toward its own
            // logical edge. Percentage transform stays on the compositor.
            variants={drawerPanel(side, dir)}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              "absolute top-0 flex h-full w-full flex-col bg-white shadow-(--shadow-lift)",
              width,
              // Logical inset so `side` tracks the reading direction: "right" =
              // the inline-end edge (right in LTR, left in RTL); "left" = start.
              side === "right" ? "inset-e-0" : "inset-s-0",
              className
            )}
          >
            {(title || description) && (
          <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
            <div>
              {title && (
                <h3 className="font-display text-xl font-medium text-ink-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-ink-500">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="-m-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-cream-100 hover:text-ink-900"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M6 6 18 18M18 6 6 18" />
              </svg>
            </button>
              </header>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && (
              <div className="shrink-0 border-t border-ink-100 p-4">
                {footer}
              </div>
            )}
          </m.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
