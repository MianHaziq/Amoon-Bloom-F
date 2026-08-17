import { LegalPageRoute } from "@/features/legal/LegalPageRoute";

export const metadata = { title: "Product Disclaimer" };

export default function ProductDisclaimerPage() {
  return (
    <LegalPageRoute
      slug="product-disclaimer"
      fallbackTitle={["Product Disclaimer", "إخلاء مسؤولية المنتج"]}
    />
  );
}
