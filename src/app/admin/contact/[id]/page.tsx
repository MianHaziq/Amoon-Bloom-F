import type { Metadata } from "next";
import { ContactDetailPage } from "@/components/admin/contact/ContactDetailPage";

export const metadata: Metadata = { title: "Message · Admin" };

export default async function AdminContactDetailPage(
  props: PageProps<"/admin/contact/[id]">
) {
  const { id } = await props.params;
  return <ContactDetailPage id={id} />;
}
