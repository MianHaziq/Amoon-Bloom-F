import type { Metadata } from "next";
import { SectionEditPage } from "@/components/admin/sections/SectionEditPage";

export const metadata: Metadata = { title: "Edit section · Admin" };

export default async function EditSectionPage(
  props: PageProps<"/admin/sections/[id]/edit">
) {
  const { id } = await props.params;
  return <SectionEditPage id={id} />;
}
