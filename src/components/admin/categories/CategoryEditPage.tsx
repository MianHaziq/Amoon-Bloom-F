"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { CategoryForm } from "./CategoryForm";
import { useToast } from "@/hooks/useToast";

export function CategoryEditPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoriesApi.getById(id),
  });

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof categoriesApi.update>[1]) =>
      categoriesApi.update(id, payload),
    onSuccess: (updated) => {
      toast.success({ title: "Category updated", description: updated.title });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (err) => toast.fromError("Could not update category", err),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={detailQuery.data?.title ?? "Edit category"}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: detailQuery.data?.title ?? "…" },
        ]}
      />

      {detailQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          <p className="font-medium">Could not load this category.</p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => router.replace("/admin/categories")}
          >
            Back to categories
          </button>
        </div>
      ) : (
        <CategoryForm
          initial={detailQuery.data}
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
