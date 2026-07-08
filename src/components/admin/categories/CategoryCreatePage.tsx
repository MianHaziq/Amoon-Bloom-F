"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { CategoryForm } from "./CategoryForm";
import { useToast } from "@/hooks/useToast";

export function CategoryCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: (created) => {
      toast.success({ title: "Category created", description: created.title });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      revalidateCatalog();
      router.push("/admin/categories");
    },
    onError: (err) => toast.fromError("Could not create category", err),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="New category"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: "New" },
        ]}
      />
      <CategoryForm
        submitLabel="Create category"
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
