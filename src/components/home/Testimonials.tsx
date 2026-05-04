import { Section, SectionHeader, Card } from "@/components/ui";
import { StarIcon } from "@/components/icons";

const reviews = [
  {
    quote:
      "Every arrangement arrives looking like a magazine cover. The peonies lasted twelve days.",
    name: "Maya K.",
    role: "Repeat client · Downtown Dubai",
  },
  {
    quote:
      "Same-day cake and flowers for my anniversary — composed beautifully and delivered on time.",
    name: "Omar A.",
    role: "Verified buyer",
  },
  {
    quote:
      "Their corporate hampers became our standard for client gifting. Thoughtful, never excessive.",
    name: "Reem N.",
    role: "Head of Brand · Lumen Group",
  },
];

export function Testimonials() {
  return (
    <Section spacing="lg" tone="cream">
      <SectionHeader
        eyebrow="In their words"
        title="Quietly, we keep showing up."
        align="center"
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3 lg:gap-6">
        {reviews.map((r) => (
          <Card key={r.name} variant="flat" padding="lg" className="bg-white/70">
            <div className="flex gap-1 text-(--color-gold-500)">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} size={14} />
              ))}
            </div>
            <p className="mt-4 font-display text-xl font-medium leading-snug text-ink-900">
              &ldquo;{r.quote}&rdquo;
            </p>
            <p className="mt-6 text-sm font-semibold text-ink-900">{r.name}</p>
            <p className="text-xs text-ink-500">{r.role}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
