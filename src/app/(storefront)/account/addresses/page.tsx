import type { Metadata } from "next";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AddressBook } from "@/components/account/AddressBook";
import { getServerT } from "@/i18n/server";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const { t } = await getServerT();
  return (
    <AccountGuard>
      <AccountLayout
        title={t("account.addressesTitle")}
        description={t("account.addressesDesc")}
      >
        <AddressBook />
      </AccountLayout>
    </AccountGuard>
  );
}
