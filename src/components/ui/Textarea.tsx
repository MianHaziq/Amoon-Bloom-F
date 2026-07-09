"use client";

import { forwardRef, useId, useRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
  /**
   * Grows to fit its content (up to `maxHeight`) instead of a small fixed box
   * with its own internal scrollbar — the pattern most text editors (Notion,
   * Linear, GitHub) use so long content is readable without extra scrolling.
   * Set to `false` to keep the old fixed-size, manually-resizable box.
   */
  autoGrow?: boolean;
  /** Px height `autoGrow` caps out at before handing off to a normal scrollbar. */
  maxHeight?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      hint,
      error,
      id,
      className,
      containerClassName,
      autoGrow = true,
      maxHeight = 480,
      onInput,
      rows = 4,
      ...props
    },
    forwardedRef
  ) {
    const reactId = useId();
    const inputId = id ?? reactId;
    const describedBy = error
      ? `${inputId}-error`
      : hint
      ? `${inputId}-hint`
      : undefined;

    const resize = (el: HTMLTextAreaElement | null) => {
      if (!el || !autoGrow) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    };

    const localRef = useRef<HTMLTextAreaElement | null>(null);
    const setRefs = (el: HTMLTextAreaElement | null) => {
      localRef.current = el;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
      // Runs once on mount — by the time a field backed by react-hook-form's
      // `useFieldArray` first renders, its value (e.g. an existing product's
      // long description) is already populated, so this correctly sizes to
      // real content instead of the empty initial value.
      resize(el);
    };

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={inputId}
          rows={rows}
          onInput={(e) => {
            resize(e.currentTarget);
            onInput?.(e);
          }}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-h-28 rounded-2xl border bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 transition-all",
            autoGrow ? "resize-none overflow-y-auto" : "resize-y",
            "focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100",
            error
              ? "border-(--color-danger)"
              : "border-ink-200 hover:border-ink-300",
            className
          )}
          style={autoGrow ? { maxHeight } : undefined}
          {...props}
        />
        {error ? (
          <p
            id={`${inputId}-error`}
            className="text-xs text-(--color-danger)"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-ink-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
