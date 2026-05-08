import type { Metadata } from "next";
import { PromoCodeCreatePage } from "@/components/admin/promo-codes/PromoCodeCreatePage";

export const metadata: Metadata = { title: "New promo code · Admin" };

export default function NewPromoCodePage() {
  return <PromoCodeCreatePage />;
}
