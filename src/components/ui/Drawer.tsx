"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type Side = "left" | "right";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: Side;
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
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
  className,
  width = "max-w-md",
}: DrawerProps) {
  // Defer portal to a post-mount tick so the server render (null) and the
  // first client render (also null) match — only the second client pass
  // creates the portal and inserts nodes into <body>.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-100 transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <button
        aria-label="Close panel"
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute top-0 flex h-full w-full flex-col bg-white shadow-(--shadow-lift)",
          width,
          side === "right" ? "right-0" : "left-0",
          "transition-transform duration-400 ease-out-soft",
          open
            ? "translate-x-0"
            : side === "right"
            ? "translate-x-full"
            : "-translate-x-full",
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
              aria-label="Close"
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
      </aside>
    </div>,
    document.body
  );
}
