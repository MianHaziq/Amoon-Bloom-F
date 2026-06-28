"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { RegionForm } from "./RegionForm";
import { useToast } from "@/hooks/useToast";

export function RegionEditPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  // The backend exposes no GET /regions/:id — source the record from the list.
  const listQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });
  const region = listQuery.data?.find((r) => r.id === id);

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof regionsApi.update>[1]) =>
      regionsApi.update(id, payload),
    onSuccess: (updated) => {
      toast.success({ title: "Region updated", description: updated.code });
      queryClient.invalidateQueries({ queryKey: queryKeys.regions.all });
    },
    onError: (err) => toast.fromError("Could not update region", err),
  });

  const notFound = listQuery.isSuccess && !region;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={region?.name ?? "Edit region"}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Regions", href: "/admin/regions" },
          { label: region?.code ?? "…" },
        ]}
      />

      {listQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : listQuery.isError || notFound ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          <p className="font-medium">
            {notFound ? "Region not found." : "Could not load this region."}
          </p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => router.replace("/admin/regions")}
          >
            Back to regions
          </button>
        </div>
      ) : (
        <RegionForm
          initial={region}
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
