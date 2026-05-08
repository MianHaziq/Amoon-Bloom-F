import type { Metadata } from "next";
import { ProductCreatePage } from "@/components/admin/products/ProductCreatePage";

export const metadata: Metadata = { title: "New product · Admin" };

export default function NewProductPage() {
  return <ProductCreatePage />;
}
