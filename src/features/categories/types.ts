import type { Image } from "@/types";

export interface Category {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  description?: string;
  image: Image;
  productCount?: number;
  featured?: boolean;
}

export interface CategoryGroup {
  id: string;
  label: string;
  categories: Category[];
  highlight?: {
    title: string;
    description: string;
    image: Image;
    href: string;
    cta: string;
  };
}
