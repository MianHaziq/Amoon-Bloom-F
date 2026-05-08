"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Loader";
import { ApiError } from "@/services/http";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  emptyTitle?: string;
  emptyDescription?: string;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  footer?: ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  isLoading,
  isError,
  error,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  rowKey,
  onRowClick,
  toolbar,
  footer,
}: DataTableProps<T>) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white">
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-4 py-3 sm:px-5">
          {toolbar}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-50 text-xs uppercase tracking-wider text-ink-500">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 font-medium",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`s${i}`} className="border-t border-ink-100">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center">
                  <p className="text-sm text-bloom-700">
                    {error instanceof ApiError
                      ? error.message
                      : "Something went wrong while loading."}
                  </p>
                </td>
              </tr>
            ) : !rows || rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="font-display text-lg text-ink-700">{emptyTitle}</p>
                  {emptyDescription ? (
                    <p className="mt-1 text-sm text-ink-500">{emptyDescription}</p>
                  ) : null}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const interactive = Boolean(onRowClick);
                return (
                  <tr
                    key={rowKey(row)}
                    onClick={interactive ? () => onRowClick?.(row) : undefined}
                    className={cn(
                      "border-t border-ink-100 transition-colors",
                      interactive && "cursor-pointer hover:bg-cream-50"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                          col.className
                        )}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {footer ? (
        <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 sm:px-5">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
