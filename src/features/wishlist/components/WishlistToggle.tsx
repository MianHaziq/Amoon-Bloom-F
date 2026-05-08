"use client";

import { useMemo } from "react";
import { IconButton } from "@/components/ui";
import { HeartIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleWishlistItem } from "@/store/slices/wishlist.slice";
import { pushToast } from "@/store/slices/ui.slice";
import type { Product } from "@/features/products/types";

interface WishlistToggleProps {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** When `true`, the button stops click propagation so it can sit inside an
   *  outer `<Link>` without triggering navigation. */
  stopPropagation?: boolean;
}

export function WishlistToggle({
  product,
  size = "sm",
  className,
  stopPropagation = false,
}: WishlistToggleProps) {
  const dispatch = useAppDispatch();
  const inWishlist = useAppSelector((s) =>
    s.wishlist.items.some((i) => i.productId === product.id)
  );

  const iconSize = useMemo(
    () => (size === "lg" ? 20 : size === "md" ? 18 : 16),
    [size]
  );

  return (
    <IconButton
      label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
      variant="subtle"
      size={size}
      className={cn(
        "bg-white/90 backdrop-blur-sm hover:bg-white",
        inWishlist && "text-bloom-700",
        className
      )}
      onClick={(e) => {
        if (stopPropagation) {
          e.preventDefault();
          e.stopPropagation();
        }
        dispatch(toggleWishlistItem({ product }));
        dispatch(
          pushToast({
            title: inWishlist ? "Removed from wishlist" : "Saved to wishlist",
            description: product.title,
            variant: inWishlist ? "default" : "success",
          })
        );
      }}
      aria-pressed={inWishlist}
    >
      <HeartIcon
        size={iconSize}
        className={cn(inWishlist && "fill-current")}
      />
    </IconButton>
  );
}
