import type { Metadata } from "next";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AccountNotifications } from "@/components/account/AccountNotifications";
import { getServerT } from "@/i18n/server";

export const metadata: Metadata = { title: "Notifications" };

export default async function AccountNotificationsPage() {
  const { t } = await getServerT();
  return (
    <AccountGuard>
      <AccountLayout
        title={t("notifications.title")}
        description={t("notifications.emptyBody")}
      >
        <AccountNotifications />
      </AccountLayout>
    </AccountGuard>
  );
}
