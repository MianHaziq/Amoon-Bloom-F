import type { Metadata } from "next";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AccountProfile } from "@/components/account/AccountProfile";
import { getServerT } from "@/i18n/server";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const { t } = await getServerT();
  return (
    <AccountGuard>
      <AccountLayout description={t("account.profileDesc")}>
        <AccountProfile />
      </AccountLayout>
    </AccountGuard>
  );
}
