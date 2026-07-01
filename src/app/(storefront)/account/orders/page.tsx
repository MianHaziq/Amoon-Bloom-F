import type { Metadata } from "next";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AccountOrders } from "@/components/account/AccountOrders";
import { getServerT } from "@/i18n/server";

export const metadata: Metadata = { title: "Orders" };

export default async function AccountOrdersPage() {
  const { t } = await getServerT();
  return (
    <AccountGuard>
      <AccountLayout title={t("account.ordersTitle")} description={t("account.ordersDesc")}>
        <AccountOrders />
      </AccountLayout>
    </AccountGuard>
  );
}
