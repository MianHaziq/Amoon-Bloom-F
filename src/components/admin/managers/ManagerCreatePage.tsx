"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/users.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { UserForm, type UserCreateFormValues } from "@/components/admin/users/UserForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import type { ApiUserCreateInput, ManagerPermission } from "@/features/users/types";

/**
 * Dedicated "create manager" flow. Reuses UserForm with the role locked to
 * MANAGER (no customer/manager picker), so the admin lands straight on the
 * title + permissions fields, then returns to the Managers list.
 */
export function ManagerCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: (created) => {
      toast.success({
        title: t("admin.usersPage.toastCreated"),
        description: created.email,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      router.push("/admin/managers");
    },
    onError: (err) => toast.fromError(t("admin.usersPage.toastCreateError"), err),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t("admin.managersPage.createTitle")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.managers"), href: "/admin/managers" },
          { label: t("admin.common.new") },
        ]}
      />
      <UserForm
        mode="create"
        lockRole
        defaultRole="MANAGER"
        submitLabel={t("admin.managersPage.newManager")}
        submitting={mutation.isPending}
        onSubmit={async (values) => {
          const v = values as UserCreateFormValues;
          const payload: ApiUserCreateInput = {
            email: v.email.trim(),
            firstName: v.firstName.trim(),
            lastName: v.lastName.trim(),
            password: v.password,
            role: "MANAGER",
            managerTitle: v.managerTitle ?? undefined,
            managerPermissions: v.managerPermissions as ManagerPermission[],
            avatar: v.avatar ?? undefined,
          };
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
