import { Container, Section } from "@/components/ui";

export const metadata = { title: "Privacy policy" };

const sections = [
  {
    title: "1. What we collect",
    body: "We collect the information you give us when placing an order or creating an account — name, email, phone, delivery address, and order details. Payment information is processed by our PCI-compliant payment partner; we never store full card numbers on our servers.",
  },
  {
    title: "2. How we use it",
    body: "Your data is used to fulfil orders, send transactional notifications (order confirmations, delivery updates), and — only with your consent — to keep you updated on new edits and seasonal launches.",
  },
  {
    title: "3. Sharing",
    body: "We share data only with the partners we need to deliver your order: payment processors, courier services, and our cloud infrastructure provider. We never sell or rent your data.",
  },
  {
    title: "4. Cookies",
    body: "We use a small set of cookies to keep you signed in, remember your cart, and measure aggregate site performance. You can clear or block these in your browser settings.",
  },
  {
    title: "5. Your rights",
    body: "You can ask for a copy of the data we hold, request a correction, or ask us to delete it — write to hello@amoonis-boutique.com and we will respond within 30 days.",
  },
  {
    title: "6. Contact",
    body: "Questions? Reach our concierge at hello@amoonis-boutique.com.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-cream-50 pt-16 pb-10 lg:pt-24">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            Legal
          </p>
          <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-ink-900 md:text-6xl">
            Privacy policy.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-500">
            How Amoonis Boutique handles your data — written in plain language.
          </p>
        </Container>
      </section>

      <Section spacing="md" containerSize="md">
        <div className="prose prose-lg flex flex-col gap-10">
          {sections.map((s) => (
            <article key={s.title}>
              <h2 className="font-display text-2xl font-medium text-ink-900 md:text-3xl">
                {s.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-600">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
