"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Container,
  Section,
  Input,
  Textarea,
  Button,
  Divider,
  Card,
  CurrencyAmount,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@/components/ui";
import { Spinner } from "@/components/ui/Loader";
import {
  ChevronRight,
  ChevronDown,
  ShieldIcon,
  TruckIcon,
  CheckIcon,
} from "@/components/icons";
import { cartApi } from "@/features/cart/api/cart.api";
import { addressesApi } from "@/features/addresses/api/addresses.api";
import { ordersApi } from "@/features/orders/api/orders.api";
import { promoCodesApi } from "@/features/promo-codes/api/promo-codes.api";
import { vatApi } from "@/features/vat/api/vat.api";
import { regionsApi } from "@/features/regions/api/regions.api";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { queryKeys } from "@/services/queryKeys";
import { useCart } from "@/features/cart/hooks/useCart";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storage } from "@/lib/storage";
import { cn } from "@/lib/cn";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/services/http";
import { formatCurrency } from "@/lib/format";
import { useAppSelector } from "@/store";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";
import type { ApiAddress } from "@/features/addresses/types";
import type { ApiPromoValidationResult } from "@/features/promo-codes/types";

type TranslateFn = (
  key: MessageKey,
  vars?: Record<string, string | number>
) => string;

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Delivery region determines the dial code shown next to the phone field —
// mirrors the header's locked country/city precedent (never independently
// user-editable here). Combined with the typed digits into one E.164-ish
// string sent to the existing `phone` field (no backend schema change).
const DIAL_CODE: Record<string, string> = { UAE: "+971", SA: "+966" };

// The profile's saved phone (used to prefill this field) is already a full
// E.164 string (e.g. "+971501234567") — strip any known dial code before
// prefilling so submit doesn't double-prefix it into "+971+971501234567".
function stripDialCode(phone: string | null | undefined): string {
  if (!phone) return "";
  const known = Object.values(DIAL_CODE).find((code) => phone.startsWith(code));
  return known ? phone.slice(known.length) : phone.replace(/^\+/, "");
}

const makeNewAddressSchema = (t: TranslateFn, zoneRequired: boolean) =>
  z.object({
    fullName: z.string().min(1, t("validation.required")),
    area: z.string().min(1, t("validation.required")),
    deliveryZoneId: zoneRequired
      ? z.string().min(1, t("validation.required"))
      : z.string().optional(),
    phone: z.string().min(4, t("validation.required")),
    // Guests only (optional): enables the receipt email + links the order on
    // sign-up. Empty string is allowed; a non-empty value must be a valid email.
    email: z
      .string()
      .email(t("validation.email"))
      .optional()
      .or(z.literal("")),
  });

type NewAddressValues = z.infer<ReturnType<typeof makeNewAddressSchema>>;

export function CheckoutClient() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cart = useCart();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthed = useAppSelector((s) => s.auth.status === "authenticated");
  const hydrated = useIsHydrated();
  // A returning customer has a token in storage but auth may still be hydrating
  // (AuthHydrator re-fetches the profile on load). Hold the checkout until that
  // resolves so we don't flash the guest form at a logged-in user. Guests (no
  // token) fall straight through to the guest flow.
  const authHydrating =
    hydrated && !isAuthed && Boolean(storage.get<string>(STORAGE_KEYS.authToken));
  const { currency, locale, countryName, countryCode } = useCurrency();
  const regionCode = countryCode;
  const dialCode = DIAL_CODE[regionCode] ?? "";
  const { t, tc } = useT();

  const [explicitSelection, setExplicitSelection] = useState<
    string | "new" | null
  >(null);
  const [orderMessage, setOrderMessage] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] =
    useState<ApiPromoValidationResult | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Saved addresses are an authenticated-only feature (GET /user/addresses).
  // Guests always use the inline form.
  const addressesQuery = useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () => addressesApi.list(),
    enabled: isAuthed,
  });

  const defaultAddressId: string | "new" | null = (() => {
    if (!isAuthed) return "new";
    if (!addressesQuery.data) return null;
    if (addressesQuery.data.length === 0) return "new";
    const def =
      addressesQuery.data.find((a) => a.isDefault) ?? addressesQuery.data[0];
    return def.id;
  })();

  // Guests can only ever use the inline "new address" form.
  const selectedAddressId = isAuthed
    ? explicitSelection ?? defaultAddressId
    : "new";

  // The Emirate-style dropdown, scoped to the current delivery region. A
  // region may legitimately have zero zones configured — the field is then
  // skipped entirely rather than blocking checkout on an empty required select.
  const zonesQuery = useQuery({
    queryKey: queryKeys.deliveryZones.list(regionCode),
    queryFn: () => deliveryZonesApi.list(regionCode),
    enabled: Boolean(regionCode),
  });
  const zones = zonesQuery.data ?? [];
  const zoneRequired = !zonesQuery.isPending && zones.length > 0;

  const newAddressSchema = useMemo(
    () => makeNewAddressSchema(t, zoneRequired),
    [t, zoneRequired]
  );

  const {
    register: regNewAddr,
    formState: { errors: newAddrErrors },
    getValues: getNewAddrValues,
    trigger: triggerNewAddr,
    setValue: setNewAddrValue,
    watch: watchNewAddr,
  } = useForm<NewAddressValues>({
    resolver: zodResolver(newAddressSchema),
    defaultValues: {
      fullName: user
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
        : "",
      area: "",
      deliveryZoneId: "",
      phone: stripDialCode(user?.phone),
      email: user?.email ?? "",
    },
  });

  // A stale zone selection from a since-switched delivery region must never be
  // silently submitted — the backend rejects it anyway, but clearing it here
  // avoids a confusing "delivery zone not found" error for a field the user
  // never touched this session.
  useEffect(() => {
    setNewAddrValue("deliveryZoneId", "");
  }, [regionCode, setNewAddrValue]);

  const zoneValue = watchNewAddr("deliveryZoneId") ?? "";
  const onZoneChange = (id: string) =>
    setNewAddrValue("deliveryZoneId", id, { shouldValidate: true });

  const validatePromo = useMutation({
    mutationFn: (code: string) =>
      promoCodesApi.validate({
        code: code.trim(),
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    onSuccess: (result) => {
      // A resolved validate call means the code is valid and applied — the
      // backend 400/404s (→ onError) with the reason when it isn't.
      setPromoResult(result);
      setPromoError(null);
      toast.success({
        title: t("checkout.promoApplied"),
        description: t("checkout.promoAppliedAmount", {
          amount: formatCurrency(result.discountAmount, currency, locale),
        }),
      });
    },
    onError: (err) => {
      setPromoResult(null);
      // Surface the backend's specific reason (min order not met, expired,
      // new-users-only, per-user limit, …) rather than a generic message.
      setPromoError(
        err instanceof ApiError ? err.message : t("checkout.promoError")
      );
    },
  });

  const subtotal = cart.subtotal;
  const discount = promoResult?.discountAmount ?? 0;

  // Flat shipping fee for the current delivery region — mirrors the same
  // subtotal→discount→VAT→shipping pipeline order.service.js computes
  // server-side, so this preview matches the real order total exactly.
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });
  const currentRegion = regionsQuery.data?.find((r) => r.code === regionCode);
  const shipping =
    currentRegion?.shippingFlatRate != null
      ? Number(currentRegion.shippingFlatRate)
      : 0;

  // VAT preview for the current region. The public endpoint intentionally omits the
  // SPECIFIC_PRODUCTS/SPECIFIC_CATEGORIES scope lists (that's catalog-scoping data, not
  // something the storefront needs), so an exact preview is only possible for ALL_PRODUCTS —
  // the common case. For a scoped config we show a disclaimer instead of guessing a number;
  // the order response after placing it always has the server-trusted, exact breakdown.
  const vatQuery = useQuery({
    queryKey: queryKeys.vat.public(),
    queryFn: () => vatApi.getPublic(),
    staleTime: 5 * 60_000,
  });
  const vatConfig = vatQuery.data;
  const vatKnownScope = vatConfig?.appliesTo === "ALL_PRODUCTS";
  const vatActive = Boolean(vatConfig?.enabled && vatConfig.ratePercent > 0);
  const taxableNet = Math.max(0, subtotal - discount);
  const vatAmount =
    vatActive && vatKnownScope
      ? vatConfig!.inclusive
        ? round2(taxableNet - taxableNet / (1 + vatConfig!.ratePercent / 100))
        : round2(taxableNet * (vatConfig!.ratePercent / 100))
      : 0;
  const vatAdds = vatActive && vatKnownScope && !vatConfig!.inclusive && vatAmount > 0;
  const vatUncertain = vatActive && !vatKnownScope;
  const total = taxableNet + (vatAdds ? vatAmount : 0) + shipping;

  const syncCart = async () => {
    if (cart.items.length === 0) throw new Error(t("checkout.cartEmptyError"));
    await cartApi.clear();
    // Safe to run concurrently: clear() above guarantees the server cart
    // exists and is empty, so each add() below targets a distinct product —
    // no shared row for the requests to race on.
    await Promise.all(
      cart.items.map((item) =>
        cartApi.add({
          productId: item.productId,
          quantity: item.quantity,
          message: item.message ?? undefined,
          selectedOptions: item.selectedOptions ?? undefined,
          giftCardSelected: item.giftCardSelected,
          customName: item.customName ?? undefined,
        })
      )
    );
    if (orderMessage.trim()) {
      await cartApi.setOrderMessage(orderMessage.trim());
    }
  };

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      let resolvedAddressId: string | undefined;
      let inlineAddress: NewAddressValues | undefined;

      if (selectedAddressId === "new") {
        const ok = await triggerNewAddr();
        if (!ok) throw new Error(t("checkout.completeAddress"));
        inlineAddress = getNewAddrValues();
      } else if (selectedAddressId) {
        resolvedAddressId = selectedAddressId;
      } else {
        throw new Error(t("checkout.chooseAddress"));
      }

      const shippingAddress = inlineAddress
        ? {
            fullName: inlineAddress.fullName,
            // Strip the spaces/dashes the input allows for readability — the
            // stored value should be one clean digit string, not "+97150 123-4567".
            phone: `${dialCode}${inlineAddress.phone.replace(/[\s-]/g, "")}`,
            area: inlineAddress.area,
            deliveryZoneId: inlineAddress.deliveryZoneId || undefined,
          }
        : undefined;

      if (!isAuthed) {
        // Guest: no server cart — send the local cart items inline. COD only.
        if (cart.items.length === 0) throw new Error(t("checkout.cartEmptyError"));
        return ordersApi.guestCheckout({
          items: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            message: i.message ?? null,
            selectedOptions: i.selectedOptions ?? undefined,
            giftCardSelected: i.giftCardSelected,
            customName: i.customName ?? undefined,
          })),
          // Guests always fill the inline form, so shippingAddress is defined.
          shippingAddress: shippingAddress!,
          email: inlineAddress?.email?.trim() || undefined,
          orderMessage: orderMessage.trim() || undefined,
          promoCode: promoResult ? promoCode.trim() : undefined,
        });
      }

      // Authenticated: mirror the local cart to the server cart, then check out.
      await syncCart();
      return ordersApi.checkout({
        addressId: resolvedAddressId,
        shippingAddress,
        paymentMethod: "COD",
        promoCode: promoResult ? promoCode.trim() : undefined,
      });
    },
    onSuccess: (order) => {
      cart.clear();
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      if (!isAuthed) {
        // Stash the returned order so the public success page can render it
        // without an authenticated GET /orders/:id, then show the guest
        // thank-you + account-creation experience.
        try {
          sessionStorage.setItem(STORAGE_KEYS.guestOrder, JSON.stringify(order));
        } catch {
          /* sessionStorage unavailable — the success page falls back gracefully */
        }
        router.push(`${ROUTES.orderSuccess}?guest=1`);
        return;
      }

      // Seed the cache so the confirmation/receipt page paints instantly from
      // the order we just received instead of refetching (or showing nothing).
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      router.push(`${ROUTES.orderSuccess}?id=${order.id}`);
    },
    onError: (err) => {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : t("checkout.orderFailed");
      setSubmitError(message);
      toast.error({ title: t("checkout.checkoutFailed"), description: message });
    },
  });

  const placeOrder = () => {
    setSubmitError(null);
    placeOrderMutation.mutate();
  };

  // Hold while a returning customer's session is still hydrating.
  if (authHydrating) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Empty cart guard
  if (cart.items.length === 0) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <h1 className="font-display text-4xl text-ink-900">
          {t("checkout.emptyTitle")}
        </h1>
        <p className="mt-2 text-ink-500">
          {t("checkout.emptyBody")}
        </p>
        <Link
          href={ROUTES.shop}
          className="mt-6 inline-flex h-12 items-center rounded-full bg-bloom-600 px-6 text-base font-medium text-white shadow-(--shadow-bloom) hover:bg-bloom-700"
        >
          {t("common.browseBoutique")}
        </Link>
      </Container>
    );
  }

  return (
    <>
      <section className="border-b border-ink-100 bg-cream-50 pt-12 pb-8 lg:pt-16">
        <Container>
          <nav
            className="flex items-center gap-1 text-xs text-ink-500"
            aria-label={t("a11y.breadcrumb")}
          >
            <Link href={ROUTES.cart} className="hover:text-ink-900">
              {t("nav.cart")}
            </Link>
            <ChevronRight size={12} className="rtl:-scale-x-100" />
            <span className="text-ink-900">{t("checkout.title")}</span>
          </nav>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {t("checkout.finalStepLabel")}
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
            {t("checkout.title")}
          </h1>
          <p className="mt-2 text-ink-500">
            {`${t("checkout.composed1")} ${tc(cart.itemCount, "units.itemOne", "units.itemOther")} ${t("checkout.composed2", { country: countryName })}`}
          </p>
        </Container>
      </section>

      <Section spacing="md">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <BillingShippingCard
            isAuthed={isAuthed}
            addresses={addressesQuery.data}
            isLoading={isAuthed && addressesQuery.isPending}
            selectedAddressId={selectedAddressId}
            onSelect={setExplicitSelection}
            regNewAddr={regNewAddr}
            newAddrErrors={newAddrErrors}
            dialCode={dialCode}
            regionCode={regionCode}
            zones={zones}
            zonesLoading={zonesQuery.isPending}
            zoneValue={zoneValue}
            onZoneChange={onZoneChange}
            orderMessage={orderMessage}
            onOrderMessageChange={setOrderMessage}
            submitError={submitError}
          />

          <OrderReviewCard
            cartItems={cart.items}
            subtotal={subtotal}
            shipping={shipping}
            discount={discount}
            total={total}
            vatAmount={vatAmount}
            vatRatePercent={vatConfig?.ratePercent ?? null}
            vatInclusive={Boolean(vatConfig?.inclusive)}
            vatAdds={vatAdds}
            vatUncertain={vatUncertain}
            couponOpen={couponOpen}
            onToggleCoupon={() => setCouponOpen((v) => !v)}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            promoResult={promoResult}
            promoError={promoError}
            onApply={() =>
              promoCode.trim() && validatePromo.mutate(promoCode)
            }
            applying={validatePromo.isPending}
            onClear={() => {
              setPromoCode("");
              setPromoResult(null);
              setPromoError(null);
            }}
            onPlaceOrder={placeOrder}
            isPlacing={placeOrderMutation.isPending}
          />
        </div>
      </Section>
    </>
  );
}

// ---- Billing & shipping (left column) --------------------------------------

interface DeliveryZoneOption {
  id: string;
  name: string;
  name_ar: string | null;
}

/** Emirate/province picker — the site's standard `Menu` dropdown (same
 * primitive as the shop's sort-by control) instead of a native `<select>`,
 * so it matches how every other dropdown in the storefront looks/behaves. */
function ZoneMenu({
  zones,
  value,
  onChange,
  locale,
  placeholder,
  hasError,
}: {
  zones: DeliveryZoneOption[];
  value: string;
  onChange: (id: string) => void;
  locale: string;
  placeholder: string;
  hasError: boolean;
}) {
  const selected = zones.find((z) => z.id === value);
  const label = selected
    ? locale === "ar" && selected.name_ar
      ? selected.name_ar
      : selected.name
    : placeholder;

  return (
    <Menu className="w-full">
      <MenuTrigger
        label={placeholder}
        className={cn(
          "group flex h-12 w-full items-center justify-between gap-2 rounded-2xl border bg-white px-4 text-start text-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bloom-100",
          hasError
            ? "border-(--color-danger)"
            : "border-ink-200 hover:border-ink-300 focus-visible:border-bloom-400",
          selected ? "text-ink-900" : "text-ink-400"
        )}
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          size={14}
          className="shrink-0 text-ink-400 transition-transform duration-200 group-aria-expanded:rotate-180"
        />
      </MenuTrigger>
      <MenuContent align="start" className="w-[calc(100%-0.5rem)] sm:w-64">
        <div className="max-h-72 overflow-y-auto">
          {zones.map((z) => {
            const active = z.id === value;
            const zoneLabel = locale === "ar" && z.name_ar ? z.name_ar : z.name;
            return (
              <MenuItem
                key={z.id}
                onSelect={() => onChange(z.id)}
                trailing={active ? <CheckIcon size={14} className="text-bloom-600" /> : undefined}
                className={active ? "font-semibold text-ink-900" : undefined}
              >
                {zoneLabel}
              </MenuItem>
            );
          })}
        </div>
      </MenuContent>
    </Menu>
  );
}

interface BillingShippingCardProps {
  isAuthed: boolean;
  addresses: ApiAddress[] | undefined;
  isLoading: boolean;
  selectedAddressId: string | "new" | null;
  onSelect: (v: string | "new") => void;
  regNewAddr: ReturnType<typeof useForm<NewAddressValues>>["register"];
  newAddrErrors: ReturnType<typeof useForm<NewAddressValues>>["formState"]["errors"];
  dialCode: string;
  regionCode: string;
  zones: DeliveryZoneOption[];
  zonesLoading: boolean;
  zoneValue: string;
  onZoneChange: (id: string) => void;
  orderMessage: string;
  onOrderMessageChange: (v: string) => void;
  submitError: string | null;
}

function BillingShippingCard({
  isAuthed,
  addresses,
  isLoading,
  selectedAddressId,
  onSelect,
  regNewAddr,
  newAddrErrors,
  dialCode,
  regionCode,
  zones,
  zonesLoading,
  zoneValue,
  onZoneChange,
  orderMessage,
  onOrderMessageChange,
  submitError,
}: BillingShippingCardProps) {
  const { t, locale: uiLocale } = useT();
  return (
    <Card variant="flat" padding="lg" className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bloom-700">
          {t("checkout.yourDetails")}
        </p>
        <h2 className="mt-1 font-display text-2xl text-ink-900">
          {t("checkout.billingShipping")}
        </h2>
      </header>

      {/* Saved addresses + "new address" chooser — authenticated customers only. */}
      {isAuthed ? (
        isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {addresses?.map((a) => (
              <AddressOption
                key={a.id}
                address={a}
                selected={selectedAddressId === a.id}
                onSelect={() => onSelect(a.id)}
              />
            ))}
            <button
              type="button"
              onClick={() => onSelect("new")}
              className={
                "flex items-start gap-3 rounded-2xl border p-4 text-start transition-colors " +
                (selectedAddressId === "new"
                  ? "border-bloom-500 bg-bloom-50"
                  : "border-ink-200 hover:border-ink-300")
              }
            >
              <span
                className={
                  "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border " +
                  (selectedAddressId === "new"
                    ? "border-bloom-600 bg-bloom-600 text-white"
                    : "border-ink-300")
                }
              >
                {selectedAddressId === "new" ? <CheckIcon size={10} /> : null}
              </span>
              <span>
                <span className="block font-medium text-ink-900">
                  {t("address.newAddress")}
                </span>
                <span className="block text-xs text-ink-500">
                  {t("address.newAddressHint")}
                </span>
              </span>
            </button>
          </div>
        )
      ) : null}

      {selectedAddressId === "new" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("checkout.fullName")}
            autoComplete="name"
            error={newAddrErrors.fullName?.message}
            containerClassName="sm:col-span-2"
            {...regNewAddr("fullName")}
          />
          <Input
            label={t("checkout.area")}
            placeholder={t("checkout.areaPlaceholder")}
            hint={t("checkout.areaHint")}
            error={newAddrErrors.area?.message}
            {...regNewAddr("area")}
          />
          <div className="flex flex-col gap-1.5">
            <label
              id="checkout-zone-label"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
            >
              {regionCode === "UAE" ? t("checkout.emirate") : t("checkout.province")}
            </label>
            {zonesLoading ? (
              <div className="flex h-12 w-full items-center rounded-2xl border border-ink-200 px-4">
                <Spinner size="sm" />
              </div>
            ) : zones.length === 0 ? (
              // The current region has no zones configured — skip the field
              // entirely rather than force a required-but-empty select.
              <p className="flex h-12 items-center text-xs text-ink-400">
                {t("checkout.emirateUnavailable")}
              </p>
            ) : (
              <ZoneMenu
                zones={zones}
                value={zoneValue}
                onChange={onZoneChange}
                locale={uiLocale}
                placeholder={
                  regionCode === "UAE" ? t("checkout.selectEmirate") : t("checkout.selectProvince")
                }
                hasError={Boolean(newAddrErrors.deliveryZoneId?.message)}
              />
            )}
            {newAddrErrors.deliveryZoneId?.message ? (
              <p className="text-xs text-bloom-700">
                {newAddrErrors.deliveryZoneId.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="checkout-phone"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
            >
              {t("checkout.phone")}
            </label>
            <div
              className={
                "flex h-12 items-center rounded-2xl border bg-white transition-all " +
                (newAddrErrors.phone
                  ? "border-(--color-danger)"
                  : "border-ink-200 focus-within:border-bloom-400 focus-within:ring-4 focus-within:ring-bloom-100")
              }
            >
              <span className="flex h-full items-center border-e border-ink-200 px-3 text-sm font-medium text-ink-700">
                {dialCode}
              </span>
              <input
                id="checkout-phone"
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
                {...regNewAddr("phone")}
              />
            </div>
            {newAddrErrors.phone?.message ? (
              <p className="text-xs text-bloom-700">{newAddrErrors.phone.message}</p>
            ) : null}
          </div>
          {/* Email — guests only; optional but enables receipt + order linking. */}
          {!isAuthed ? (
            <Input
              label={t("checkout.emailOptional")}
              type="email"
              autoComplete="email"
              hint={t("checkout.emailHint")}
              error={newAddrErrors.email?.message}
              containerClassName="sm:col-span-2"
              {...regNewAddr("email")}
            />
          ) : null}
        </div>
      ) : null}

      {/* Offer sign-in to guests — optional, never blocks checkout. */}
      {!isAuthed ? (
        <p className="text-sm text-ink-500">
          {t("checkout.haveAccount")}{" "}
          <Link
            href={`${ROUTES.login}?next=${encodeURIComponent(ROUTES.checkout)}`}
            className="font-medium text-bloom-700 underline underline-offset-2 hover:text-bloom-800"
          >
            {t("checkout.signInToCheckout")}
          </Link>
        </p>
      ) : null}

      <Divider />

      <div>
        <h3 className="font-display text-lg text-ink-900">{t("checkout.additionalInfo")}</h3>
        <p className="mt-1 text-sm text-ink-500">{t("checkout.orderNoteHint")}</p>
        <Textarea
          rows={3}
          placeholder={t("checkout.orderNotePlaceholder")}
          value={orderMessage}
          onChange={(e) => onOrderMessageChange(e.target.value)}
          className="mt-3"
        />
      </div>

      {submitError ? (
        <div
          role="alert"
          className="rounded-lg border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700"
        >
          {submitError}
        </div>
      ) : null}
    </Card>
  );
}

function AddressOption({
  address,
  selected,
  onSelect,
}: {
  address: ApiAddress;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useT();
  const locationLine = address.area
    ? `${address.area}${address.deliveryZone ? `, ${address.deliveryZone.name}` : ""}`
    : `${address.streetAddress}${address.apartment ? `, ${address.apartment}` : ""}, ${address.city}`;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "flex items-start gap-3 rounded-2xl border p-4 text-start transition-colors " +
        (selected
          ? "border-bloom-500 bg-bloom-50"
          : "border-ink-200 hover:border-ink-300")
      }
    >
      <span
        className={
          "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border " +
          (selected
            ? "border-bloom-600 bg-bloom-600 text-white"
            : "border-ink-300")
        }
      >
        {selected ? <CheckIcon size={10} /> : null}
      </span>
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium text-ink-900">
            {address.label || address.fullName}
          </span>
          {address.isDefault ? (
            <span className="rounded-full bg-bloom-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-bloom-700">
              {t("common.default")}
            </span>
          ) : null}
        </span>
        <span className="block text-sm text-ink-700">{address.fullName}</span>
        <span className="block text-xs text-ink-500">{locationLine}</span>
      </span>
    </button>
  );
}

// ---- Order review (right column): items, totals, payment, place order -----

interface OrderReviewCardProps {
  cartItems: ReturnType<typeof useCart>["items"];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  vatAmount: number;
  vatRatePercent: number | null;
  vatInclusive: boolean;
  vatAdds: boolean;
  vatUncertain: boolean;
  couponOpen: boolean;
  onToggleCoupon: () => void;
  promoCode: string;
  setPromoCode: (v: string) => void;
  promoResult: ApiPromoValidationResult | null;
  promoError: string | null;
  onApply: () => void;
  applying: boolean;
  onClear: () => void;
  onPlaceOrder: () => void;
  isPlacing: boolean;
}

function OrderReviewCard({
  cartItems,
  subtotal,
  shipping,
  discount,
  total,
  vatAmount,
  vatRatePercent,
  vatInclusive,
  vatAdds,
  vatUncertain,
  couponOpen,
  onToggleCoupon,
  promoCode,
  setPromoCode,
  promoResult,
  promoError,
  onApply,
  applying,
  onClear,
  onPlaceOrder,
  isPlacing,
}: OrderReviewCardProps) {
  const { currency, locale } = useCurrency();
  const { t } = useT();

  return (
    <aside className="flex flex-col gap-4">
      <Card variant="elevated" padding="lg" className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bloom-700">
          {t("checkout.orderReview")}
        </p>
        <h3 className="font-display text-xl text-ink-900">{t("checkout.yourOrder")}</h3>

        <ul className="divide-y divide-ink-100">
          {cartItems.map((item) => (
            <li
              key={item.productId}
              className="flex gap-3 py-3 first:pt-0 last:pb-0"
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-14 w-14 rounded-lg object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-ink-100" />
              )}
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-900">{item.title}</p>
                  <p className="text-xs text-ink-500">{t("common.qty")} {item.quantity}</p>
                  {(item.giftCardSelected || item.customName) && (
                    <p className="truncate text-xs text-bloom-700">
                      {[item.giftCardSelected ? t("product.giftCardBadge") : null, item.customName]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <p className="shrink-0 font-medium tabular-nums">
                  <CurrencyAmount
                    amount={item.unitPrice * item.quantity}
                    currency={currency}
                    locale={locale}
                  />
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Divider />

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-ink-500">
            <span>{t("common.subtotal")}</span>
            <span><CurrencyAmount amount={subtotal} currency={currency} locale={locale} /></span>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between text-ink-500">
              <span>{t("common.discount")}</span>
              <span>
                −<CurrencyAmount amount={discount} currency={currency} locale={locale} />
              </span>
            </div>
          ) : null}
          {vatRatePercent != null && vatAmount > 0 ? (
            <div className="flex justify-between text-ink-500">
              <span>
                {vatInclusive
                  ? t("order.vatIncludedLabel", { rate: vatRatePercent })
                  : t("order.vatLabel", { rate: vatRatePercent })}
              </span>
              <span>
                {vatAdds ? "+ " : ""}
                <CurrencyAmount amount={vatAmount} currency={currency} locale={locale} />
              </span>
            </div>
          ) : null}
          <div className="flex justify-between text-ink-500">
            <span>{t("checkout.shipment")}</span>
            <span>
              {shipping === 0 ? (
                t("common.free")
              ) : (
                <CurrencyAmount amount={shipping} currency={currency} locale={locale} />
              )}
            </span>
          </div>
          <div className="flex justify-between border-t border-ink-100 pt-2 font-medium text-ink-900">
            <span>{t("common.total")}</span>
            <span><CurrencyAmount amount={total} currency={currency} locale={locale} /></span>
          </div>
          {vatUncertain ? (
            <p className="text-xs text-ink-400">{t("checkout.vatEstimateNote")}</p>
          ) : null}
        </div>

        <Divider />

        {/* Coupon — collapsible, closed by default until the customer opts in. */}
        {promoResult ? (
          <div className="flex items-center justify-between rounded-xl border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700">
            <div>
              <p className="font-semibold uppercase tracking-wider">{promoCode}</p>
              <p className="text-xs">
                {discount > 0
                  ? t("checkout.promoAppliedAmount", {
                      amount: formatCurrency(discount, currency, locale),
                    })
                  : t("checkout.applied")}
              </p>
            </div>
            <button type="button" onClick={onClear} className="text-xs underline">
              {t("common.remove")}
            </button>
          </div>
        ) : couponOpen ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                placeholder={t("checkout.enterCode")}
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm uppercase placeholder:normal-case placeholder:text-ink-400 focus:border-bloom-500 focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onApply}
                isLoading={applying}
              >
                {t("common.apply")}
              </Button>
            </div>
            {promoError ? <p className="text-xs text-bloom-700">{promoError}</p> : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleCoupon}
            className="flex items-center justify-between text-sm text-bloom-700 hover:text-bloom-800"
          >
            <span>
              {t("checkout.haveCoupon")}{" "}
              <span className="font-medium underline underline-offset-2">
                {t("checkout.enterCodeLink")}
              </span>
            </span>
            <ChevronDown size={14} />
          </button>
        )}
      </Card>

      <Card variant="flat" padding="lg" className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-2xl border border-ink-900 bg-cream-50 p-4">
          <input
            type="radio"
            name="payment"
            defaultChecked
            className="mt-1 h-4 w-4 accent-ink-900"
            readOnly
          />
          <div>
            <p className="font-medium text-ink-900">{t("checkout.cod")}</p>
            <p className="text-sm text-ink-500">{t("checkout.codAvailability")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-sm text-ink-600">
          <p className="inline-flex items-center gap-2">
            <ShieldIcon size={16} className="text-bloom-700" />
            {t("checkout.secureCheckout")}
          </p>
          <p className="inline-flex items-center gap-2">
            <TruckIcon size={16} className="text-bloom-700" />
            {shipping === 0 ? t("cart.freeDelivery") : t("checkout.deliveryNote")}
          </p>
        </div>

        <Button
          type="button"
          size="xl"
          fullWidth
          onClick={onPlaceOrder}
          isLoading={isPlacing}
        >
          {t("checkout.placeOrder")} ·{" "}
          <CurrencyAmount amount={total} currency={currency} locale={locale} />
        </Button>
      </Card>
    </aside>
  );
}
