/**
 * Occasions are a discovery surface — not a separate taxonomy. Each occasion
 * filters across categories (a Birthday occasion can mix flowers, cakes,
 * boxes). Slugs route to /shop?occasion=<slug>.
 *
 * Aligned to the Amoonis Boutique catalogue (graduation, Eid, newborn,
 * pampering, distributions, anniversary, just-because).
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
    id: "occ-graduation",
    slug: "graduation",
    title: "Graduation",
    tagline: "Mark the milestone",
    imageUrl:
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Graduation gift presentation",
    accentColor: "bloom",
  },
  {
    id: "occ-eid",
    slug: "eid",
    title: "Eid",
    tagline: "Festive table",
    imageUrl:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Eid gift box",
    accentColor: "blush",
  },
  {
    id: "occ-newborn",
    slug: "newborn",
    title: "Newborn",
    tagline: "Soft welcomes",
    imageUrl:
      "https://images.unsplash.com/photo-1530092285049-1c42085fd395?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Newborn keepsake basket",
    accentColor: "cream",
  },
  {
    id: "occ-anniversary",
    slug: "anniversary",
    title: "Anniversary",
    tagline: "Romantic & lasting",
    imageUrl:
      "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Long stem red roses",
    accentColor: "blush",
  },
  {
    id: "occ-pampering",
    slug: "pampering",
    title: "Pampering",
    tagline: "Slow rituals, gifted",
    imageUrl:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Pampering self-care box",
    accentColor: "cream",
  },
  {
    id: "occ-distributions",
    slug: "distributions",
    title: "Distributions",
    tagline: "Mini boxes, big moments",
    imageUrl:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Mini distribution boxes",
    accentColor: "ink",
  },
  {
    id: "occ-just-because",
    slug: "just-because",
    title: "Just Because",
    tagline: "No reason needed",
    imageUrl:
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Pink rose bouquet",
    accentColor: "bloom",
  },
];
