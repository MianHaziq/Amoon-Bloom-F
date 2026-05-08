import type { Metadata } from "next";
import { CategoriesAdminPage } from "@/components/admin/categories/CategoriesAdminPage";

export const metadata: Metadata = { title: "Categories · Admin" };

export default function CategoriesPage() {
  return <CategoriesAdminPage />;
}
