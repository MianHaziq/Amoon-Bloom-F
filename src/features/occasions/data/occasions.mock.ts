/**
 * Occasions are a discovery surface — not a separate taxonomy. Each occasion
 * filters across categories (a Birthday occasion can mix flowers, cakes,
 * balloons, and hampers). The slug routes to /shop?occasion=<slug> so the PLP
 * can read it from the URL when we wire it up.
 */
export interface Occasion {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  imageUrl: string;
  imageAlt: string;
  accentColor: "blush" | "bloom" | "cream" | "ink";
}

export const occasions: Occasion[] = [
  {
    id: "occ-birthday",
    slug: "birthday",
    title: "Birthday",
    tagline: "Cake, flowers, candles",
    imageUrl:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Pastel celebration arrangement",
    accentColor: "bloom",
  },
  {
    id: "occ-anniversary",
    slug: "anniversary",
    title: "Anniversary",
    tagline: "Romantic & long-lasting",
    imageUrl:
      "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Long stem red roses",
    accentColor: "blush",
  },
  {
    id: "occ-newborn",
    slug: "newborn",
    title: "Newborn",
    tagline: "Soft welcomes",
    imageUrl:
      "https://images.unsplash.com/photo-1530092285049-1c42085fd395?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Soft pastel hydrangeas",
    accentColor: "cream",
  },
  {
    id: "occ-wedding",
    slug: "wedding",
    title: "Wedding",
    tagline: "Composed for the day",
    imageUrl:
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=900&q=80",
    imageAlt: "White rose wedding bouquet",
    accentColor: "ink",
  },
  {
    id: "occ-sympathy",
    slug: "sympathy",
    title: "Sympathy",
    tagline: "Quiet, considered tributes",
    imageUrl:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",
    imageAlt: "White orchid in vessel",
    accentColor: "cream",
  },
  {
    id: "occ-corporate",
    slug: "corporate",
    title: "Corporate",
    tagline: "Client & team gifting",
    imageUrl:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Corporate gifting presentation",
    accentColor: "ink",
  },
  {
    id: "occ-just-because",
    slug: "just-because",
    title: "Just Because",
    tagline: "No reason needed",
    imageUrl:
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Pink peonies",
    accentColor: "blush",
  },
];
