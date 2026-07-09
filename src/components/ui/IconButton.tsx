import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "ghost" | "subtle" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variantMap = {
  ghost: "text-ink-700 hover:bg-bloom-600 hover:text-white",
  subtle: "bg-ink-50 text-ink-900 hover:bg-bloom-600 hover:text-white",
  outline:
    "border border-ink-200 text-ink-700 hover:border-bloom-600 hover:bg-bloom-600 hover:text-white",
} as const;

const sizeMap = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      variant = "ghost",
      size = "md",
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
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
          variantMap[variant],
          sizeMap[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
