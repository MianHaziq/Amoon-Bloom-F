import type { Metadata } from "next";
import { CashArrangementSettingsPage } from "@/components/admin/cash-arrangement/CashArrangementSettingsPage";

export const metadata: Metadata = { title: "Cash Arrangement · Admin" };

export default function CashArrangementPage() {
  return <CashArrangementSettingsPage />;
}
