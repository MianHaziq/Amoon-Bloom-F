import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, hint, error, id, className, containerClassName, ...props },
    ref
  ) {
    const reactId = useId();
    const inputId = id ?? reactId;
    const describedBy = error
      ? `${inputId}-error`
      : hint
      ? `${inputId}-hint`
      : undefined;

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
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-h-28 resize-y rounded-2xl border bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 transition-all",
            "focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100",
            error
              ? "border-(--color-danger)"
              : "border-ink-200 hover:border-ink-300",
            className
          )}
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
