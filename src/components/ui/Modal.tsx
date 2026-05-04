"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-end justify-center sm:items-center"
    >
      <button
        aria-label="Close modal"
        type="button"
        onClick={closeOnBackdropClick ? onClose : undefined}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in"
      />
      <div
        className={cn(
          "relative w-full overflow-hidden bg-white shadow-(--shadow-lift) animate-scale-in",
          "rounded-t-3xl sm:rounded-3xl sm:m-4",
          sizeMap[size],
          className
        )}
      >
        {(title || description) && (
          <div className="border-b border-ink-100 px-6 py-5">
            {title && (
              <h3 className="font-display text-2xl font-medium text-ink-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-ink-500">{description}</p>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
