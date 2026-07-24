import { Container, Section } from "@/components/ui";
import { linkifyContacts } from "@/components/ui/ContactLink";

export interface LegalListItem {
  label?: string;
  text: string;
}

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: (string | LegalListItem)[] };

export interface LegalSubsection {
  title: string;
  blocks: LegalBlock[];
}

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
  subsections?: LegalSubsection[];
}

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  intro: string;
  badge: string;
  updatedLabel: string;
  updatedValue: string;
  sections: LegalSection[];
}

function Bullet() {
  return (
    <span
      aria-hidden
      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-800"
    />
  );
}

function ListItemContent({ item }: { item: string | LegalListItem }) {
  if (typeof item === "string") return <span>{linkifyContacts(item)}</span>;
  return (
    <span>
      <span className="font-semibold text-ink-900">{item.label}: </span>
      {linkifyContacts(item.text)}
    </span>
  );
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i} className="mt-3 text-base leading-relaxed text-ink-600">
            {linkifyContacts(b.text)}
          </p>
        ) : (
          <ul key={i} className="mt-3 flex flex-col gap-2.5">
            {b.items.map((item, j) => (
              <li
                key={j}
                className="flex items-start gap-2.5 text-base leading-relaxed text-ink-600"
              >
                <Bullet />
                <ListItemContent item={item} />
              </li>
            ))}
          </ul>
        )
      )}
    </>
  );
}

export function LegalPageLayout({
  eyebrow,
  title,
  intro,
  badge,
  updatedLabel,
  updatedValue,
  sections,
}: LegalPageLayoutProps) {
  return (
    <>
      <section className="bg-cream-50 pt-16 pb-10 lg:pt-24">
        <Container size="md">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="h-px w-6 bg-bloom-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-600">
              {eyebrow}
            </p>
          </div>
          <h1 className="mt-3 font-display text-4xl font-normal leading-[1.1] text-ink-900 sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-500">{intro}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-bloom-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-bloom-700">
              {badge}
            </span>
            <span className="rounded-full border border-ink-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-700">
              {updatedLabel} <span className="font-bold">{updatedValue}</span>
            </span>
          </div>

          <div className="mt-8 border-t border-ink-100" />
        </Container>
      </section>

      <Section spacing="md" containerSize="md">
        <div className="flex flex-col gap-10">
          {sections.map((s) => (
            <article key={s.title}>
              <h2 className="font-display text-2xl font-normal text-ink-900 md:text-3xl">
                {s.title}
              </h2>
              <Blocks blocks={s.blocks} />
              {s.subsections && (
                <div className="mt-6 flex flex-col gap-6">
                  {s.subsections.map((sub) => (
                    <div key={sub.title}>
                      <h3 className="font-display text-xl font-normal text-ink-900">
                        {sub.title}
                      </h3>
                      <Blocks blocks={sub.blocks} />
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
