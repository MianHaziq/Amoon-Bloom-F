"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promoCodesApi } from "@/features/promo-codes/api/promo-codes.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { PromoCodeForm } from "./PromoCodeForm";
import { useToast } from "@/hooks/useToast";

export function PromoCodeCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: promoCodesApi.create,
    onSuccess: (created) => {
      toast.success({ title: "Promo code created", description: created.code });
      queryClient.invalidateQueries({ queryKey: queryKeys.promoCodes.all });
      router.push("/admin/promo-codes");
    },
    onError: (err) => toast.fromError("Could not create promo code", err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="New promo code"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Promo codes", href: "/admin/promo-codes" },
          { label: "New" },
        ]}
      />
      <PromoCodeForm
        submitLabel="Create promo code"
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
