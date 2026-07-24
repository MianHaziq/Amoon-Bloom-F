import { isColorGroupTitle, swatchForValue } from "@/features/products/facets";
import { cn } from "@/lib/cn";

/** A stored selection map, keyed by option-group title, e.g. {"Colour":"Pink"}. */
type SelectedOptionsMap = Record<string, string> | null | undefined;

// Legacy guard: a bug once stored selections keyed by the option UUID instead of
// its title. Skip any such entries so old orders don't render a raw UUID label.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Renders a shopper's chosen variant (colour / size / …) as a compact labelled
 * row, with a colour swatch dot when the group is a colour group and its value
 * maps to a known swatch. Shared across the cart, checkout receipt, and the
 * account/admin order views so the selection reads identically everywhere.
 * Renders nothing when there are no meaningful selections.
 */
export function SelectedOptions({
  options,
  className,
}: {
  options: SelectedOptionsMap;
  className?: string;
}) {
  const entries = options
    ? Object.entries(options).filter(
        ([title, value]) => value?.trim() && !UUID_RE.test(title)
      )
    : [];
  if (entries.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      {entries.map(([title, value]) => {
        const isColor = isColorGroupTitle(title);
        const { swatch, needsRing } = isColor
          ? swatchForValue(value)
          : { swatch: undefined, needsRing: false };
        return (
          <span key={title} className="inline-flex items-center gap-1.5 text-xs text-ink-700">
            <span className="font-semibold text-ink-500">{title}:</span>
            {isColor && swatch ? (
              <span
                aria-hidden
                className={cn(
                  "inline-block h-3.5 w-3.5 shrink-0 rounded-full",
                  needsRing && "ring-1 ring-ink-200"
                )}
                style={{ background: swatch }}
              />
            ) : null}
            <span>{value}</span>
          </span>
        );
      })}
    </div>
  );
}
