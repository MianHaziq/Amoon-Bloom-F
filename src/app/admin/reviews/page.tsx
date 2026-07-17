import type { Metadata } from "next";
import { ReviewsAdminPage } from "@/components/admin/reviews/ReviewsAdminPage";

export const metadata: Metadata = { title: "Reviews · Admin" };

export default function ReviewsPage() {
  return <ReviewsAdminPage />;
}
