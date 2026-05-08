"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/users.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { UserForm, type UserEditFormValues } from "./UserForm";
import { useToast } from "@/hooks/useToast";
import type {
  ApiUserUpdateInput,
  ManagerPermission,
  UserRoleEnum,
} from "@/features/users/types";

export function UserEditPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ApiUserUpdateInput) => usersApi.update(id, payload),
    onSuccess: (updated) => {
      toast.success({ title: "User updated", description: updated.email });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (err) => toast.fromError("Could not update user", err),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={detailQuery.data?.name ?? "Edit user"}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: detailQuery.data?.name ?? "…" },
        ]}
      />

      {detailQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          <p className="font-medium">Could not load this user.</p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => router.replace("/admin/users")}
          >
            Back to users
          </button>
        </div>
      ) : (
        <UserForm
          mode="edit"
          initial={detailQuery.data}
          submitLabel="Save changes"
          submitting={updateMutation.isPending}
          onSubmit={async (values) => {
            const v = values as UserEditFormValues;
            const role = v.role as UserRoleEnum;
            const payload: ApiUserUpdateInput = {
              firstName: v.firstName.trim(),
              lastName: v.lastName.trim(),
              email: v.email.trim(),
              role,
              managerTitle: role === "MANAGER" ? v.managerTitle ?? undefined : undefined,
              managerPermissions:
                role === "MANAGER"
                  ? (v.managerPermissions as ManagerPermission[])
                  : undefined,
              avatar: v.avatar,
            };
            await updateMutation.mutateAsync(payload);
          }}
        />
      )}
    </div>
  );
}
