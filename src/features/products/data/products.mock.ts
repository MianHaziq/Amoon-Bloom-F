import type { Product } from "../types";

const CURRENCY = "AED";

export const products: Product[] = [
  {
    id: "prod-001",
    slug: "rosewater-peonies",
    title: "Rosewater Peonies",
    subtitle: "Hand-tied bouquet · Medium",
    description:
      "A romantic edit of soft pink peonies wrapped in our signature blush ribbon. Hand-tied to order each morning by our floral team.",
    descriptions: [
      {
        id: "d1",
        title: "What's inside",
        description:
          "12 stems of seasonal peonies, paired with eucalyptus and italian ruscus. Wrapped in recycled kraft and finished with a hand-tied silk ribbon.",
      },
      {
        id: "d2",
        title: "Care",
        description:
          "Re-cut stems at a 45° angle and place in fresh water. Refresh water every two days for blooms that last up to 7 days.",
      },
    ],
    price: { amount: 320, currency: CURRENCY },
    compareAtPrice: { amount: 380, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80",
        alt: "Pink peony bouquet",
      },
      {
        url: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1200&q=80",
        alt: "Peony detail",
      },
    ],
    category: "Flowers",
    categorySlug: "flowers",
    collection: "Signature",
    inStock: true,
    badge: "bestseller",
    rating: 4.9,
    reviewCount: 128,
    options: [
      { id: "size", title: "Size", options: ["Small", "Medium", "Grand"] },
      { id: "ribbon", title: "Ribbon", options: ["Blush", "Cream", "Bloom"] },
    ],
    tags: ["Romantic", "Same-day"],
  },
  {
    id: "prod-002",
    slug: "english-garden",
    title: "English Garden",
    subtitle: "Wildflower arrangement",
    description:
      "An organic gathering of garden roses, lisianthus, and seasonal foliage — composed to feel just-picked.",
    price: { amount: 245, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1525310072745-f49212b8ac6d?auto=format&fit=crop&w=1200&q=80",
        alt: "Wildflower English garden bouquet",
      },
    ],
    category: "Flowers",
    categorySlug: "flowers",
    collection: "Signature",
    inStock: true,
    badge: "new",
    rating: 4.8,
    reviewCount: 64,
    tags: ["Wildflower", "Romantic"],
  },
  {
    id: "prod-003",
    slug: "white-orchid-vase",
    title: "White Orchid in Vessel",
    subtitle: "Living arrangement",
    description:
      "A double-stem white phalaenopsis orchid set in our hand-thrown stone vessel. A long-lasting, sculptural gift.",
    price: { amount: 410, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
        alt: "White orchid in stone vessel",
      },
    ],
    category: "Plants",
    categorySlug: "plants",
    inStock: true,
    rating: 4.95,
    reviewCount: 41,
    tags: ["Long-lasting"],
  },
  {
    id: "prod-004",
    slug: "champagne-cake",
    title: "Champagne Celebration Cake",
    subtitle: "Two-tier · Serves 16",
    description:
      "Vanilla bean sponge layered with champagne buttercream and fresh raspberries. Finished with edible gold leaf.",
    price: { amount: 580, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1586788224331-947f68671cf1?auto=format&fit=crop&w=1200&q=80",
        alt: "Two-tier celebration cake",
      },
    ],
    category: "Cakes & Sweets",
    categorySlug: "cakes",
    inStock: true,
    badge: "limited",
    rating: 4.85,
    reviewCount: 92,
    options: [
      { id: "size", title: "Size", options: ["Single tier", "Two tier"] },
      {
        id: "message",
        title: "Top message",
        options: ["No message", "Custom"],
      },
    ],
    tags: ["Pre-order", "48hr lead"],
  },
  {
    id: "prod-005",
    slug: "macaron-collection",
    title: "Macaron Collection",
    subtitle: "Box of 18",
    description:
      "An ever-changing edit of nine signature macaron flavours, two of each, presented in our cream gift box.",
    price: { amount: 165, currency: CURRENCY },
    compareAtPrice: { amount: 195, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1558326567-98ae2405596b?auto=format&fit=crop&w=1200&q=80",
        alt: "Pastel macaron box",
      },
    ],
    category: "Cakes & Sweets",
    categorySlug: "cakes",
    inStock: true,
    badge: "sale",
    rating: 4.7,
    reviewCount: 215,
    tags: ["Same-day"],
  },
  {
    id: "prod-006",
    slug: "balloon-tower",
    title: "Pastel Balloon Tower",
    subtitle: "1.8m installation",
    description:
      "A sculpted balloon column in our signature pastel palette. Delivered, installed, and styled by our team.",
    price: { amount: 720, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
        alt: "Pastel balloon installation",
      },
    ],
    category: "Balloons",
    categorySlug: "balloons",
    inStock: true,
    rating: 4.92,
    reviewCount: 38,
    tags: ["Installed", "Event"],
  },
  {
    id: "prod-007",
    slug: "luxury-gift-hamper",
    title: "Luxury Gift Hamper",
    subtitle: "Bloom + Bites",
    description:
      "A composed hamper of seasonal blooms, French chocolates, artisan tea, and a hand-poured candle.",
    price: { amount: 495, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=80",
        alt: "Luxury gift hamper",
      },
    ],
    category: "Gifts & Hampers",
    categorySlug: "gifts",
    inStock: true,
    badge: "bestseller",
    rating: 4.88,
    reviewCount: 174,
    tags: ["Gift wrap", "Same-day"],
  },
  {
    id: "prod-008",
    slug: "rose-petal-candle",
    title: "Rose Petal Candle",
    subtitle: "Hand-poured · 220g",
    description:
      "A slow-burning soy candle with notes of Damask rose, bergamot, and cedarwood. 45 hours.",
    price: { amount: 145, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
        alt: "Hand-poured rose candle",
      },
    ],
    category: "Fragrance",
    categorySlug: "perfume",
    inStock: true,
    rating: 4.9,
    reviewCount: 67,
    tags: ["Hand-poured"],
  },
  {
    id: "prod-009",
    slug: "long-stem-roses",
    title: "Long Stem Roses",
    subtitle: "Box of 24 · Velvet",
    description:
      "Twenty-four long-stem red roses presented in our signature velvet keepsake box.",
    price: { amount: 690, currency: CURRENCY },
    compareAtPrice: { amount: 790, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&w=1200&q=80",
        alt: "Long stem red roses",
      },
    ],
    category: "Flowers",
    categorySlug: "flowers",
    collection: "Signature",
    inStock: true,
    badge: "limited",
    rating: 4.97,
    reviewCount: 312,
    tags: ["Iconic", "Anniversary"],
  },
  {
    id: "prod-010",
    slug: "garden-hydrangeas",
    title: "Garden Hydrangeas",
    subtitle: "Mixed seasonal",
    description:
      "Voluminous hydrangea heads in soft pastels, paired with greenery for a generous, garden-grown feel.",
    price: { amount: 285, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1530092285049-1c42085fd395?auto=format&fit=crop&w=1200&q=80",
        alt: "Hydrangea bouquet",
      },
    ],
    category: "Flowers",
    categorySlug: "flowers",
    inStock: true,
    rating: 4.82,
    reviewCount: 56,
    tags: ["Garden"],
  },
  {
    id: "prod-011",
    slug: "preserved-rose-dome",
    title: "Preserved Rose Dome",
    subtitle: "Lasts 2+ years",
    description:
      "A single preserved Ecuadorian rose under a glass dome — an enduring keepsake.",
    price: { amount: 220, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
        alt: "Preserved rose under glass dome",
      },
    ],
    category: "Gifts & Hampers",
    categorySlug: "gifts",
    inStock: false,
    rating: 4.75,
    reviewCount: 24,
    tags: ["Long-lasting"],
  },
  {
    id: "prod-012",
    slug: "cherry-blossom-arrangement",
    title: "Cherry Blossom Branch",
    subtitle: "Statement arrangement",
    description:
      "A tall, sculptural branch of cherry blossom in our hand-thrown ceramic vessel.",
    price: { amount: 540, currency: CURRENCY },
    images: [
      {
        url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
        alt: "Cherry blossom branch in vase",
      },
    ],
    category: "Flowers",
    categorySlug: "flowers",
    inStock: true,
    badge: "new",
    rating: 4.95,
    reviewCount: 17,
    tags: ["Statement"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(limit = 4): Product[] {
  return products
    .filter((p) => p.badge === "bestseller" || p.badge === "new")
    .slice(0, limit);
}

export function getRelatedProducts(slug: string, limit = 4): Product[] {
  const target = getProductBySlug(slug);
  if (!target) return products.slice(0, limit);
  return products
    .filter((p) => p.slug !== slug && p.categorySlug === target.categorySlug)
    .slice(0, limit);
}
