import type { Metadata } from "next";
import { PromoCodesAdminPage } from "@/components/admin/promo-codes/PromoCodesAdminPage";

export const metadata: Metadata = { title: "Promo codes · Admin" };

export default function PromoCodesPage() {
  return <PromoCodesAdminPage />;
}
