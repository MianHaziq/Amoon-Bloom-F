import type { Money, Image } from "@/types";

export interface ProductOptionGroup {
  id: string;
  title: string;
  options: string[];
}

export interface ProductDescriptionBlock {
  id: string;
  title?: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  descriptions?: ProductDescriptionBlock[];
  price: Money;
  compareAtPrice?: Money;
  images: Image[];
  category: string;
  categorySlug: string;
  collection?: string;
  inStock: boolean;
  badge?: "new" | "bestseller" | "limited" | "sale";
  rating?: number;
  reviewCount?: number;
  options?: ProductOptionGroup[];
  tags?: string[];
}

export interface ProductFilter {
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "featured" | "newest" | "price-asc" | "price-desc";
  inStock?: boolean;
}
