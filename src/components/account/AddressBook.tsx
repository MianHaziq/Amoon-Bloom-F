"use client";

import { useState } from "react";
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
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import type {
  ApiAddress,
  ApiAddressCreateInput,
} from "@/features/addresses/types";

const schema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(1, "Required"),
  phone: z.string().min(4, "Required"),
  streetAddress: z.string().min(1, "Required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "Required"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Required"),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

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
      toast.success({ title: "Address removed" });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
    onError: (err) => toast.fromError("Could not remove address", err),
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
        Could not load your addresses.
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
          Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center">
          <p className="font-display text-xl text-ink-700">No saved addresses</p>
          <p className="mt-1 text-sm text-ink-500">
            Save addresses to check out faster.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-ink-100 bg-white p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {a.label || a.fullName}
                  </p>
                  {a.isDefault ? (
                    <span className="mt-1 inline-block rounded-full bg-bloom-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-bloom-700">
                      Default
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(a)}
                    className="rounded-md p-1.5 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                    aria-label="Edit"
                  >
                    <PencilIcon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(a)}
                    className="rounded-md p-1.5 text-bloom-700 hover:bg-bloom-50"
                    aria-label="Delete"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-ink-700">{a.fullName}</p>
              <p className="text-xs text-ink-500">{a.phone}</p>
              <p className="mt-2 text-sm text-ink-700">
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
        title="Remove address?"
        confirmLabel="Remove"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />

      <AddressFormModal
        open={creating}
        onClose={() => setCreating(false)}
        title="New address"
      />
      <AddressFormModal
        open={Boolean(editing)}
        initial={editing ?? undefined}
        onClose={() => setEditing(null)}
        title="Edit address"
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
      toast.success({ title: initial ? "Address updated" : "Address saved" });
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      reset(emptyDefaults);
      onClose();
    },
    onError: (err) => toast.fromError("Could not save address", err),
  });

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="grid gap-4 sm:grid-cols-2"
        noValidate
      >
        <Input
          label="Label"
          placeholder="Home, Office…"
          containerClassName="sm:col-span-2"
          {...register("label")}
        />
        <Input
          label="Full name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label="Phone"
          type="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="Street address"
          error={errors.streetAddress?.message}
          containerClassName="sm:col-span-2"
          {...register("streetAddress")}
        />
        <Input label="Apartment / suite" {...register("apartment")} />
        <Input label="City" error={errors.city?.message} {...register("city")} />
        <Input label="State / region" {...register("state")} />
        <Input label="Postal code" {...register("postalCode")} />
        <Input
          label="Country"
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
          <span className="text-sm text-ink-900">Use as default</span>
        </label>

        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {initial ? "Save changes" : "Save address"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
