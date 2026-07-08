"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { usersApi } from "@/features/users/api/users.api";
import { queryKeys } from "@/services/queryKeys";
import { useT } from "@/i18n/useT";
import type {
  ApiAdminUser,
  ManagerPermission,
  UserRoleEnum,
} from "@/features/users/types";

function useUserFormSchemas() {
  const { t } = useT();
  return useMemo(() => {
    const baseSchema = z.object({
      firstName: z.string().min(1, t("admin.userForm.firstNameRequired")),
      lastName: z.string().min(1, t("admin.userForm.lastNameRequired")),
      email: z.string().email(t("admin.userForm.emailInvalid")),
      role: z.enum(["CUSTOMER", "MANAGER"]),
      managerTitle: z.string().optional().nullable(),
      managerPermissions: z.array(z.string()),
      avatar: z.string().url().nullable(),
    });

    const createSchema = baseSchema.extend({
      password: z.string().min(6, t("admin.userForm.passwordMin")),
    });

    const editSchema = baseSchema;
    return { createSchema, editSchema };
  }, [t]);
}

export type UserCreateFormValues = z.infer<
  ReturnType<typeof useUserFormSchemas>["createSchema"]
>;
export type UserEditFormValues = z.infer<ReturnType<typeof useUserFormSchemas>["editSchema"]>;

interface UserFormProps {
  initial?: ApiAdminUser;
  mode: "create" | "edit";
  onSubmit: (values: UserCreateFormValues | UserEditFormValues) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

export function UserForm({
  initial,
  mode,
  onSubmit,
  submitLabel,
  submitting,
}: UserFormProps) {
  const { t } = useT();
  const { createSchema, editSchema } = useUserFormSchemas();
  const permsQuery = useQuery({
    queryKey: queryKeys.users.permissionsCatalog(),
    queryFn: () => usersApi.permissionsCatalog(),
  });

  const schema = mode === "create" ? createSchema : editSchema;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(
      schema as unknown as typeof createSchema
    ),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "CUSTOMER",
      managerTitle: "",
      managerPermissions: [],
      avatar: null,
      password: "",
    },
  });

  useEffect(() => {
    if (!initial) return;
    const role: UserRoleEnum =
      initial.role.toUpperCase() === "ADMIN"
        ? "ADMIN"
        : initial.role.toUpperCase() === "MANAGER"
        ? "MANAGER"
        : "CUSTOMER";
    reset({
      firstName: initial.firstName,
      lastName: initial.lastName,
      email: initial.email,
      // ADMIN can't be set here from the form (only from /role endpoint), default to MANAGER if existing admin
      role: role === "ADMIN" ? "MANAGER" : role,
      managerTitle: initial.managerTitle ?? "",
      managerPermissions: initial.managerPermissions ?? [],
      avatar: initial.avatar?.startsWith("http") ? initial.avatar : null,
      password: "",
    });
  }, [initial, reset]);

  const role = watch("role");
  const selectedPerms = watch("managerPermissions") ?? [];

  const togglePerm = (key: ManagerPermission) => {
    const next = selectedPerms.includes(key)
      ? selectedPerms.filter((p) => p !== key)
      : [...selectedPerms, key];
    setValue("managerPermissions", next, { shouldDirty: true });
  };

  const submit = handleSubmit(async (values) => {
    if (values.role === "MANAGER") {
      if (!values.managerTitle || !values.managerTitle.trim()) {
        // Friendly inline guard. Could move into schema with refine.
        return;
      }
      if (selectedPerms.length === 0) return;
    }
    await onSubmit(values);
  });

  const isAdminInitial = initial?.role.toUpperCase() === "ADMIN";

  const permsList = useMemo(
    () => permsQuery.data ?? [],
    [permsQuery.data]
  );

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.userForm.profileHeading")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("admin.userForm.firstNameLabel")}
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label={t("admin.userForm.lastNameLabel")}
              error={errors.lastName?.message}
              {...register("lastName")}
            />
            <Input
              label={t("admin.userForm.emailLabel")}
              type="email"
              error={errors.email?.message}
              containerClassName="sm:col-span-2"
              {...register("email")}
            />
            {mode === "create" ? (
              <Input
                label={t("admin.userForm.tempPasswordLabel")}
                type="password"
                hint={t("admin.userForm.tempPasswordHint")}
                error={errors.password?.message}
                containerClassName="sm:col-span-2"
                {...register("password")}
              />
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.userForm.roleHeading")}</h3>
          {isAdminInitial ? (
            <p className="mb-3 rounded-lg border border-bloom-200 bg-bloom-50 px-3 py-2 text-xs text-bloom-700">
              {t("admin.userForm.adminNotice")}
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <RoleCard
              value="CUSTOMER"
              currentValue={role}
              onChange={(v) => setValue("role", v, { shouldDirty: true })}
              title={t("admin.userForm.customerTitle")}
              description={t("admin.userForm.customerDescription")}
            />
            <RoleCard
              value="MANAGER"
              currentValue={role}
              onChange={(v) => setValue("role", v, { shouldDirty: true })}
              title={t("admin.userForm.managerTitle")}
              description={t("admin.userForm.managerDescription")}
            />
          </div>

          {role === "MANAGER" ? (
            <div className="mt-5 grid gap-4 border-t border-ink-100 pt-5">
              <Input
                label={t("admin.userForm.managerTitleLabel")}
                placeholder="Senior Operations Manager"
                {...register("managerTitle")}
              />
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-700">
                  {t("admin.userForm.permissionsLabel")}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {permsList.map((p) => {
                    const checked = selectedPerms.includes(p.key);
                    return (
                      <button
                        type="button"
                        key={p.key}
                        onClick={() => togglePerm(p.key)}
                        className={
                          "flex flex-col items-start rounded-xl border p-3 text-start transition-colors " +
                          (checked
                            ? "border-bloom-500 bg-bloom-50"
                            : "border-ink-200 bg-white hover:border-ink-300")
                        }
                      >
                        <span className="text-sm font-medium text-ink-900">
                          {p.label}
                        </span>
                        <span className="mt-0.5 text-xs text-ink-500">
                          {p.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedPerms.length === 0 ? (
                  <p className="mt-2 text-xs text-bloom-700">
                    {t("admin.userForm.pickPermissionHint")}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <aside>
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.userForm.avatarHeading")}</h3>
          <Controller
            control={control}
            name="avatar"
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                path="team"
                label=""
                hint={t("admin.userForm.avatarHint")}
              />
            )}
          />
        </section>
      </aside>

      <div className="lg:col-span-2 flex justify-end">
        <Button type="submit" size="lg" isLoading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface RoleCardProps {
  value: "CUSTOMER" | "MANAGER";
  currentValue: "CUSTOMER" | "MANAGER";
  onChange: (v: "CUSTOMER" | "MANAGER") => void;
  title: string;
  description: string;
}

function RoleCard({ value, currentValue, onChange, title, description }: RoleCardProps) {
  const active = currentValue === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={
        "rounded-xl border p-4 text-start transition-colors " +
        (active
          ? "border-bloom-500 bg-bloom-50"
          : "border-ink-200 bg-white hover:border-ink-300")
      }
    >
      <p className="font-medium text-ink-900">{title}</p>
      <p className="mt-1 text-xs text-ink-500">{description}</p>
    </button>
  );
}
