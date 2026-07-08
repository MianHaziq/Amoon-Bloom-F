"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionsApi } from "@/features/sections/api/sections.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionForm } from "./SectionForm";
import { useToast } from "@/hooks/useToast";

export function SectionCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: sectionsApi.create,
    onSuccess: (created) => {
      toast.success({ title: "Section created", description: created.title });
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
      revalidateCatalog(["sections"]);
      router.push("/admin/sections");
    },
    onError: (err) => toast.fromError("Could not create section", err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="New section"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Sections", href: "/admin/sections" },
          { label: "New" },
        ]}
      />
      <SectionForm
        submitLabel="Create section"
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
