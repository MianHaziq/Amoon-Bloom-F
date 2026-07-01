"use client";

import { useState } from "react";
import { useAppSelector } from "@/store";
import { ChevronDown, PinIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import { LocationSheet } from "./LocationSheet";

interface DeliverToPillProps {
  className?: string;
  /** Compact variant for narrow viewports — drops the "Deliver to" prefix. */
  compact?: boolean;
}

/**
 * Trigger button that opens the `LocationSheet`. Surfaces the active city +
 * currency so the customer always knows what context they're shopping in.
 */
export function DeliverToPill({ className, compact = false }: DeliverToPillProps) {
  const [open, setOpen] = useState(false);
  const city = useAppSelector((s) => s.location.city);
  const { t } = useT();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border border-ink-200 bg-white px-3 text-xs font-medium text-ink-700 transition-colors hover:border-ink-300 hover:text-ink-900",
          className
        )}
      >
        <PinIcon size={14} className="text-bloom-700" />
        {compact ? null : <span className="text-ink-500">{t("nav.deliverTo")}</span>}
        <span className="text-ink-900">{city}</span>
        <ChevronDown size={12} className="text-ink-400" />
      </button>
      <LocationSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
