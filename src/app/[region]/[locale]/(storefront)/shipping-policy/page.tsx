import { LegalPageRoute } from "@/features/legal/LegalPageRoute";

export const metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <LegalPageRoute slug="shipping-policy" fallbackTitle={["Shipping Policy", "سياسة الشحن"]} />
  );
}
