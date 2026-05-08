"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/users.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { UserForm, type UserCreateFormValues } from "./UserForm";
import { useToast } from "@/hooks/useToast";
import type { ApiUserCreateInput, ManagerPermission } from "@/features/users/types";

export function UserCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: (created) => {
      toast.success({ title: "User created", description: created.email });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      router.push("/admin/users");
    },
    onError: (err) => toast.fromError("Could not create user", err),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="New user"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: "New" },
        ]}
      />
      <UserForm
        mode="create"
        submitLabel="Create user"
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
