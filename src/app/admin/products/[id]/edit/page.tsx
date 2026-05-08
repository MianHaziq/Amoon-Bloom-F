import type { Metadata } from "next";
import { ProductEditPage } from "@/components/admin/products/ProductEditPage";

export const metadata: Metadata = { title: "Edit product · Admin" };

export default async function EditProductPage(
  props: PageProps<"/admin/products/[id]/edit">
) {
  const { id } = await props.params;
  return <ProductEditPage id={id} />;
}
