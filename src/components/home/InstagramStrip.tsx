import Image from "next/image";
import { Container } from "@/components/ui";
import { InstagramIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";

const images = [
  {
    url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=70",
    alt: "Pink peony bouquet",
  },
  {
    url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=70",
    alt: "Luxury hamper",
  },
  {
    url: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&w=600&q=70",
    alt: "Long stem roses",
  },
  {
    url: "https://images.unsplash.com/photo-1530092285049-1c42085fd395?auto=format&fit=crop&w=600&q=70",
    alt: "Hydrangea arrangement",
  },
  {
    url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=70",
    alt: "Hand-poured candle",
  },
  {
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=70",
    alt: "Pastel balloons",
  },
];

export function InstagramStrip() {
  return (
    <section className="bg-white py-14">
      <Container className="flex flex-col items-center gap-8">
        <a
          href={siteConfig.links.instagram}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700"
        >
          <InstagramIcon size={16} />
          @amoonbloom
        </a>
        <p className="text-center font-display text-3xl font-medium text-ink-900 md:text-4xl">
          From the boutique, to your feed.
        </p>
      </Container>
      <div className="mt-10 grid grid-cols-3 gap-1 px-1 md:grid-cols-6">
        {images.map((img) => (
          <a
            key={img.url}
            href={siteConfig.links.instagram}
            target="_blank"
            rel="noreferrer"
            className="group relative block aspect-square overflow-hidden bg-cream-100"
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(min-width: 768px) 16vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink-900/0 opacity-0 transition-all group-hover:bg-ink-900/40 group-hover:opacity-100">
              <InstagramIcon size={28} className="text-white" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
