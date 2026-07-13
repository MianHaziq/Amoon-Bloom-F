import type { Metadata } from "next";
import { VatSettingsPage } from "@/components/admin/tax/VatSettingsPage";

export const metadata: Metadata = { title: "Tax / VAT · Admin" };

export default function TaxPage() {
  return <VatSettingsPage />;
}
