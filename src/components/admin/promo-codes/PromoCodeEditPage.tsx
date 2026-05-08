"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { promoCodesApi } from "@/features/promo-codes/api/promo-codes.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { PromoCodeForm } from "./PromoCodeForm";
import { useToast } from "@/hooks/useToast";

export function PromoCodeEditPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: queryKeys.promoCodes.detail(id),
    queryFn: () => promoCodesApi.getById(id),
  });

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof promoCodesApi.update>[1]) =>
      promoCodesApi.update(id, payload),
    onSuccess: (updated) => {
      toast.success({ title: "Promo code updated", description: updated.code });
      queryClient.invalidateQueries({ queryKey: queryKeys.promoCodes.all });
      queryClient.setQueryData(queryKeys.promoCodes.detail(id), updated);
    },
    onError: (err) => toast.fromError("Could not update promo code", err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={detailQuery.data?.code ?? "Edit promo code"}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Promo codes", href: "/admin/promo-codes" },
          { label: detailQuery.data?.code ?? "…" },
        ]}
      />

      {detailQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          <p className="font-medium">Could not load this promo code.</p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => router.replace("/admin/promo-codes")}
          >
            Back to promo codes
          </button>
        </div>
      ) : (
        <PromoCodeForm
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
