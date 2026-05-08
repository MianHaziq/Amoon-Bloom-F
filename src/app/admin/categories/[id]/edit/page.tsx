import type { Metadata } from "next";
import { CategoryEditPage } from "@/components/admin/categories/CategoryEditPage";

export const metadata: Metadata = { title: "Edit category · Admin" };

export default async function EditCategoryPage(
  props: PageProps<"/admin/categories/[id]/edit">
) {
  const { id } = await props.params;
  return <CategoryEditPage id={id} />;
}
