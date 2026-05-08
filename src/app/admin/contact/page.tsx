import type { Metadata } from "next";
import { ContactAdminPage } from "@/components/admin/contact/ContactAdminPage";

export const metadata: Metadata = { title: "Contact · Admin" };

export default function ContactPage() {
  return <ContactAdminPage />;
}
