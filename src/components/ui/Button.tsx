import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg" | "xl" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-bloom-600 text-white hover:bg-bloom-700 active:bg-bloom-800 shadow-(--shadow-bloom) hover:shadow-(--shadow-lift)",
  secondary:
    "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-700",
  outline:
    "border border-ink-200 bg-transparent text-ink-900 hover:bg-cream-100 hover:border-ink-300",
  ghost:
    "bg-transparent text-ink-900 hover:bg-cream-100",
  subtle:
    "bg-cream-100 text-ink-900 hover:bg-cream-200",
  danger:
    "bg-(--color-danger) text-white hover:opacity-90",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  xl: "h-14 px-8 text-base gap-2.5",
  icon: "h-10 w-10",
};

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      isLoading,
      leadingIcon,
      trailingIcon,
      fullWidth,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(
          "group relative inline-flex items-center justify-center rounded-full font-medium tracking-tight transition-all duration-200 ease-out-soft",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner />
        ) : (
          leadingIcon && <span className="shrink-0">{leadingIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && trailingIcon && (
          <span className="shrink-0 transition-transform ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
            {trailingIcon}
          </span>
        )}
      </button>
    );
  }
);
