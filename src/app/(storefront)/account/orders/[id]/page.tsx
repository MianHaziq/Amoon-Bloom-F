import type { Metadata } from "next";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AccountOrderDetail } from "@/components/account/AccountOrderDetail";
import { getServerT } from "@/i18n/server";

export const metadata: Metadata = { title: "Order" };

export default async function AccountOrderDetailPage(
  props: PageProps<"/account/orders/[id]">
) {
  const { id } = await props.params;
  const { t } = await getServerT();
  return (
    <AccountGuard>
      <AccountLayout title={t("account.orderDetails")}>
        <AccountOrderDetail id={id} />
      </AccountLayout>
    </AccountGuard>
  );
}
