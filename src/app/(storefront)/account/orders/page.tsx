import type { Metadata } from "next";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AccountOrders } from "@/components/account/AccountOrders";

export const metadata: Metadata = { title: "Orders" };

export default function AccountOrdersPage() {
  return (
    <AccountGuard>
      <AccountLayout title="Your orders" description="Recent and past orders.">
        <AccountOrders />
      </AccountLayout>
    </AccountGuard>
  );
}
