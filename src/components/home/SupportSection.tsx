import { Container } from "@/components/ui";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/primitives";
import { MailIcon, PhoneIcon, WhatsAppIcon, ArrowRight } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";

/**
 * "We've got you." support section — mirrors the client's customer-support
 * block: three quick contact channels (email, phone, WhatsApp).
 */
export async function SupportSection() {
  const locale = await getServerLocale();
  const { contact, links } = siteConfig;

  const channels = [
    {
      icon: MailIcon,
      label: t(locale, "home.supportEmail"),
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    {
      icon: PhoneIcon,
      label: t(locale, "home.supportCall"),
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, "")}`,
    },
    {
      icon: WhatsAppIcon,
      label: t(locale, "home.supportWhatsapp"),
      value: contact.whatsapp,
      href: links.whatsapp,
    },
  ];

  return (
    <section className="border-t border-ink-100 bg-white">
      <Container className="py-16 md:py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bloom-700">
              {t(locale, "home.supportEyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink-900 md:text-4xl">
              {t(locale, "home.supportTitle")}
            </h2>
            <p className="mt-3 text-sm text-ink-500 md:text-base">
              {t(locale, "home.supportBody")}
            </p>
          </div>
        </Reveal>

        <StaggerGroup className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3" stagger={0.08}>
          {channels.map(({ icon: Icon, label, value, href }) => (
            <StaggerItem key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex h-full flex-col items-center gap-3 rounded-3xl border border-ink-100 bg-cream-50 p-6 text-center transition-colors hover:border-bloom-200 hover:bg-blush-50"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blush-100 text-bloom-700 transition-colors group-hover:bg-bloom-600 group-hover:text-white">
                  <Icon size={22} />
                </span>
                <span className="font-display text-base font-medium text-ink-900">
                  {label}
                </span>
                <span className="text-sm text-ink-500" dir="ltr">
                  {value}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-bloom-700">
                  {label}
                  <ArrowRight size={13} className="rtl:-scale-x-100" />
                </span>
              </a>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
