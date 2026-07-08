"use client";

import { useQuery } from "@tanstack/react-query";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { cn } from "@/lib/cn";

interface RegionPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  hint?: string;
}

/**
 * Region visibility checkboxes shared by Product/Category/Section/Promo-code
 * forms. An empty selection is valid — the backend defaults it to the default
 * region (UAE) on create — so this never forces a choice.
 */
export function RegionPicker({
  selectedIds,
  onChange,
  label = "Show in regions",
  hint = "Leave unchecked to default to UAE only. Check both to sell in UAE and Saudi Arabia.",
}: RegionPickerProps) {
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
        {label}
      </label>
      {regionsQuery.isPending ? (
        <p className="text-sm text-ink-400">Loading regions…</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {(regionsQuery.data ?? []).map((r) => {
            const checked = selectedIds.includes(r.id);
            return (
              <label
                key={r.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                  checked
                    ? "border-bloom-300 bg-bloom-50 text-bloom-800"
                    : "border-ink-200 hover:bg-cream-50"
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(r.id)}
                    className="shrink-0 accent-bloom-600"
                  />
                  {r.name}
                  {r.isDefault ? (
                    <span className="rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-600">
                      default
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-ink-400">{r.currency}</span>
              </label>
            );
          })}
        </div>
      )}
      {hint ? <p className="mt-1.5 text-[11px] text-ink-400">{hint}</p> : null}
    </div>
  );
}
