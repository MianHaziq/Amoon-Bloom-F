"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Container,
  Section,
  Input,
  Textarea,
  Button,
  Divider,
  Card,
} from "@/components/ui";
import {
  ChevronRight,
  ShieldIcon,
  TruckIcon,
} from "@/components/icons";
import { CartSummary } from "@/features/cart/components/CartSummary";
import { useCart } from "@/features/cart/hooks/useCart";
import { useAppDispatch } from "@/store";
import { clearCart } from "@/store/slices/cart.slice";
import { pushToast } from "@/store/slices/ui.slice";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";

type Step = "contact" | "shipping" | "payment";

const steps: { id: Step; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "shipping", label: "Delivery" },
  { id: "payment", label: "Payment" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, itemCount } = useCart();
  const [active, setActive] = useState<Step>("contact");

  const goNext = () => {
    if (active === "contact") setActive("shipping");
    else if (active === "shipping") setActive("payment");
  };

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    dispatch(clearCart());
    dispatch(
      pushToast({
        title: "Order placed",
        description: "We're composing your gift.",
        variant: "success",
      })
    );
    router.push(ROUTES.orderSuccess);
  };

  return (
    <>
      <section className="border-b border-ink-100 bg-cream-50 pt-12 pb-8 lg:pt-16">
        <Container>
          <nav className="flex items-center gap-1 text-xs text-ink-500" aria-label="Breadcrumb">
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
            Composing {itemCount} item{itemCount === 1 ? "" : "s"} for delivery.
          </p>
        </Container>
      </section>

      <Section spacing="md">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="flex flex-col gap-6">
            {/* Stepper */}
            <ol className="flex items-center gap-2 text-sm">
              {steps.map((step, idx) => {
                const activeIdx = steps.findIndex((s) => s.id === active);
                const isDone = idx < activeIdx;
                const isCurrent = idx === activeIdx;
                return (
                  <li
                    key={step.id}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]",
                      isCurrent && "bg-ink-900 text-white",
                      isDone && "bg-blush-100 text-bloom-800",
                      !isCurrent && !isDone && "text-ink-400"
                    )}
                  >
                    <span className="tabular-nums">{idx + 1}</span>
                    <span>{step.label}</span>
                  </li>
                );
              })}
            </ol>

            <form className="contents" onSubmit={placeOrder}>
              {active === "contact" && (
                <CheckoutCard title="Contact" description="We'll send order updates here.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="First name"
                      name="firstName"
                      required
                      autoComplete="given-name"
                      placeholder="Layla"
                    />
                    <Input
                      label="Last name"
                      name="lastName"
                      required
                      autoComplete="family-name"
                      placeholder="Al Mansouri"
                    />
                    <Input
                      type="email"
                      label="Email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="layla@example.com"
                      containerClassName="sm:col-span-2"
                    />
                    <Input
                      type="tel"
                      label="Phone"
                      name="phone"
                      required
                      autoComplete="tel"
                      placeholder="+971 50 000 0000"
                      containerClassName="sm:col-span-2"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={goNext} type="button" size="lg">
                      Continue to delivery
                    </Button>
                  </div>
                </CheckoutCard>
              )}

              {active === "shipping" && (
                <CheckoutCard
                  title="Delivery"
                  description="Same-day delivery within Dubai if ordered by 6 PM."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Recipient name"
                      name="recipient"
                      required
                      placeholder="Layla Al Mansouri"
                      containerClassName="sm:col-span-2"
                    />
                    <Input
                      label="Address line 1"
                      name="address1"
                      required
                      placeholder="Villa 14, Al Wasl Road"
                      containerClassName="sm:col-span-2"
                    />
                    <Input
                      label="Apartment / Floor"
                      name="address2"
                      placeholder="Apt 401"
                    />
                    <Input label="City" name="city" required placeholder="Dubai" />
                    <Input label="Emirate / State" name="state" placeholder="Dubai" />
                    <Input label="Postal code" name="postal" placeholder="00000" />
                    <Textarea
                      label="Delivery notes"
                      name="notes"
                      placeholder="Leave at reception, surprise delivery, gift card message…"
                      containerClassName="sm:col-span-2"
                    />
                  </div>
                  <div className="flex flex-wrap justify-between gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setActive("contact")}
                    >
                      Back
                    </Button>
                    <Button onClick={goNext} type="button" size="lg">
                      Continue to payment
                    </Button>
                  </div>
                </CheckoutCard>
              )}

              {active === "payment" && (
                <CheckoutCard
                  title="Payment"
                  description="Cash on Delivery is supported in Dubai. Card checkout coming soon."
                >
                  <div className="flex flex-col gap-3">
                    <PaymentMethod
                      title="Cash on Delivery"
                      description="Pay our courier when your order arrives."
                      selected
                    />
                    <PaymentMethod
                      title="Card · Visa, Mastercard"
                      description="Coming soon — secure 3DS checkout."
                      disabled
                    />
                    <PaymentMethod
                      title="Apple Pay"
                      description="Coming soon."
                      disabled
                    />
                  </div>
                  <Divider />
                  <div className="flex flex-wrap justify-between gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setActive("shipping")}
                    >
                      Back
                    </Button>
                    <Button type="submit" size="xl">
                      Place order
                    </Button>
                  </div>
                </CheckoutCard>
              )}
            </form>

            <div className="flex flex-col gap-2 rounded-2xl bg-cream-50 p-5 text-sm text-ink-600">
              <p className="inline-flex items-center gap-2">
                <ShieldIcon size={16} className="text-bloom-700" />
                Encrypted checkout · we never store your card details.
              </p>
              <p className="inline-flex items-center gap-2">
                <TruckIcon size={16} className="text-bloom-700" />
                Free delivery on orders over AED 250.
              </p>
            </div>
          </div>

          <CartSummary variant="checkout" />
        </div>
      </Section>
    </>
  );
}

function CheckoutCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="flat" padding="lg" className="flex flex-col gap-5">
      <header>
        <h2 className="font-display text-2xl font-medium text-ink-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        )}
      </header>
      {children}
    </Card>
  );
}

function PaymentMethod({
  title,
  description,
  selected,
  disabled,
}: {
  title: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
        selected
          ? "border-ink-900 bg-cream-50"
          : "border-ink-200 hover:border-ink-300",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <input
        type="radio"
        name="payment"
        defaultChecked={selected}
        disabled={disabled}
        className="mt-1 h-4 w-4 accent-ink-900"
      />
      <div>
        <p className="font-medium text-ink-900">{title}</p>
        <p className="text-sm text-ink-500">{description}</p>
      </div>
    </label>
  );
}
