import { cn } from "@/lib/cn";
import { StaggerGroup, StaggerItem } from "@/components/motion/primitives";
import { ProductCard } from "./ProductCard";
import type { Product } from "../types";

interface ProductGridProps {
  products: Product[];
  className?: string;
  columns?: 2 | 3 | 4;
  priorityCount?: number;
  /**
   * Stagger trigger. Default "inView" reveals on scroll (once). Use "mount" for a
   * PAGINATED grid (e.g. shop "Load more"): a whileInView-once container never reveals
   * items appended after the first reveal, leaving them at opacity 0 until a refresh —
   * a controlled `animate` ("mount") propagates "show" to late-mounted children.
   */
  trigger?: "inView" | "mount";
}

// Mobile-first: always 2 columns on phones (the standard ecommerce pattern),
// stepping up on larger screens per the requested max column count.
const columnMap = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 md:grid-cols-3",
  4: "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
} as const;

export function ProductGrid({
  products,
  className,
  columns = 4,
  priorityCount = 0,
  trigger = "inView",
}: ProductGridProps) {
  return (
    <StaggerGroup
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12",
        columnMap[columns],
        className
      )}
      stagger={0.06}
      trigger={trigger}
    >
      {products.map((product, i) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} priority={i < priorityCount} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
