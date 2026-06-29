"use client";

import Link from "next/link";
import { useState } from "react";
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
import { queryKeys } from "@/services/queryKeys";
import { useCart } from "@/features/cart/hooks/useCart";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/services/http";
import { formatCurrency } from "@/lib/format";
import { useAppSelector } from "@/store";
import {
  CheckoutStepper,
  type CheckoutStep,
} from "./CheckoutStepper";
import type { ApiAddress } from "@/features/addresses/types";
import type { ApiPromoValidationResult } from "@/features/promo-codes/types";

const newAddressSchema = z.object({
  fullName: z.string().min(1, "Required"),
  phone: z.string().min(4, "Required"),
  streetAddress: z.string().min(1, "Required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "Required"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Required"),
});

type NewAddressValues = z.infer<typeof newAddressSchema>;

export function CheckoutClient() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cart = useCart();
  const user = useAppSelector((s) => s.auth.user);
  const { currency, locale, countryName } = useCurrency();

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

  const addressesQuery = useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () => addressesApi.list(),
  });

  const defaultAddressId: string | "new" | null = (() => {
    if (!addressesQuery.data) return null;
    if (addressesQuery.data.length === 0) return "new";
    const def =
      addressesQuery.data.find((a) => a.isDefault) ?? addressesQuery.data[0];
    return def.id;
  })();

  const selectedAddressId = explicitSelection ?? defaultAddressId;
  const selectedAddress =
    addressesQuery.data?.find((a) => a.id === selectedAddressId) ?? null;

  const {
    register: regNewAddr,
    formState: { errors: newAddrErrors },
    getValues: getNewAddrValues,
    trigger: triggerNewAddr,
  } = useForm<NewAddressValues>({
    resolver: zodResolver(newAddressSchema),
    defaultValues: {
      fullName: user
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
        : "",
      phone: user?.phone ?? "",
      streetAddress: "",
      apartment: "",
      city: user?.addressCity ?? "",
      state: "",
      postalCode: "",
      country: user?.addressCountry ?? countryName,
    },
  });

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
      if (result.isValid) {
        setPromoResult(result);
        setPromoError(null);
        toast.success({
          title: "Promo applied",
          description: `−${formatCurrency(result.discountAmount, currency, locale)}`,
        });
      } else {
        setPromoResult(null);
        setPromoError(result.reason ?? "Code is not valid for this cart.");
      }
    },
    onError: (err) => {
      setPromoResult(null);
      setPromoError(
        err instanceof ApiError ? err.message : "Could not validate code."
      );
    },
  });

  const subtotal = cart.subtotal;
  const discount = promoResult?.discountAmount ?? 0;
  // Backend charges no shipping; order total = items − discount. Keep the
  // displayed total identical to what the backend will record.
  const shipping = 0;
  const total = Math.max(0, subtotal - discount);

  const syncCart = async () => {
    if (cart.items.length === 0) throw new Error("Cart is empty");
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
        if (!ok) throw new Error("Please complete the delivery address.");
        inlineAddress = getNewAddrValues();
      } else if (selectedAddressId) {
        resolvedAddressId = selectedAddressId;
      } else {
        throw new Error("Please choose a delivery address.");
      }

      await syncCart();

      return ordersApi.checkout({
        addressId: resolvedAddressId,
        shippingAddress: inlineAddress
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
          : undefined,
        paymentMethod: "COD",
        promoCode: promoResult?.isValid ? promoCode.trim() : undefined,
      });
    },
    onSuccess: (order) => {
      cart.clear();
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      // Briefly show step 4 (Confirmed) before navigating, so the stepper
      // animates through the final state instead of unmounting mid-step.
      setStep("confirmation");
      setTimeout(() => {
        router.push(`${ROUTES.orderSuccess}?id=${order.id}`);
      }, 600);
    },
    onError: (err) => {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Could not place your order";
      setSubmitError(message);
      toast.error({ title: "Checkout failed", description: message });
    },
  });

  // ---- Step navigation ------------------------------------------------------
  const goToAddress = () => setStep("address");
  const goToPayment = async () => {
    setSubmitError(null);
    if (selectedAddressId === "new") {
      const ok = await triggerNewAddr();
      if (!ok) {
        setSubmitError("Please complete the delivery address.");
        return;
      }
    } else if (!selectedAddressId) {
      setSubmitError("Please choose a delivery address.");
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

  // Empty cart guard
  if (cart.items.length === 0 && step !== "confirmation") {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <h1 className="font-display text-4xl text-ink-900">
          Your cart is empty.
        </h1>
        <p className="mt-2 text-ink-500">
          Add a few favourites and come back.
        </p>
        <Link
          href={ROUTES.shop}
          className="mt-6 inline-flex h-12 items-center rounded-full bg-bloom-600 px-6 text-base font-medium text-white shadow-(--shadow-bloom) hover:bg-bloom-700"
        >
          Browse the boutique
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
              Cart
            </Link>
            <ChevronRight size={12} />
            <span className="text-ink-900">Checkout</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
            Checkout
          </h1>
          <p className="mt-2 text-ink-500">
            Composing {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"} for delivery to {countryName}.
          </p>
          <div className="mt-6">
            <CheckoutStepper current={step} />
          </div>
        </Container>
      </section>

      <Section spacing="md">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="flex flex-col gap-6">
            {step === "address" && (
              <AddressStep
                addresses={addressesQuery.data}
                isLoading={addressesQuery.isPending}
                selectedAddressId={selectedAddressId}
                onSelect={setExplicitSelection}
                regNewAddr={regNewAddr}
                newAddrErrors={newAddrErrors}
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
          </div>

          <CheckoutSummary
            subtotal={subtotal}
            shipping={shipping}
            discount={discount}
            total={total}
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

interface AddressStepProps {
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
  submitError: string | null;
  onContinue: () => void;
}

function AddressStep({
  addresses,
  isLoading,
  selectedAddressId,
  onSelect,
  regNewAddr,
  newAddrErrors,
  submitError,
  onContinue,
}: AddressStepProps) {
  return (
    <Card variant="flat" padding="lg" className="flex flex-col gap-5">
      <header>
        <h2 className="font-display text-2xl text-ink-900">Delivery</h2>
        <p className="mt-1 text-sm text-ink-500">
          Choose a saved address or add a new one.
        </p>
      </header>

      {isLoading ? (
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
              "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors " +
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
              <span className="block font-medium text-ink-900">New address</span>
              <span className="block text-xs text-ink-500">
                Use a one-time delivery address.
              </span>
            </span>
          </button>
        </div>
      )}

      {selectedAddressId === "new" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            error={newAddrErrors.fullName?.message}
            {...regNewAddr("fullName")}
          />
          <Input
            label="Phone"
            type="tel"
            error={newAddrErrors.phone?.message}
            {...regNewAddr("phone")}
          />
          <Input
            label="Street address"
            error={newAddrErrors.streetAddress?.message}
            containerClassName="sm:col-span-2"
            {...regNewAddr("streetAddress")}
          />
          <Input label="Apartment / Floor" {...regNewAddr("apartment")} />
          <Input
            label="City"
            error={newAddrErrors.city?.message}
            {...regNewAddr("city")}
          />
          <Input label="State / region" {...regNewAddr("state")} />
          <Input label="Postal code" {...regNewAddr("postalCode")} />
          <Input
            label="Country"
            error={newAddrErrors.country?.message}
            containerClassName="sm:col-span-2"
            {...regNewAddr("country")}
          />
        </div>
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
          Continue to payment
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
  return (
    <>
      <Card variant="flat" padding="lg" className="flex flex-col gap-5">
        <header>
          <h2 className="font-display text-2xl text-ink-900">Payment</h2>
          <p className="mt-1 text-sm text-ink-500">
            Pay our courier when your order arrives.
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
            <p className="font-medium text-ink-900">Cash on Delivery</p>
            <p className="text-sm text-ink-500">
              Available across the GCC. Card and Apple Pay coming soon.
            </p>
          </div>
        </div>
      </Card>

      <Card variant="flat" padding="lg" className="flex flex-col gap-3">
        <header>
          <h2 className="font-display text-2xl text-ink-900">Order note</h2>
          <p className="mt-1 text-sm text-ink-500">
            Optional message — gift card, delivery instructions, etc.
          </p>
        </header>
        <Textarea
          rows={3}
          placeholder="Leave at reception, surprise delivery, gift card message…"
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
          Back
        </Button>
        <Button type="button" size="lg" onClick={onContinue}>
          Review order
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
        <h2 className="font-display text-2xl text-ink-900">Review your order</h2>
        <p className="mt-1 text-sm text-ink-500">
          One last look before we send it to the boutique team.
        </p>
      </header>

      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
            Delivering to
          </dt>
          <dd className="mt-1 text-ink-900">{addressLine}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
            Payment
          </dt>
          <dd className="mt-1 text-ink-900">Cash on Delivery</dd>
        </div>
        {orderMessage.trim() ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
              Note
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
            className="flex items-center justify-between gap-2"
          >
            <span className="text-ink-700">
              {item.title}{" "}
              <span className="text-ink-400">× {item.quantity}</span>
            </span>
            <span className="tabular-nums text-ink-900">
              {formatCurrency(item.unitPrice * item.quantity, currency, locale)}
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
            Secure checkout
          </p>
          <p className="inline-flex items-center gap-2">
            <TruckIcon size={16} className="text-bloom-700" />
            Free delivery
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          size="xl"
          onClick={onPlaceOrder}
          isLoading={isPlacing}
        >
          Place order · {formatCurrency(total, currency, locale)}
        </Button>
      </div>
    </Card>
  );
}

// ---- Step 4: Confirmation (transient) --------------------------------------

function ConfirmationStep() {
  return (
    <Card
      variant="flat"
      padding="lg"
      className="flex flex-col items-center gap-3 text-center"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-bloom-50 text-bloom-700">
        <CheckIcon size={24} />
      </span>
      <h2 className="font-display text-2xl text-ink-900">Order confirmed</h2>
      <p className="text-sm text-ink-500">
        Sending you to the confirmation page…
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
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors " +
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
              Default
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

  return (
    <aside className="flex flex-col gap-4">
      <Card variant="elevated" padding="lg" className="flex flex-col gap-4">
        <h3 className="font-display text-xl text-ink-900">Order summary</h3>
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
              <div className="flex flex-1 items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-medium text-ink-900">{item.title}</p>
                  <p className="text-xs text-ink-500">Qty {item.quantity}</p>
                </div>
                <p className="font-medium">
                  {formatCurrency(
                    item.unitPrice * item.quantity,
                    currency,
                    locale
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-ink-500">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, currency, locale)}</span>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between text-ink-500">
              <span>Discount</span>
              <span>−{formatCurrency(discount, currency, locale)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-ink-500">
            <span>Shipping</span>
            <span>
              {shipping === 0
                ? "Free"
                : formatCurrency(shipping, currency, locale)}
            </span>
          </div>
          <div className="flex justify-between border-t border-ink-100 pt-2 font-medium text-ink-900">
            <span>Total</span>
            <span>{formatCurrency(total, currency, locale)}</span>
          </div>
        </div>
      </Card>

      <Card variant="flat" padding="md" className="flex flex-col gap-3">
        <h3 className="font-display text-lg text-ink-900">Promo code</h3>
        {promoResult?.isValid ? (
          <div className="flex items-center justify-between rounded-xl border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700">
            <div>
              <p className="font-semibold uppercase tracking-wider">
                {promoCode}
              </p>
              <p className="text-xs">
                {promoResult.discountAmount && discount > 0
                  ? `−${formatCurrency(discount, currency, locale)} applied`
                  : "Applied"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="text-xs underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              placeholder="Enter code"
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
              Apply
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
