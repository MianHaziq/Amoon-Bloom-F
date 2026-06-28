import type { Metadata } from "next";
import { RegionEditPage } from "@/components/admin/regions/RegionEditPage";

export const metadata: Metadata = { title: "Edit region · Admin" };

export default async function EditRegionPage(
  props: PageProps<"/admin/regions/[id]/edit">
) {
  const { id } = await props.params;
  return <RegionEditPage id={id} />;
}
