"use client";

import { useState } from "react";
import {
  Container,
  Section,
  Card,
  Input,
  Textarea,
  Button,
} from "@/components/ui";
import {
  MailIcon,
  PhoneIcon,
  PinIcon,
  ArrowRight,
} from "@/components/icons";
import { siteConfig } from "@/config/site";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/ui.slice";

export default function ContactPage() {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
    dispatch(
      pushToast({
        title: "Message received",
        description: "Our concierge will respond within a few hours.",
        variant: "success",
      })
    );
  };

  return (
    <>
      <section className="bg-cream-50 pt-16 pb-12 lg:pt-24">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            Concierge
          </p>
          <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-ink-900 md:text-6xl">
            We&rsquo;d love to hear from you.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-500">
            Composing a wedding, planning a corporate moment, or simply curious
            — message our concierge and a member of the team will reply within
            a few hours.
          </p>
        </Container>
      </section>

      <Section spacing="md">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <Card padding="lg" className="flex flex-col gap-5">
            <h2 className="font-display text-2xl font-medium text-ink-900">
              Send us a note
            </h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  name="firstName"
                  required
                  placeholder="Layla"
                />
                <Input
                  label="Last name"
                  name="lastName"
                  placeholder="Al Mansouri"
                />
              </div>
              <Input
                type="email"
                label="Email"
                name="email"
                required
                placeholder="layla@example.com"
              />
              <Input
                label="Subject"
                name="subject"
                placeholder="Bridal flowers · early Spring"
              />
              <Textarea
                label="How can we help?"
                name="message"
                required
                placeholder="Tell us about the moment, the recipient, the budget — we'll compose a few options."
              />
              <Button
                size="lg"
                type="submit"
                isLoading={submitting}
                trailingIcon={<ArrowRight size={16} />}
              >
                Send message
              </Button>
            </form>
          </Card>

          <aside className="flex flex-col gap-4">
            <ContactRow
              icon={<MailIcon size={18} />}
              title="Email"
              value={siteConfig.contact.email}
              href={`mailto:${siteConfig.contact.email}`}
            />
            <ContactRow
              icon={<PhoneIcon size={18} />}
              title="Phone"
              value={siteConfig.contact.phone}
              href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
            />
            <ContactRow
              icon={<PinIcon size={18} />}
              title="Boutique"
              value={siteConfig.contact.address}
            />
            <Card padding="md" className="bg-cream-50">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
                Open daily
              </p>
              <p className="mt-2 font-display text-xl font-medium text-ink-900">
                {siteConfig.contact.hours}
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Walk-ins welcome. Press appointments by request.
              </p>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}

function ContactRow({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      {...(href ? { href } : {})}
      className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 transition-colors hover:border-ink-200"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
          {title}
        </p>
        <p className="mt-1 font-medium text-ink-900">{value}</p>
      </div>
    </Wrapper>
  );
}
