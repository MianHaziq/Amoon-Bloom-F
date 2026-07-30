import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata = { title: "Checkout" };

// Guest checkout: no auth guard. CheckoutClient adapts its flow for signed-in
// customers (saved addresses + server cart) vs guests (inline details + items
// sent inline). Signing in is offered, never required.
export default function CheckoutPage() {
  return <CheckoutClient />;
}
