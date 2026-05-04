import type { Category, CategoryGroup } from "../types";

export const categories: Category[] = [
  {
    id: "cat-flowers",
    slug: "flowers",
    title: "Flowers",
    tagline: "Hand-tied bouquets",
    description: "Seasonal blooms arranged daily by our florists.",
    image: {
      url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80",
      alt: "Pink peony bouquet",
    },
    productCount: 64,
    featured: true,
  },
  {
    id: "cat-bouquets",
    slug: "signature-bouquets",
    title: "Signature Bouquets",
    tagline: "Florist's edit",
    description: "Our most-loved arrangements, always available.",
    image: {
      url: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1200&q=80",
      alt: "White rose signature bouquet",
    },
    productCount: 28,
  },
  {
    id: "cat-cakes",
    slug: "cakes",
    title: "Cakes & Sweets",
    tagline: "Baked the same morning",
    description: "Boutique cakes, macarons, and patisserie.",
    image: {
      url: "https://images.unsplash.com/photo-1586788224331-947f68671cf1?auto=format&fit=crop&w=1200&q=80",
      alt: "Three-tier pastel cake",
    },
    productCount: 42,
    featured: true,
  },
  {
    id: "cat-balloons",
    slug: "balloons",
    title: "Balloons",
    tagline: "Sculpted celebrations",
    description: "Artful balloon installations and bouquets.",
    image: {
      url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
      alt: "Pastel balloon arrangement",
    },
    productCount: 31,
  },
  {
    id: "cat-gifts",
    slug: "gifts",
    title: "Gifts & Hampers",
    tagline: "Thoughtfully composed",
    description: "Curated keepsakes and luxury hampers.",
    image: {
      url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=80",
      alt: "Luxury gift hamper",
    },
    productCount: 56,
    featured: true,
  },
  {
    id: "cat-plants",
    slug: "plants",
    title: "Plants",
    tagline: "Living gifts",
    description: "Indoor plants delivered in handcrafted ceramics.",
    image: {
      url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
      alt: "Potted indoor plant",
    },
    productCount: 22,
  },
  {
    id: "cat-perfume",
    slug: "perfume",
    title: "Fragrance",
    tagline: "Atmosphere & home",
    description: "Hand-poured candles and home perfumes.",
    image: {
      url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
      alt: "Glass fragrance bottle",
    },
    productCount: 18,
  },
  {
    id: "cat-corporate",
    slug: "corporate",
    title: "Corporate",
    tagline: "Business gifting",
    description: "Branded arrangements for clients and teams.",
    image: {
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
      alt: "Corporate gifting presentation",
    },
    productCount: 12,
  },
];

const byId = (id: string) => categories.find((c) => c.id === id)!;

export const categoryGroups: CategoryGroup[] = [
  {
    id: "group-flowers",
    label: "Flowers",
    categories: [
      byId("cat-flowers"),
      byId("cat-bouquets"),
      byId("cat-plants"),
    ],
    highlight: {
      title: "The Peony Edit",
      description:
        "A limited capsule of our most-loved peonies, hand-tied each morning.",
      cta: "Shop the edit",
      href: "/shop/category/flowers",
      image: {
        url: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=900&q=80",
        alt: "Peony arrangement",
      },
    },
  },
  {
    id: "group-occasions",
    label: "Occasions",
    categories: [
      byId("cat-cakes"),
      byId("cat-balloons"),
      byId("cat-gifts"),
    ],
    highlight: {
      title: "Birthday in a Box",
      description:
        "Cake, blooms, balloons, and a gift — composed for the moment.",
      cta: "Build a moment",
      href: "/shop/category/gifts",
      image: {
        url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=80",
        alt: "Birthday gift composition",
      },
    },
  },
  {
    id: "group-home",
    label: "Home & Self",
    categories: [byId("cat-perfume"), byId("cat-plants")],
    highlight: {
      title: "Atmosphere",
      description: "Hand-poured candles and slow-burning home fragrances.",
      cta: "Shop fragrance",
      href: "/shop/category/perfume",
      image: {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80",
        alt: "Hand-poured candle",
      },
    },
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
