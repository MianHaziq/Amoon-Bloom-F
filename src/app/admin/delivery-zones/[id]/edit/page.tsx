import type { Metadata } from "next";
import { DeliveryZoneEditPage } from "@/components/admin/delivery-zones/DeliveryZoneEditPage";

export const metadata: Metadata = { title: "Edit delivery zone · Admin" };

export default async function EditDeliveryZonePage(
  props: PageProps<"/admin/delivery-zones/[id]/edit">
) {
  const { id } = await props.params;
  return <DeliveryZoneEditPage id={id} />;
}
