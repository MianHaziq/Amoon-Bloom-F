import { LegalPageRoute } from "@/features/legal/LegalPageRoute";

export const metadata = { title: "Refund & Return Policy" };

export default function RefundPolicyPage() {
  return (
    <LegalPageRoute
      slug="refund-policy"
      fallbackTitle={["Refund & Return Policy", "سياسة الاسترجاع والاستبدال"]}
    />
  );
}
