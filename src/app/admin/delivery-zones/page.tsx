import type { Metadata } from "next";
import { DeliveryZonesAdminPage } from "@/components/admin/delivery-zones/DeliveryZonesAdminPage";

export const metadata: Metadata = { title: "Delivery zones · Admin" };

export default function DeliveryZonesPage() {
  return <DeliveryZonesAdminPage />;
}
