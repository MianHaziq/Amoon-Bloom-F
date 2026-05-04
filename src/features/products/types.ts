import type { Money, Image } from "@/types";

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: Money;
  compareAtPrice?: Money;
  images: Image[];
  category: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
