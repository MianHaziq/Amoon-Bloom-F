"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { ProductForm } from "./ProductForm";
import { useToast } from "@/hooks/useToast";

interface ProductEditPageProps {
  id: string;
}

export function ProductEditPage({ id }: ProductEditPageProps) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const productQuery = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getById(id),
  });

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof productsApi.update>[1]) =>
      productsApi.update(id, payload),
    onSuccess: (updated) => {
      toast.success({ title: "Product updated", description: updated.title });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.setQueryData(queryKeys.products.detail(id), updated);
      revalidateCatalog();
    },
    onError: (err) => toast.fromError("Could not update product", err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={productQuery.data?.title ?? "Edit product"}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: productQuery.data?.title ?? "…" },
        ]}
      />

      {productQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : productQuery.isError ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          <p className="font-medium">Could not load this product.</p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => router.replace("/admin/products")}
          >
            Back to products
          </button>
        </div>
      ) : (
        <ProductForm
          initial={productQuery.data}
          submitLabel="Save changes"
          submitting={mutation.isPending}
          onSubmit={async (payload) => {
            await mutation.mutateAsync(payload);
          }}
        />
      )}
    </div>
  );
}
