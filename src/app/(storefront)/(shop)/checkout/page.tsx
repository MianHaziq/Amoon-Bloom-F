import { AccountGuard } from "@/components/account/AccountGuard";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <AccountGuard>
      <CheckoutClient />
    </AccountGuard>
  );
}
