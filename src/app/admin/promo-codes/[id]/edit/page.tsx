import type { Metadata } from "next";
import { PromoCodeEditPage } from "@/components/admin/promo-codes/PromoCodeEditPage";

export const metadata: Metadata = { title: "Edit promo code · Admin" };

export default async function EditPromoCodePage(
  props: PageProps<"/admin/promo-codes/[id]/edit">
) {
  const { id } = await props.params;
  return <PromoCodeEditPage id={id} />;
}
