"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { authApi } from "@/features/auth/api/auth.api";
import { profileApi } from "@/features/auth/api/profile.api";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, updateUser } from "@/store/slices/auth.slice";
import { useToast } from "@/hooks/useToast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useT } from "@/i18n/useT";
import { useMemo } from "react";

type ProfileValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};
type PasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirm: string;
};

export function AccountProfile() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const { t } = useT();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const profileSchema = useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t("validation.required")),
        lastName: z.string().min(1, t("validation.required")),
        email: z.string().email(t("validation.email")),
        phone: z.string().optional(),
      }),
    [t]
  );

  const passwordSchema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1, t("validation.required")),
          newPassword: z.string().min(8, t("validation.min8")),
          confirm: z.string(),
        })
        .refine((v) => v.newPassword === v.confirm, {
          path: ["confirm"],
          message: t("validation.passwordsMatch"),
        }),
    [t]
  );

  // Profile form
  const {
    register: regProfile,
    handleSubmit: submitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  });

  useEffect(() => {
    if (!user) return;
    resetProfile({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email,
      phone: user.phone ?? "",
    });
  }, [user, resetProfile]);

  const profileMutation = useMutation({
    mutationFn: async (values: ProfileValues) => {
      if (!user?.id) throw new Error("Not signed in");
      const updated = await authApi.updateProfile(user.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
      });
      if ((values.phone ?? "") !== (user.phone ?? "")) {
        await profileApi.setPhone(values.phone ?? "");
      }
      return updated;
    },
    onSuccess: (updated, values) => {
      dispatch(
        updateUser({
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          phone: values.phone,
          name: `${updated.firstName ?? ""} ${updated.lastName ?? ""}`.trim(),
        })
      );
      toast.success({ title: t("account.profileUpdated") });
    },
    onError: (err) => toast.fromError(t("account.profileUpdateError"), err),
  });

  // Password form
  const {
    register: regPwd,
    handleSubmit: submitPwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PasswordValues) => {
      if (!user?.id) throw new Error("Not signed in");
      return authApi.changePassword(user.id, values.currentPassword, values.newPassword);
    },
    onSuccess: () => {
      toast.success({ title: t("account.passwordChanged") });
      resetPwd({ currentPassword: "", newPassword: "", confirm: "" });
    },
    onError: (err) => toast.fromError(t("account.passwordChangeError"), err),
  });

  // Delete account
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error("Not signed in");
      return authApi.deleteAccount(user.id, deletePassword || undefined);
    },
    onSuccess: () => {
      toast.success({ title: t("account.accountDeleted") });
      storage.remove(STORAGE_KEYS.authToken);
      dispatch(logout());
      router.replace("/");
    },
    onError: (err) => toast.fromError(t("account.accountDeleteError"), err),
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-display text-xl text-ink-900">{t("account.profileDetails")}</h2>
        <form
          onSubmit={submitProfile((v) => profileMutation.mutate(v))}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <Input
            label={t("account.firstName")}
            error={profileErrors.firstName?.message}
            {...regProfile("firstName")}
          />
          <Input
            label={t("account.lastName")}
            error={profileErrors.lastName?.message}
            {...regProfile("lastName")}
          />
          <Input
            label={t("auth.email")}
            type="email"
            error={profileErrors.email?.message}
            containerClassName="sm:col-span-2"
            {...regProfile("email")}
          />
          <Input
            label={t("checkout.phone")}
            type="tel"
            placeholder="+971 50 000 0000"
            containerClassName="sm:col-span-2"
            {...regProfile("phone")}
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button
              type="submit"
              isLoading={profileMutation.isPending}
              disabled={!profileDirty}
            >
              {t("account.saveChanges")}
            </Button>
          </div>
        </form>
      </section>

      {user?.hasPassword !== false ? (
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-display text-xl text-ink-900">{t("account.changePassword")}</h2>
          <form
            onSubmit={submitPwd((v) => passwordMutation.mutate(v))}
            className="grid gap-4 sm:grid-cols-2"
            noValidate
          >
            <Input
              label={t("account.currentPassword")}
              type="password"
              autoComplete="current-password"
              error={pwdErrors.currentPassword?.message}
              containerClassName="sm:col-span-2"
              {...regPwd("currentPassword")}
            />
            <Input
              label={t("account.newPassword")}
              type="password"
              autoComplete="new-password"
              error={pwdErrors.newPassword?.message}
              {...regPwd("newPassword")}
            />
            <Input
              label={t("account.confirmNewPassword")}
              type="password"
              autoComplete="new-password"
              error={pwdErrors.confirm?.message}
              {...regPwd("confirm")}
            />
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" isLoading={passwordMutation.isPending}>
                {t("account.updatePassword")}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-2xl border border-bloom-200 bg-bloom-50 p-5 sm:p-6">
        <h2 className="mb-1 font-display text-xl text-bloom-900">{t("account.deleteAccount")}</h2>
        <p className="mb-3 text-sm text-bloom-700">
          {t("account.deleteAccountBody")}
        </p>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          {t("account.deleteMyAccount")}
        </Button>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title={t("account.deleteConfirmTitle")}
        description={
          user?.hasPassword
            ? t("account.deleteConfirmBody")
            : "This cannot be undone."
        }
        confirmLabel={t("account.deleteAccount")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onClose={() => setConfirmDelete(false)}
      />

      {user?.hasPassword ? (
        <Input
          label={t("auth.confirmPassword")}
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          containerClassName={confirmDelete ? "block" : "hidden"}
        />
      ) : null}
    </div>
  );
}
