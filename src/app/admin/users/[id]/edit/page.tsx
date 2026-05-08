import type { Metadata } from "next";
import { UserEditPage } from "@/components/admin/users/UserEditPage";

export const metadata: Metadata = { title: "Edit user · Admin" };

export default async function EditUserPage(
  props: PageProps<"/admin/users/[id]/edit">
) {
  const { id } = await props.params;
  return <UserEditPage id={id} />;
}
