import type { Metadata } from "next";
import { SectionCreatePage } from "@/components/admin/sections/SectionCreatePage";

export const metadata: Metadata = { title: "New section · Admin" };

export default function NewSectionPage() {
  return <SectionCreatePage />;
}
