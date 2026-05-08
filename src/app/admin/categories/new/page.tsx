import type { Metadata } from "next";
import { CategoryCreatePage } from "@/components/admin/categories/CategoryCreatePage";

export const metadata: Metadata = { title: "New category · Admin" };

export default function NewCategoryPage() {
  return <CategoryCreatePage />;
}
