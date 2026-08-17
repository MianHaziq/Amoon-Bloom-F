import { LegalPageRoute } from "@/features/legal/LegalPageRoute";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return <LegalPageRoute slug="privacy" fallbackTitle={["Privacy Policy", "سياسة الخصوصية"]} />;
}
