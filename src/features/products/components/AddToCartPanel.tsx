"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { BagIcon, HeartIcon } from "@/components/icons";
import { QuantitySelector } from "./QuantitySelector";
import { OptionPicker } from "./OptionPicker";
import { useCart } from "@/features/cart/hooks/useCart";
import { useAppDispatch } from "@/store";
import { pushToast, toggleCartDrawer } from "@/store/slices/ui.slice";
import type { Product } from "../types";

interface AddToCartPanelProps {
  product: Product;
}

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const dispatch = useAppDispatch();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (product.options ?? []).map((o) => [o.id, o.options[0] ?? ""])
    )
  );

  const handleAdd = () => {
    if (!product.inStock) return;
    add(product, qty);
    dispatch(
      pushToast({
        title: "Added to cart",
        description: `${qty} × ${product.title}`,
        variant: "success",
      })
    );
    dispatch(toggleCartDrawer(true));
  };

  return (
    <div className="flex flex-col gap-5">
      {product.options && product.options.length > 0 && (
        <div className="flex flex-col gap-5">
          {product.options.map((opt) => (
            <OptionPicker
              key={opt.id}
              title={opt.title}
              options={opt.options}
              value={selected[opt.id] ?? null}
              onChange={(v) =>
                setSelected((prev) => ({ ...prev, [opt.id]: v }))
              }
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <QuantitySelector value={qty} onChange={setQty} />
        <span className="text-sm text-ink-500">
          {product.inStock ? "In stock · ready to dispatch" : "Currently sold out"}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          fullWidth
          size="xl"
          onClick={handleAdd}
          disabled={!product.inStock}
          leadingIcon={<BagIcon size={18} />}
          className="sm:flex-[2]"
        >
          {product.inStock ? "Add to cart" : "Sold out"}
        </Button>
        <Button
          fullWidth
          size="xl"
          variant="outline"
          leadingIcon={<HeartIcon size={18} />}
          className="sm:flex-1"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
