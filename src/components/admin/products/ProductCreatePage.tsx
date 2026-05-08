"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "./ProductForm";
import { useToast } from "@/hooks/useToast";

export function ProductCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: (created) => {
      toast.success({ title: "Product created", description: created.title });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      router.push("/admin/products");
    },
    onError: (err) => toast.fromError("Could not create product", err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="New product"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "New" },
        ]}
      />
      <ProductForm
        submitLabel="Create product"
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
