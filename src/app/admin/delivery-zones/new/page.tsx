import type { Metadata } from "next";
import { DeliveryZoneCreatePage } from "@/components/admin/delivery-zones/DeliveryZoneCreatePage";

export const metadata: Metadata = { title: "New delivery zone · Admin" };

export default function NewDeliveryZonePage() {
  return <DeliveryZoneCreatePage />;
}
