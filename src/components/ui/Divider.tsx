import { cn } from "@/lib/cn";

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (!label) {
    return (
      <hr
        className={cn(
          "border-0 border-t border-ink-100",
          className
        )}
      />
    );
  }
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="h-px flex-1 bg-ink-100" />
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
        {label}
      </span>
      <span className="h-px flex-1 bg-ink-100" />
    </div>
  );
}
