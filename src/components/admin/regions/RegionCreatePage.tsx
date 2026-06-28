"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { RegionForm } from "./RegionForm";
import { useToast } from "@/hooks/useToast";

export function RegionCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: regionsApi.create,
    onSuccess: (created) => {
      toast.success({ title: "Region created", description: created.code });
      queryClient.invalidateQueries({ queryKey: queryKeys.regions.all });
      router.push("/admin/regions");
    },
    onError: (err) => toast.fromError("Could not create region", err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="New region"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Regions", href: "/admin/regions" },
          { label: "New" },
        ]}
      />
      <RegionForm
        submitLabel="Create region"
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
