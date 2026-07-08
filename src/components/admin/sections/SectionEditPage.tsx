"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sectionsApi } from "@/features/sections/api/sections.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { SectionForm } from "./SectionForm";
import { useToast } from "@/hooks/useToast";

export function SectionEditPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: queryKeys.sections.detail(id),
    queryFn: () => sectionsApi.getById(id),
  });

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof sectionsApi.update>[1]) =>
      sectionsApi.update(id, payload),
    onSuccess: (updated) => {
      toast.success({ title: "Section updated", description: updated.title });
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
      revalidateCatalog(["sections"]);
    },
    onError: (err) => toast.fromError("Could not update section", err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={detailQuery.data?.title ?? "Edit section"}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Sections", href: "/admin/sections" },
          { label: detailQuery.data?.title ?? "…" },
        ]}
      />

      {detailQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          <p className="font-medium">Could not load this section.</p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => router.replace("/admin/sections")}
          >
            Back to sections
          </button>
        </div>
      ) : (
        <SectionForm
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
