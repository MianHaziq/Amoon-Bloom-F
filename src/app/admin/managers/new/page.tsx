import type { Metadata } from "next";
import { ManagerCreatePage } from "@/components/admin/managers/ManagerCreatePage";

export const metadata: Metadata = { title: "Create manager · Admin" };

export default function NewManagerPage() {
  return <ManagerCreatePage />;
}
