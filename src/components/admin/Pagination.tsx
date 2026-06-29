"use client";

import { Button } from "@/components/ui";
import { ChevronRight } from "@/components/icons";
import type { PaginationMeta } from "@/types/api";

interface PaginationProps {
  meta?: PaginationMeta;
  page: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ meta, page, onChange, className }: PaginationProps) {
  if (!meta) return null;
  const { totalPages, total, limit } = meta;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className={className ?? "flex w-full flex-wrap items-center justify-between gap-3"}>
      <p className="text-xs text-ink-500">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            <span className="font-medium text-ink-700">
              {start.toLocaleString()}–{end.toLocaleString()}
            </span>{" "}
            of {total.toLocaleString()}
          </>
        )}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          onClick={() => onChange(page - 1)}
          leadingIcon={<ChevronRight size={14} className="rotate-180" />}
        >
          Prev
        </Button>
        <span className="px-2 text-xs text-ink-500">
          Page {page} / {Math.max(1, totalPages)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onChange(page + 1)}
          trailingIcon={<ChevronRight size={14} />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
