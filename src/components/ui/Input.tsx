import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leadingIcon,
    trailingIcon,
    id,
    className,
    containerClassName,
    ...props
  },
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
      <div
        className={cn(
          "group flex items-center rounded-2xl border bg-white transition-all",
          "focus-within:border-bloom-400 focus-within:ring-4 focus-within:ring-bloom-100",
          error
            ? "border-(--color-danger)"
            : "border-ink-200 hover:border-ink-300"
        )}
      >
        {leadingIcon && (
          <span className="pl-4 text-ink-400">{leadingIcon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            "flex-1 bg-transparent px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none",
            leadingIcon && "pl-2",
            trailingIcon && "pr-2",
            className
          )}
          {...props}
        />
        {trailingIcon && (
          <span className="pr-4 text-ink-400">{trailingIcon}</span>
        )}
      </div>
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
});
