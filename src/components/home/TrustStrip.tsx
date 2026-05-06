import { Container } from "@/components/ui";
import {
  TruckIcon,
  ShieldIcon,
  SparkleIcon,
  HeartIcon,
} from "@/components/icons";

const items = [
  {
    icon: TruckIcon,
    title: "Same-day delivery",
    description: "Order by 6 PM across Dubai.",
  },
  {
    icon: SparkleIcon,
    title: "Hand-composed daily",
    description: "Every box packed by our team.",
  },
  {
    icon: HeartIcon,
    title: "Free message card",
    description: "Personalised, hand-written.",
  },
  {
    icon: ShieldIcon,
    title: "Secure checkout",
    description: "Visa, Mastercard, Apple Pay.",
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-ink-100 bg-white">
      <Container className="grid gap-6 py-10 md:grid-cols-2 md:py-12 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
              <Icon size={20} />
            </span>
            <div>
              <p className="font-display text-base font-medium text-ink-900">
                {title}
              </p>
              <p className="mt-0.5 text-sm text-ink-500">{description}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
