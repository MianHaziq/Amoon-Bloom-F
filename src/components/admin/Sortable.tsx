"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface SortableItemRenderProps {
  /** Attach to the element that should move. */
  setNodeRef: (el: HTMLElement | null) => void;
  /** Apply to the same element for the drag transform/transition. */
  style: CSSProperties;
  /** True while this item is being dragged (for styling). */
  isDragging: boolean;
  /** Spread onto the drag handle (the grip). Keyboard + pointer aware. */
  handleProps: Record<string, unknown>;
}

function useSortableSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
}

interface SortableProviderProps<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (next: T[]) => void;
  children: ReactNode;
}

/**
 * The DndContext half of the sortable pair. Renders dnd-kit's (hidden)
 * accessibility nodes, so it must sit at a place where extra <div>s are valid —
 * e.g. wrapping a table's container, NOT inside a <tbody>. Pair with
 * <SortableZone> around the actual sortable items.
 */
export function SortableProvider<T>({
  items,
  getId,
  onReorder,
  children,
}: SortableProviderProps<T>) {
  const ids = items.map(getId);
  const sensors = useSortableSensors();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}

interface SortableZoneProps<T> {
  items: T[];
  getId: (item: T) => string;
  strategy?: "vertical" | "grid";
  children: ReactNode;
}

/**
 * The SortableContext half of the sortable pair. Renders NO DOM element of its
 * own, so it is safe to place directly inside a <tbody> (or any element with
 * restrictive allowed children). Must be a descendant of a <SortableProvider>.
 */
export function SortableZone<T>({
  items,
  getId,
  strategy = "vertical",
  children,
}: SortableZoneProps<T>) {
  const ids = items.map(getId);
  return (
    <SortableContext
      items={ids}
      strategy={
        strategy === "grid" ? rectSortingStrategy : verticalListSortingStrategy
      }
    >
      {children}
    </SortableContext>
  );
}

interface SortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  /** Called with the fully reordered array after a drop. */
  onReorder: (next: T[]) => void;
  /** "vertical" for rows/lists, "grid" for wrapping card/tile grids. */
  strategy?: "vertical" | "grid";
  /** Optional wrapper className applied around the rendered children. */
  className?: string;
  children: (item: T, index: number) => ReactNode;
}

/**
 * Convenience wrapper: DndContext + SortableContext together. Use for grids /
 * flow layouts where the extra accessibility <div>s dnd-kit emits are valid
 * siblings. For tables, use <SortableProvider> + <SortableZone> separately so
 * those <div>s don't land inside a <tbody>.
 */
export function SortableList<T>({
  items,
  getId,
  onReorder,
  strategy = "vertical",
  className,
  children,
}: SortableListProps<T>) {
  const rendered = items.map((item, i) => children(item, i));
  return (
    <SortableProvider items={items} getId={getId} onReorder={onReorder}>
      <SortableZone items={items} getId={getId} strategy={strategy}>
        {className ? <div className={className}>{rendered}</div> : rendered}
      </SortableZone>
    </SortableProvider>
  );
}

interface SortableItemProps {
  id: string;
  children: (props: SortableItemRenderProps) => ReactNode;
}

/** Render-prop wrapper exposing dnd-kit sortable state for a single item. */
export function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <>
      {children({
        setNodeRef,
        style,
        isDragging,
        handleProps: { ...attributes, ...listeners },
      })}
    </>
  );
}
