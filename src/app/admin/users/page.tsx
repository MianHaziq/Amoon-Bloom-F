import type { Metadata } from "next";
import { UsersAdminPage } from "@/components/admin/users/UsersAdminPage";

export const metadata: Metadata = { title: "Users · Admin" };

export default function UsersPage() {
  return <UsersAdminPage />;
}
