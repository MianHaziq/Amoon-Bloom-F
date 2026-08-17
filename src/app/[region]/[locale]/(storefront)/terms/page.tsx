import { LegalPageRoute } from "@/features/legal/LegalPageRoute";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return <LegalPageRoute slug="terms" fallbackTitle={["Terms & Conditions", "الشروط والأحكام"]} />;
}
