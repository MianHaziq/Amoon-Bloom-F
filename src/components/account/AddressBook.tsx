"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addressesApi } from "@/features/addresses/api/addresses.api";
import { queryKeys } from "@/services/queryKeys";
import { Button, Input, Modal } from "@/components/ui";
import { Spinner } from "@/components/ui/Loader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import type {
  ApiAddress,
  ApiAddressCreateInput,
} from "@/features/addresses/types";

type FormValues = {
  label?: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
};

const emptyDefaults: FormValues = {
  label: "",
  fullName: "",
  phone: "",
  streetAddress: "",
  apartment: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United Arab Emirates",
  isDefault: false,
};

export function AddressBook() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();
  const [editing, setEditing] = useState<ApiAddress | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ApiAddress | null>(null);

  const query = useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () => addressesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: () => {
      toast.success({ title: t("address.removed") });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
    onError: (err) => toast.fromError(t("address.removeError"), err),
  });

  if (query.isPending) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
        {t("address.loadError")}
      </div>
    );
  }

  const addresses = query.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          leadingIcon={<PlusIcon size={14} />}
          size="sm"
          onClick={() => setCreating(true)}
        >
          {t("address.addAddress")}
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center">
          <p className="font-display text-xl text-ink-700">{t("address.emptyTitle")}</p>
          <p className="mt-1 text-sm text-ink-500">
            {t("address.emptyBody")}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-ink-100 bg-white p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900 wrap-break-word">
                    {a.label || a.fullName}
                  </p>
                  {a.isDefault ? (
                    <span className="mt-1 inline-block rounded-full bg-bloom-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-bloom-700">
                      {t("common.default")}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(a)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                    aria-label={t("common.edit")}
                  >
                    <PencilIcon size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(a)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-bloom-700 hover:bg-bloom-50"
                    aria-label={t("common.delete")}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-ink-700">{a.fullName}</p>
              <p className="text-xs text-ink-500">{a.phone}</p>
              <p className="mt-2 text-sm text-ink-700 wrap-break-word">
                {a.streetAddress}
                {a.apartment ? `, ${a.apartment}` : ""}
              </p>
              <p className="text-sm text-ink-700">
                {a.city}
                {a.state ? `, ${a.state}` : ""}
                {a.postalCode ? ` ${a.postalCode}`: ""}
              </p>
              <p className="text-sm text-ink-700">{a.country}</p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("address.removeTitle")}
        confirmLabel={t("common.remove")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />

      <AddressFormModal
        open={creating}
        onClose={() => setCreating(false)}
        title={t("address.newAddress")}
      />
      <AddressFormModal
        open={Boolean(editing)}
        initial={editing ?? undefined}
        onClose={() => setEditing(null)}
        title={t("address.editAddress")}
      />
    </div>
  );
}

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  initial?: ApiAddress;
  title: string;
}

function AddressFormModal({ open, onClose, initial, title }: AddressFormModalProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const schema = useMemo(
    () =>
      z.object({
        label: z.string().optional(),
        fullName: z.string().min(1, t("validation.required")),
        phone: z.string().min(4, t("validation.required")),
        streetAddress: z.string().min(1, t("validation.required")),
        apartment: z.string().optional(),
        city: z.string().min(1, t("validation.required")),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().min(2, t("validation.required")),
        isDefault: z.boolean().optional(),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          label: initial.label ?? "",
          fullName: initial.fullName,
          phone: initial.phone,
          streetAddress: initial.streetAddress,
          apartment: initial.apartment ?? "",
          city: initial.city,
          state: initial.state ?? "",
          postalCode: initial.postalCode ?? "",
          country: initial.country,
          isDefault: initial.isDefault,
        }
      : emptyDefaults,
    values: initial
      ? {
          label: initial.label ?? "",
          fullName: initial.fullName,
          phone: initial.phone,
          streetAddress: initial.streetAddress,
          apartment: initial.apartment ?? "",
          city: initial.city,
          state: initial.state ?? "",
          postalCode: initial.postalCode ?? "",
          country: initial.country,
          isDefault: initial.isDefault,
        }
      : emptyDefaults,
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload: ApiAddressCreateInput = {
        label: values.label?.trim() || null,
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        streetAddress: values.streetAddress.trim(),
        apartment: values.apartment?.trim() || null,
        city: values.city.trim(),
        state: values.state?.trim() || null,
        postalCode: values.postalCode?.trim() || null,
        country: values.country.trim(),
        isDefault: values.isDefault,
      };
      if (initial) {
        return addressesApi.update(initial.id, payload);
      }
      return addressesApi.create(payload);
    },
    onSuccess: () => {
      toast.success({ title: initial ? t("address.updated") : t("address.saved") });
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      reset(emptyDefaults);
      onClose();
    },
    onError: (err) => toast.fromError(t("address.saveError"), err),
  });

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="grid gap-4 sm:grid-cols-2"
        noValidate
      >
        <Input
          label={t("address.label")}
          placeholder={t("address.labelPlaceholder")}
          containerClassName="sm:col-span-2"
          {...register("label")}
        />
        <Input
          label={t("checkout.fullName")}
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label={t("checkout.phone")}
          type="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label={t("checkout.streetAddress")}
          error={errors.streetAddress?.message}
          containerClassName="sm:col-span-2"
          {...register("streetAddress")}
        />
        <Input label={t("checkout.apartment")} {...register("apartment")} />
        <Input label={t("checkout.city")} error={errors.city?.message} {...register("city")} />
        <Input label={t("address.stateRegion")} {...register("state")} />
        <Input label={t("address.postalCode")} {...register("postalCode")} />
        <Input
          label={t("checkout.country")}
          error={errors.country?.message}
          containerClassName="sm:col-span-2"
          {...register("country")}
        />

        <label className="sm:col-span-2 inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-bloom-600"
            {...register("isDefault")}
          />
          <span className="text-sm text-ink-900">{t("address.useAsDefault")}</span>
        </label>

        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {initial ? t("account.saveChanges") : t("address.saveAddress")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
