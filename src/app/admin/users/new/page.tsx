import type { Metadata } from "next";
import { UserCreatePage } from "@/components/admin/users/UserCreatePage";

export const metadata: Metadata = { title: "New user · Admin" };

export default function NewUserPage() {
  return <UserCreatePage />;
}
