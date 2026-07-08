"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Loader";
import { staggerContainer, subtleRise } from "@/lib/motion";
import { ApiError } from "@/services/http";
import { useT } from "@/i18n/useT";
import {
  SortableProvider,
  SortableZone,
  SortableItem,
} from "@/components/admin/Sortable";
import { GripVerticalIcon } from "@/components/icons";

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
  /** Enable drag-and-drop reordering (adds a grip handle column). */
  sortable?: boolean;
  /** Called with the reordered rows after a drop. Required when `sortable`. */
  onReorder?: (rows: T[]) => void;
}

export function DataTable<T>({
  columns,
  rows,
  isLoading,
  isError,
  error,
  emptyTitle,
  emptyDescription,
  rowKey,
  onRowClick,
  toolbar,
  footer,
  sortable,
  onReorder,
}: DataTableProps<T>) {
  const { t } = useT();
  const dragEnabled = Boolean(sortable && onReorder);
  const colCount = columns.length + (dragEnabled ? 1 : 0);
  const table = (
    <div className="rounded-2xl border border-ink-100 bg-white">
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-4 py-3 sm:px-5">
          {toolbar}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-start text-sm">
          <thead className="bg-cream-50 text-xs uppercase tracking-wider text-ink-500">
            <tr>
              {dragEnabled ? <th className="w-10 px-2 py-3" aria-hidden /> : null}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 font-medium",
                    col.align === "right" && "text-end",
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
          {isLoading ? (
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={`s${i}`} className="border-t border-ink-100">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : isError ? (
            <tbody>
              <tr>
                <td colSpan={colCount} className="px-4 py-10 text-center">
                  <p className="text-sm text-bloom-700">
                    {error instanceof ApiError
                      ? error.message
                      : t("admin.common.loadFailed")}
                  </p>
                </td>
              </tr>
            </tbody>
          ) : !rows || rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={colCount} className="px-4 py-12 text-center">
                  <p className="font-display text-lg text-ink-700">
                    {emptyTitle ?? t("admin.common.nothingHereYet")}
                  </p>
                  {emptyDescription ? (
                    <p className="mt-1 text-sm text-ink-500">{emptyDescription}</p>
                  ) : null}
                </td>
              </tr>
            </tbody>
          ) : dragEnabled ? (
            // Drag-and-drop mode: plain rows (no motion transform, which would
            // fight dnd-kit's) wrapped in a sortable context. A grip handle in
            // the leading cell starts the drag.
            <tbody>
              <SortableZone items={rows} getId={rowKey} strategy="vertical">
                {rows.map((row) => (
                  <SortableItem key={rowKey(row)} id={rowKey(row)}>
                    {({ setNodeRef, style, isDragging, handleProps }) => (
                      <tr
                        ref={setNodeRef}
                        style={style}
                        className={cn(
                          "border-t border-ink-100 bg-white transition-colors",
                          isDragging && "shadow-(--shadow-lift)"
                        )}
                      >
                        <td className="w-10 px-2">
                          <button
                            type="button"
                            {...handleProps}
                            aria-label={t("admin.common.dragToReorder")}
                            className="flex h-8 w-8 touch-none items-center justify-center rounded-md text-ink-400 hover:bg-ink-50 hover:text-ink-700 active:cursor-grabbing"
                            style={{ cursor: "grab" }}
                          >
                            <GripVerticalIcon size={16} />
                          </button>
                        </td>
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={cn(
                              "px-4 py-3",
                              col.align === "right" && "text-end",
                              col.align === "center" && "text-center",
                              col.className
                            )}
                          >
                            {col.cell(row)}
                          </td>
                        ))}
                      </tr>
                    )}
                  </SortableItem>
                ))}
              </SortableZone>
            </tbody>
          ) : (
            // Real rows cascade in once on mount — a quick, subtle stagger that
            // reads as "loaded" without being showy. Keyed by row count so a
            // page/filter change that swaps the set replays the cascade.
            <m.tbody
              key={rows.length}
              variants={staggerContainer(0.03, 0)}
              initial="hidden"
              animate="show"
            >
              {rows.map((row) => {
                const interactive = Boolean(onRowClick);
                return (
                  <m.tr
                    key={rowKey(row)}
                    variants={subtleRise}
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
                          col.align === "right" && "text-end",
                          col.align === "center" && "text-center",
                          col.className
                        )}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </m.tr>
                );
              })}
            </m.tbody>
          )}
        </table>
      </div>

      {footer ? (
        <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 sm:px-5">
          {footer}
        </div>
      ) : null}
    </div>
  );

  // The DndContext (which emits hidden accessibility <div>s) wraps the whole
  // table container — never inside <tbody>, which only allows table-row content.
  return dragEnabled ? (
    <SortableProvider items={rows ?? []} getId={rowKey} onReorder={onReorder!}>
      {table}
    </SortableProvider>
  ) : (
    table
  );
}
