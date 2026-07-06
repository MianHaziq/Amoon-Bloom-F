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
 * Thin, reusable drag-and-drop reorder wrapper around dnd-kit. Handles sensors
 * (pointer + keyboard, with a small drag threshold so clicks still work),
 * collision detection, and array reordering — callers just render each item and
 * wire a drag handle via <SortableItem>.
 */
export function SortableList<T>({
  items,
  getId,
  onReorder,
  strategy = "vertical",
  className,
  children,
}: SortableListProps<T>) {
  const ids = items.map(getId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  const rendered = items.map((item, i) => children(item, i));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ids}
        strategy={
          strategy === "grid" ? rectSortingStrategy : verticalListSortingStrategy
        }
      >
        {className ? <div className={className}>{rendered}</div> : rendered}
      </SortableContext>
    </DndContext>
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
