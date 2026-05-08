import type { Metadata } from "next";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AddressBook } from "@/components/account/AddressBook";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return (
    <AccountGuard>
      <AccountLayout
        title="Saved addresses"
        description="Add the addresses you ship to most often."
      >
        <AddressBook />
      </AccountLayout>
    </AccountGuard>
  );
}
