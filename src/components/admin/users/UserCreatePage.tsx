"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/users.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { UserForm, type UserCreateFormValues } from "./UserForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import type { ApiUserCreateInput, ManagerPermission } from "@/features/users/types";

export function UserCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: (created) => {
      toast.success({ title: t("admin.usersPage.toastCreated"), description: created.email });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      router.push("/admin/users");
    },
    onError: (err) => toast.fromError(t("admin.usersPage.toastCreateError"), err),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t("admin.usersPage.newUser")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.users"), href: "/admin/users" },
          { label: t("admin.common.new") },
        ]}
      />
      <UserForm
        mode="create"
        submitLabel={t("admin.usersPage.createSubmit")}
        submitting={mutation.isPending}
        onSubmit={async (values) => {
          const v = values as UserCreateFormValues;
          const payload: ApiUserCreateInput = {
            email: v.email.trim(),
            firstName: v.firstName.trim(),
            lastName: v.lastName.trim(),
            password: v.password,
            role: v.role,
            managerTitle: v.role === "MANAGER" ? v.managerTitle ?? undefined : undefined,
            managerPermissions:
              v.role === "MANAGER"
                ? (v.managerPermissions as ManagerPermission[])
                : undefined,
            avatar: v.avatar ?? undefined,
          };
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
