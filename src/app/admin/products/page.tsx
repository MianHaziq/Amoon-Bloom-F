import type { Metadata } from "next";
import { ProductsAdminPage } from "@/components/admin/products/ProductsAdminPage";

export const metadata: Metadata = { title: "Products · Admin" };

export default function ProductsPage() {
  return <ProductsAdminPage />;
}
