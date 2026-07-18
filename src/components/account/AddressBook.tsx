"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addressesApi } from "@/features/addresses/api/addresses.api";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { queryKeys } from "@/services/queryKeys";
import { Button, Input, Modal } from "@/components/ui";
import { Spinner } from "@/components/ui/Loader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import type { MessageKey } from "@/i18n";
import type {
  ApiAddress,
  ApiAddressCreateInput,
} from "@/features/addresses/types";

// Mirrors CheckoutClient.tsx's dial-code convention exactly — same reasoning:
// the field stores one E.164-ish string in the existing `phone` column, no
// backend schema change. Kept in sync manually since it's a 2-entry map.
const DIAL_CODE: Record<string, string> = { UAE: "+971", SA: "+966" };
function stripDialCode(phone: string | null | undefined): string {
  if (!phone) return "";
  const known = Object.values(DIAL_CODE).find((code) => phone.startsWith(code));
  return known ? phone.slice(known.length) : phone.replace(/^\+/, "");
}

type TranslateFn = (key: MessageKey) => string;

const makeAddressSchema = (t: TranslateFn, zoneRequired: boolean) =>
  z.object({
    label: z.string().optional(),
    fullName: z.string().min(1, t("validation.required")),
    phone: z.string().min(4, t("validation.required")),
    area: z.string().min(1, t("validation.required")),
    deliveryZoneId: zoneRequired
      ? z.string().min(1, t("validation.required"))
      : z.string().optional(),
    isDefault: z.boolean().optional(),
  });

type FormValues = z.infer<ReturnType<typeof makeAddressSchema>>;

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
          {addresses.map((a) => {
            // Legacy addresses saved before this feature has no `area` — fall
            // back to the old street/city line so nothing renders blank.
            const locationLine = a.area
              ? `${a.area}${a.deliveryZone ? `, ${a.deliveryZone.name}` : ""}`
              : `${a.streetAddress}${a.apartment ? `, ${a.apartment}` : ""}, ${a.city}`;
            return (
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
                <p className="mt-2 text-sm text-ink-700 wrap-break-word">{locationLine}</p>
              </div>
            );
          })}
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
  const { t, locale: uiLocale } = useT();
  const { countryCode } = useCurrency();
  const regionCode = countryCode;
  const dialCode = DIAL_CODE[regionCode] ?? "";

  const zonesQuery = useQuery({
    queryKey: queryKeys.deliveryZones.list(regionCode),
    queryFn: () => deliveryZonesApi.list(regionCode),
    enabled: Boolean(regionCode) && open,
  });
  const zones = zonesQuery.data ?? [];
  const zoneRequired = !zonesQuery.isPending && zones.length > 0;

  const emptyDefaults: FormValues = useMemo(
    () => ({
      label: "",
      fullName: "",
      phone: "",
      area: "",
      deliveryZoneId: "",
      isDefault: false,
    }),
    []
  );

  const schema = useMemo(() => makeAddressSchema(t, zoneRequired), [t, zoneRequired]);

  const initialValues: FormValues | undefined = initial
    ? {
        label: initial.label ?? "",
        fullName: initial.fullName,
        phone: stripDialCode(initial.phone),
        area: initial.area ?? "",
        deliveryZoneId: initial.deliveryZoneId ?? "",
        isDefault: initial.isDefault,
      }
    : undefined;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? emptyDefaults,
    values: initialValues ?? emptyDefaults,
  });

  // Reset to a blank form the next time this modal opens for "add new" (avoids
  // showing a just-closed edit's leftover values if the user immediately clicks
  // "Add address" afterward — `values` above only re-syncs for the edit case).
  useEffect(() => {
    if (open && !initial) reset(emptyDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload: ApiAddressCreateInput = {
        label: values.label?.trim() || null,
        fullName: values.fullName.trim(),
        phone: `${dialCode}${values.phone.trim().replace(/[\s-]/g, "")}`,
        area: values.area.trim(),
        deliveryZoneId: values.deliveryZoneId || null,
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
          containerClassName="sm:col-span-2"
          {...register("fullName")}
        />
        <Input
          label={t("checkout.area")}
          placeholder={t("checkout.areaPlaceholder")}
          hint={t("checkout.areaHint")}
          error={errors.area?.message}
          {...register("area")}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="address-zone"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
          >
            {regionCode === "UAE" ? t("checkout.emirate") : t("checkout.province")}
          </label>
          {zonesQuery.isPending ? (
            <div className="flex h-12 items-center rounded-2xl border border-ink-200 px-4">
              <Spinner size="sm" />
            </div>
          ) : zones.length === 0 ? (
            <p className="flex h-12 items-center text-xs text-ink-400">
              {t("checkout.emirateUnavailable")}
            </p>
          ) : (
            <select
              id="address-zone"
              className="h-12 rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-900 focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100"
              {...register("deliveryZoneId")}
            >
              <option value="">
                {regionCode === "UAE" ? t("checkout.selectEmirate") : t("checkout.selectProvince")}
              </option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {uiLocale === "ar" && z.name_ar ? z.name_ar : z.name}
                </option>
              ))}
            </select>
          )}
          {errors.deliveryZoneId?.message ? (
            <p className="text-xs text-bloom-700">{errors.deliveryZoneId.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="address-phone"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
          >
            {t("checkout.phone")}
          </label>
          <div
            className={
              "flex h-12 items-center rounded-2xl border bg-white transition-all " +
              (errors.phone
                ? "border-(--color-danger)"
                : "border-ink-200 focus-within:border-bloom-400 focus-within:ring-4 focus-within:ring-bloom-100")
            }
          >
            <span className="flex h-full items-center border-e border-ink-200 px-3 text-sm font-medium text-ink-700">
              {dialCode}
            </span>
            <input
              id="address-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              className="h-full flex-1 rounded-e-2xl bg-transparent px-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              onKeyDown={(e) => {
                const allowed = ["Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight","Home","End"];
                if (!allowed.includes(e.key) && !/^[0-9\s-]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                }
              }}
              {...register("phone")}
            />
          </div>
          {errors.phone?.message ? (
            <p className="text-xs text-bloom-700">{errors.phone.message}</p>
          ) : null}
        </div>

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
