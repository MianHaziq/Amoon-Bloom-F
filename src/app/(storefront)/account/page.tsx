import type { Metadata } from "next";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AccountProfile } from "@/components/account/AccountProfile";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
  return (
    <AccountGuard>
      <AccountLayout description="Manage your profile and password.">
        <AccountProfile />
      </AccountLayout>
    </AccountGuard>
  );
}
