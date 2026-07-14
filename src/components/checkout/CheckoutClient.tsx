"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "motion/react";
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
} from "@/components/ui";
import { Spinner } from "@/components/ui/Loader";
import {
  ChevronRight,
  ShieldIcon,
  TruckIcon,
  CheckIcon,
} from "@/components/icons";
import { cartApi } from "@/features/cart/api/cart.api";
import { addressesApi } from "@/features/addresses/api/addresses.api";
import { ordersApi } from "@/features/orders/api/orders.api";
import { promoCodesApi } from "@/features/promo-codes/api/promo-codes.api";
import { vatApi } from "@/features/vat/api/vat.api";
import { queryKeys } from "@/services/queryKeys";
import { useCart } from "@/features/cart/hooks/useCart";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { getCountry } from "@/features/location/data";
import { ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storage } from "@/lib/storage";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/services/http";
import { formatCurrency } from "@/lib/format";
import { baseTransition } from "@/lib/motion";
import { useAppSelector } from "@/store";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";
import {
  CheckoutStepper,
  type CheckoutStep,
} from "./CheckoutStepper";
import type { ApiAddress } from "@/features/addresses/types";
import type { ApiPromoValidationResult } from "@/features/promo-codes/types";

type TranslateFn = (
  key: MessageKey,
  vars?: Record<string, string | number>
) => string;

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const makeNewAddressSchema = (t: TranslateFn) =>
  z.object({
    fullName: z.string().min(1, t("validation.required")),
    phone: z.string().min(4, t("validation.required")),
    streetAddress: z.string().min(1, t("validation.required")),
    apartment: z.string().optional(),
    city: z.string().min(1, t("validation.required")),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(2, t("validation.required")),
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
  // The delivery region is chosen once, in the header's "Deliver to" picker
  // (LocationSheet), and lives here in redux. The checkout address form must
  // never diverge from it — country/city below are display-only here and
  // sync automatically whenever the header selection changes.
  const deliveryCity = useAppSelector((s) => s.location.city);
  const { t, tc, locale: uiLocale } = useT();

  // Supported delivery cities for the current market — shown for reference;
  // the actual city is locked to the header's selection (see deliveryCity).
  const country = getCountry(countryCode);
  const cityOptions = useMemo(
    () =>
      country.cities.map((value, i) => ({
        value,
        label: uiLocale === "ar" ? country.citiesAr[i] ?? value : value,
      })),
    [country, uiLocale]
  );

  const newAddressSchema = useMemo(() => makeNewAddressSchema(t), [t]);

  const [step, setStep] = useState<CheckoutStep>("address");
  const [explicitSelection, setExplicitSelection] = useState<
    string | "new" | null
  >(null);
  const [orderMessage, setOrderMessage] = useState("");
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
  const selectedAddress =
    addressesQuery.data?.find((a) => a.id === selectedAddressId) ?? null;

  const {
    register: regNewAddr,
    formState: { errors: newAddrErrors },
    getValues: getNewAddrValues,
    trigger: triggerNewAddr,
    setValue: setNewAddrValue,
  } = useForm<NewAddressValues>({
    resolver: zodResolver(newAddressSchema),
    defaultValues: {
      fullName: user
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
        : "",
      phone: user?.phone ?? "",
      streetAddress: "",
      apartment: "",
      city: deliveryCity,
      state: "",
      postalCode: "",
      country: countryName,
      email: user?.email ?? "",
    },
  });

  // Keep the form's city/country in lockstep with the header's delivery
  // region. defaultValues above only apply on mount, so without this a
  // region switch after the form has rendered would leave these two fields
  // stuck on the stale country/city (they're read-only in the UI precisely
  // because they're meant to always mirror the header, never diverge from it).
  useEffect(() => {
    setNewAddrValue("country", countryName);
    setNewAddrValue("city", deliveryCity);
  }, [countryName, deliveryCity, setNewAddrValue]);

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
  // Backend charges no shipping; order total = items − discount (+ VAT below).
  const shipping = 0;

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
  const total = taxableNet + (vatAdds ? vatAmount : 0);

  const syncCart = async () => {
    if (cart.items.length === 0) throw new Error(t("checkout.cartEmptyError"));
    await cartApi.clear();
    for (const item of cart.items) {
      await cartApi.add({
        productId: item.productId,
        quantity: item.quantity,
      });
    }
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
            phone: inlineAddress.phone,
            streetAddress: inlineAddress.streetAddress,
            apartment: inlineAddress.apartment || null,
            city: inlineAddress.city,
            state: inlineAddress.state || null,
            postalCode: inlineAddress.postalCode || null,
            country: inlineAddress.country,
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

  // ---- Step navigation ------------------------------------------------------
  const goToAddress = () => setStep("address");
  const goToPayment = async () => {
    setSubmitError(null);
    if (selectedAddressId === "new") {
      const ok = await triggerNewAddr();
      if (!ok) {
        setSubmitError(t("checkout.completeAddress"));
        return;
      }
    } else if (!selectedAddressId) {
      setSubmitError(t("checkout.chooseAddress"));
      return;
    }
    setStep("payment");
  };
  const goToSummary = () => {
    setSubmitError(null);
    setStep("summary");
  };
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
  if (cart.items.length === 0 && step !== "confirmation") {
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
            aria-label="Breadcrumb"
          >
            <Link href={ROUTES.cart} className="hover:text-ink-900">
              {t("nav.cart")}
            </Link>
            <ChevronRight size={12} className="rtl:-scale-x-100" />
            <span className="text-ink-900">{t("checkout.title")}</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
            {t("checkout.title")}
          </h1>
          <p className="mt-2 text-ink-500">
            {`${t("checkout.composed1")} ${tc(cart.itemCount, "units.itemOne", "units.itemOther")} ${t("checkout.composed2", { country: countryName })}`}
          </p>
          <div className="mt-6">
            <CheckoutStepper current={step} />
          </div>
        </Container>
      </section>

      <Section spacing="md">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="flex flex-col gap-6">
            {/* Each step swaps via AnimatePresence (mode="wait"): the outgoing
                step fades/rises out, the incoming one fades/rises in. Keyed by
                `step`; vertical-only motion keeps it RTL-safe. */}
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={baseTransition}
                className="flex flex-col gap-6"
              >
                {step === "address" && (
                  <AddressStep
                    isAuthed={isAuthed}
                    addresses={addressesQuery.data}
                    isLoading={isAuthed && addressesQuery.isPending}
                    selectedAddressId={selectedAddressId}
                    onSelect={setExplicitSelection}
                    regNewAddr={regNewAddr}
                    newAddrErrors={newAddrErrors}
                    cityOptions={cityOptions}
                    submitError={submitError}
                    onContinue={goToPayment}
                  />
                )}

                {step === "payment" && (
                  <PaymentStep
                    orderMessage={orderMessage}
                    onOrderMessageChange={setOrderMessage}
                    onBack={goToAddress}
                    onContinue={goToSummary}
                    submitError={submitError}
                  />
                )}

                {step === "summary" && (
                  <SummaryStep
                    cartItems={cart.items}
                    orderMessage={orderMessage}
                    selectedAddress={selectedAddress}
                    inlineAddressValues={
                      selectedAddressId === "new" ? getNewAddrValues() : null
                    }
                    onBack={() => setStep("payment")}
                    onPlaceOrder={placeOrder}
                    isPlacing={placeOrderMutation.isPending}
                    submitError={submitError}
                    total={total}
                  />
                )}

                {step === "confirmation" && <ConfirmationStep />}
              </m.div>
            </AnimatePresence>
          </div>

          <CheckoutSummary
            subtotal={subtotal}
            shipping={shipping}
            discount={discount}
            total={total}
            vatAmount={vatAmount}
            vatRatePercent={vatConfig?.ratePercent ?? null}
            vatInclusive={Boolean(vatConfig?.inclusive)}
            vatAdds={vatAdds}
            vatUncertain={vatUncertain}
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
          />
        </div>
      </Section>
    </>
  );
}

// ---- Step 1: Address --------------------------------------------------------

interface CityOption {
  value: string;
  label: string;
}

interface AddressStepProps {
  isAuthed: boolean;
  addresses: ApiAddress[] | undefined;
  isLoading: boolean;
  selectedAddressId: string | "new" | null;
  onSelect: (v: string | "new") => void;
  regNewAddr: ReturnType<
    typeof useForm<NewAddressValues>
  >["register"];
  newAddrErrors: ReturnType<
    typeof useForm<NewAddressValues>
  >["formState"]["errors"];
  cityOptions: CityOption[];
  submitError: string | null;
  onContinue: () => void;
}

function AddressStep({
  isAuthed,
  addresses,
  isLoading,
  selectedAddressId,
  onSelect,
  regNewAddr,
  newAddrErrors,
  cityOptions,
  submitError,
  onContinue,
}: AddressStepProps) {
  const { t } = useT();
  return (
    <Card variant="flat" padding="lg" className="flex flex-col gap-5">
      <header>
        <h2 className="font-display text-2xl text-ink-900">
          {isAuthed
            ? t("checkout.deliveryHeading")
            : t("checkout.guestDeliveryHeading")}
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          {isAuthed
            ? t("checkout.deliverySubtitle")
            : t("checkout.guestDeliverySubtitle")}
        </p>
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
            {...regNewAddr("fullName")}
          />
          <Input
            label={t("checkout.phone")}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            error={newAddrErrors.phone?.message}
            onKeyDown={(e) => {
              const allowed = ["Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight","Home","End"];
              if (!allowed.includes(e.key) && !/^[0-9+\s()\-]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
              }
            }}
            {...regNewAddr("phone")}
          />
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
          <Input
            label={t("checkout.streetAddress")}
            autoComplete="address-line1"
            error={newAddrErrors.streetAddress?.message}
            containerClassName="sm:col-span-2"
            {...regNewAddr("streetAddress")}
          />
          <Input
            label={t("checkout.apartment")}
            autoComplete="address-line2"
            {...regNewAddr("apartment")}
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="checkout-city"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
            >
              {t("checkout.city")}
            </label>
            {/* City/country are set from the header's "Deliver to" picker, not
                edited here — locking them keeps the address, catalog region,
                and totals (VAT, currency) all pointed at the same place. */}
            <select
              id="checkout-city"
              disabled
              aria-readonly="true"
              className="h-12 cursor-not-allowed rounded-2xl border border-ink-200 bg-ink-50 px-4 text-sm text-ink-500 focus:outline-none"
              {...regNewAddr("city")}
            >
              {cityOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {newAddrErrors.city?.message ? (
              <p className="text-xs text-bloom-700">
                {newAddrErrors.city.message}
              </p>
            ) : null}
          </div>
          <Input label={t("address.stateRegion")} {...regNewAddr("state")} />
          <Input label={t("address.postalCode")} {...regNewAddr("postalCode")} />
          <Input
            label={t("checkout.country")}
            autoComplete="country-name"
            readOnly
            aria-readonly="true"
            error={newAddrErrors.country?.message}
            containerClassName="sm:col-span-2"
            {...regNewAddr("country")}
          />
          <p className="-mt-1 text-xs text-ink-400 sm:col-span-2">
            {t("checkout.locationLockedHint")}
          </p>
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

      {submitError ? (
        <div
          role="alert"
          className="rounded-lg border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700"
        >
          {submitError}
        </div>
      ) : null}

      <div className="flex justify-end pt-2">
        <Button type="button" size="lg" onClick={onContinue}>
          {t("checkout.continueToPayment")}
        </Button>
      </div>
    </Card>
  );
}

// ---- Step 2: Payment --------------------------------------------------------

interface PaymentStepProps {
  orderMessage: string;
  onOrderMessageChange: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
  submitError: string | null;
}

function PaymentStep({
  orderMessage,
  onOrderMessageChange,
  onBack,
  onContinue,
  submitError,
}: PaymentStepProps) {
  const { t } = useT();
  return (
    <>
      <Card variant="flat" padding="lg" className="flex flex-col gap-5">
        <header>
          <h2 className="font-display text-2xl text-ink-900">{t("checkout.payment")}</h2>
          <p className="mt-1 text-sm text-ink-500">
            {t("checkout.codHint")}
          </p>
        </header>
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
            <p className="text-sm text-ink-500">
              {t("checkout.codAvailability")}
            </p>
          </div>
        </div>
      </Card>

      <Card variant="flat" padding="lg" className="flex flex-col gap-3">
        <header>
          <h2 className="font-display text-2xl text-ink-900">
            {t("checkout.orderNote")}
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {t("checkout.orderNoteHint")}
          </p>
        </header>
        <Textarea
          rows={3}
          placeholder={t("checkout.orderNotePlaceholder")}
          value={orderMessage}
          onChange={(e) => onOrderMessageChange(e.target.value)}
        />
      </Card>

      {submitError ? (
        <div
          role="alert"
          className="rounded-lg border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700"
        >
          {submitError}
        </div>
      ) : null}

      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          {t("common.back")}
        </Button>
        <Button type="button" size="lg" onClick={onContinue}>
          {t("checkout.reviewOrder")}
        </Button>
      </div>
    </>
  );
}

// ---- Step 3: Summary --------------------------------------------------------

interface SummaryStepProps {
  cartItems: ReturnType<typeof useCart>["items"];
  orderMessage: string;
  selectedAddress: ApiAddress | null;
  inlineAddressValues: NewAddressValues | null;
  onBack: () => void;
  onPlaceOrder: () => void;
  isPlacing: boolean;
  submitError: string | null;
  total: number;
}

function SummaryStep({
  cartItems,
  orderMessage,
  selectedAddress,
  inlineAddressValues,
  onBack,
  onPlaceOrder,
  isPlacing,
  submitError,
  total,
}: SummaryStepProps) {
  const { currency, locale } = useCurrency();
  const { t } = useT();
  const addressLine = selectedAddress
    ? `${selectedAddress.fullName} · ${selectedAddress.streetAddress}${
        selectedAddress.apartment ? `, ${selectedAddress.apartment}` : ""
      }, ${selectedAddress.city}, ${selectedAddress.country}`
    : inlineAddressValues
    ? `${inlineAddressValues.fullName} · ${inlineAddressValues.streetAddress}${
        inlineAddressValues.apartment
          ? `, ${inlineAddressValues.apartment}`
          : ""
      }, ${inlineAddressValues.city}, ${inlineAddressValues.country}`
    : "—";

  return (
    <Card variant="flat" padding="lg" className="flex flex-col gap-5">
      <header>
        <h2 className="font-display text-2xl text-ink-900">
          {t("checkout.reviewHeading")}
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          {t("checkout.reviewSubtitle")}
        </p>
      </header>

      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
            {t("checkout.deliveringTo")}
          </dt>
          <dd className="mt-1 text-ink-900">{addressLine}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
            {t("checkout.payment")}
          </dt>
          <dd className="mt-1 text-ink-900">{t("checkout.cod")}</dd>
        </div>
        {orderMessage.trim() ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
              {t("checkout.note")}
            </dt>
            <dd className="mt-1 italic text-ink-700">
              &ldquo;{orderMessage.trim()}&rdquo;
            </dd>
          </div>
        ) : null}
      </dl>

      <Divider />

      <ul className="flex flex-col gap-2 text-sm">
        {cartItems.map((item) => (
          <li
            key={item.productId}
            className="flex items-start justify-between gap-3"
          >
            <span className="min-w-0 text-ink-700">
              {item.title}{" "}
              <span className="text-ink-400">× {item.quantity}</span>
            </span>
            <span className="shrink-0 tabular-nums text-ink-900">
              <CurrencyAmount
                amount={item.unitPrice * item.quantity}
                currency={currency}
                locale={locale}
              />
            </span>
          </li>
        ))}
      </ul>

      {submitError ? (
        <div
          role="alert"
          className="rounded-lg border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700"
        >
          {submitError}
        </div>
      ) : null}

      <Divider />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1 text-sm text-ink-600 sm:flex-row sm:gap-4">
          <p className="inline-flex items-center gap-2">
            <ShieldIcon size={16} className="text-bloom-700" />
            {t("checkout.secureCheckout")}
          </p>
          <p className="inline-flex items-center gap-2">
            <TruckIcon size={16} className="text-bloom-700" />
            {t("cart.freeDelivery")}
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          className="w-full sm:w-auto"
        >
          {t("common.back")}
        </Button>
        <Button
          type="button"
          size="xl"
          onClick={onPlaceOrder}
          isLoading={isPlacing}
          className="w-full sm:w-auto"
        >
          {t("checkout.placeOrder")} ·{" "}
          <CurrencyAmount amount={total} currency={currency} locale={locale} />
        </Button>
      </div>
    </Card>
  );
}

// ---- Step 4: Confirmation (transient) --------------------------------------

function ConfirmationStep() {
  const { t } = useT();
  return (
    <Card
      variant="flat"
      padding="lg"
      className="flex flex-col items-center gap-3 text-center"
    >
      <m.span
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-bloom-50 text-bloom-700"
      >
        <CheckIcon size={24} />
      </m.span>
      <h2 className="font-display text-2xl text-ink-900">{t("order.confirmed")}</h2>
      <p className="text-sm text-ink-500">
        {t("checkout.redirecting")}
      </p>
      <Spinner />
    </Card>
  );
}

// ---- Shared bits ------------------------------------------------------------

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
        <span className="block text-xs text-ink-500">
          {address.streetAddress}
          {address.apartment ? `, ${address.apartment}` : ""}, {address.city}
          {address.country ? `, ${address.country}` : ""}
        </span>
      </span>
    </button>
  );
}

interface CheckoutSummaryProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  /** Estimated VAT for the ALL_PRODUCTS case; 0 when disabled, inclusive, or scope is unknown. */
  vatAmount: number;
  vatRatePercent: number | null;
  vatInclusive: boolean;
  /** True when vatAmount is added on top of the total (exclusive VAT). */
  vatAdds: boolean;
  /** True when VAT is enabled but scoped to specific products/categories — can't preview exactly. */
  vatUncertain: boolean;
  promoCode: string;
  setPromoCode: (v: string) => void;
  promoResult: ApiPromoValidationResult | null;
  promoError: string | null;
  onApply: () => void;
  applying: boolean;
  onClear: () => void;
}

function CheckoutSummary({
  subtotal,
  shipping,
  discount,
  total,
  vatAmount,
  vatRatePercent,
  vatInclusive,
  vatAdds,
  vatUncertain,
  promoCode,
  setPromoCode,
  promoResult,
  promoError,
  onApply,
  applying,
  onClear,
}: CheckoutSummaryProps) {
  const cart = useCart();
  const { currency, locale } = useCurrency();
  const { t } = useT();

  return (
    <aside className="flex flex-col gap-4">
      <Card variant="elevated" padding="lg" className="flex flex-col gap-4">
        <h3 className="font-display text-xl text-ink-900">{t("cart.orderSummary")}</h3>
        <ul className="divide-y divide-ink-100">
          {cart.items.map((item) => (
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
            <span>{t("common.delivery")}</span>
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
      </Card>

      <Card variant="flat" padding="md" className="flex flex-col gap-3">
        <h3 className="font-display text-lg text-ink-900">{t("checkout.promoCode")}</h3>
        {promoResult ? (
          <div className="flex items-center justify-between rounded-xl border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700">
            <div>
              <p className="font-semibold uppercase tracking-wider">
                {promoCode}
              </p>
              <p className="text-xs">
                {discount > 0
                  ? t("checkout.promoAppliedAmount", {
                      amount: formatCurrency(discount, currency, locale),
                    })
                  : t("checkout.applied")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="text-xs underline"
            >
              {t("common.remove")}
            </button>
          </div>
        ) : (
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
        )}
        {promoError ? (
          <p className="text-xs text-bloom-700">{promoError}</p>
        ) : null}
      </Card>
    </aside>
  );
}
