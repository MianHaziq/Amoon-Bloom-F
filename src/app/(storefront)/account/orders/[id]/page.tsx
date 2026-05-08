import type { Metadata } from "next";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AccountOrderDetail } from "@/components/account/AccountOrderDetail";

export const metadata: Metadata = { title: "Order" };

export default async function AccountOrderDetailPage(
  props: PageProps<"/account/orders/[id]">
) {
  const { id } = await props.params;
  return (
    <AccountGuard>
      <AccountLayout title="Order details">
        <AccountOrderDetail id={id} />
      </AccountLayout>
    </AccountGuard>
  );
}
