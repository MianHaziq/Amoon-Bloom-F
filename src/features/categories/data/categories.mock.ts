import type { Category, CategoryGroup } from "../types";

/**
 * Real Amoonis Boutique catalogue, transcribed from the live site
 * (amoonis-boutique.com). Names, ordering, and product counts mirror what
 * customers see in production. Display images are temporary — swap for
 * Bunny CDN URLs when wiring the backend.
 */
export const categories: Category[] = [
  {
    id: "cat-graduation",
    slug: "graduation-boxes",
    title: "Graduation boxes",
    title_ar: "صناديق التخرج",
    tagline: "Composed for the milestone",
    description:
      "Curated boxes — makeup, pampering, flowers — to mark every graduation in style.",
    image: {
      url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=85",
      alt: "Graduation gift box with congratulations card",
    },
    productCount: 8,
    featured: true,
  },
  {
    id: "cat-eid",
    slug: "eid-box",
    title: "EID BOX",
    title_ar: "صندوق العيد",
    tagline: "A festive table",
    description: "A seasonal box composed for Eid — sweets, keepsakes, and more.",
    image: {
      url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=85",
      alt: "Festive Eid gift box",
    },
    productCount: 1,
  },
  {
    id: "cat-makeup-care",
    slug: "makeup-and-care-gifts",
    title: "Makeup and care gifts",
    title_ar: "هدايا المكياج والعناية",
    tagline: "Beauty rituals",
    description: "Beauty edits and skincare bundles, presented in our signature box.",
    image: {
      url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
      alt: "Makeup and care gift box",
    },
    productCount: 5,
    featured: true,
  },
  {
    id: "cat-flowers",
    slug: "flowers",
    title: "Flowers",
    title_ar: "ورود",
    tagline: "Hand-tied bouquets",
    description: "Seasonal bouquets and rose arrangements composed daily.",
    image: {
      url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=85",
      alt: "Pink rose bouquet",
    },
    productCount: 12,
    featured: true,
  },
  {
    id: "cat-newborn",
    slug: "newborn-gifts",
    title: "Newborn gifts",
    title_ar: "هدايا المواليد",
    tagline: "Soft welcomes",
    description: "Hampers and keepsake baskets composed for the newest arrivals.",
    image: {
      url: "https://images.unsplash.com/photo-1530092285049-1c42085fd395?auto=format&fit=crop&w=1200&q=85",
      alt: "Newborn keepsake basket",
    },
    productCount: 11,
    featured: true,
  },
  {
    id: "cat-pampering",
    slug: "gifts-of-pampering-and-relaxation",
    title: "Gifts of pampering and relaxation",
    title_ar: "هدايا الدلال والاسترخاء",
    tagline: "Slow rituals, gifted",
    description: "Spa-day boxes — bath, body, candles — for an at-home retreat.",
    image: {
      url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=85",
      alt: "Pampering and relaxation gift box",
    },
    productCount: 3,
  },
  {
    id: "cat-distributions",
    slug: "distributions",
    title: "Distributions",
    title_ar: "توزيعات",
    tagline: "Mini boxes, big moments",
    description: "Petite gift boxes designed for guests, parties, and celebrations.",
    image: {
      url: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&w=1200&q=85",
      alt: "Distribution mini gift boxes",
    },
    productCount: 3,
  },
];

const byId = (id: string) => categories.find((c) => c.id === id)!;

/**
 * Mega-menu groupings. Real categories grouped into three editorial buckets so
 * desktop browsers see a curated entry point rather than a flat list.
 */
export const categoryGroups: CategoryGroup[] = [
  {
    id: "group-occasions",
    label: "Occasions",
    categories: [
      byId("cat-graduation"),
      byId("cat-eid"),
      byId("cat-newborn"),
    ],
    highlight: {
      title: "Graduation 2026",
      description:
        "Eight composed boxes — makeup, pampering, flowers — for the milestone moment.",
      cta: "Shop graduation",
      href: "/shop/category/graduation-boxes",
      image: {
        url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=85",
        alt: "Graduation gift presentation",
      },
    },
  },
  {
    id: "group-flowers",
    label: "Flowers & Boxes",
    categories: [byId("cat-flowers"), byId("cat-distributions")],
    highlight: {
      title: "Hand-tied daily",
      description:
        "A rotating edit of seasonal bouquets, finished with our hand-tied silk ribbon.",
      cta: "Shop flowers",
      href: "/shop/category/flowers",
      image: {
        url: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=900&q=85",
        alt: "Hand-tied flower bouquet",
      },
    },
  },
  {
    id: "group-care",
    label: "Care & Beauty",
    categories: [byId("cat-makeup-care"), byId("cat-pampering")],
    highlight: {
      title: "VIBE by Amoon",
      description:
        "Self-care bundles — bath, body, and signature scents — packed for ritual.",
      cta: "Shop care",
      href: "/shop/category/gifts-of-pampering-and-relaxation",
      image: {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85",
        alt: "Care and pampering gift box",
      },
    },
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
