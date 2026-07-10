import { Container } from "@/components/ui";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/primitives";
import { MailIcon, PhoneIcon, WhatsAppIcon, ArrowRight } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";

export async function SupportSection() {
  const locale = await getServerLocale();
  const { contact, links } = siteConfig;

  const channels = [
    {
      icon: MailIcon,
      label: t(locale, "home.supportEmail"),
      value: contact.email,
      href: `mailto:${contact.email}`,
      glowDelay: "0s",
    },
    {
      icon: PhoneIcon,
      label: t(locale, "home.supportCall"),
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, "")}`,
      glowDelay: "0.9s",
    },
    {
      icon: WhatsAppIcon,
      label: t(locale, "home.supportWhatsapp"),
      value: contact.whatsapp,
      href: links.whatsapp,
      glowDelay: "1.8s",
    },
  ];

  return (
    <section className="relative overflow-hidden border-t border-bloom-100">
      {/* Pink gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-bloom-50 via-blush-50 to-blush-100" />

      {/* Continuously floating blurred orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -left-24 -top-24 h-96 w-96 rounded-full bg-bloom-200/50 blur-3xl" />
        <div
          className="animate-float-medium absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-blush-300/40 blur-3xl"
          style={{ animationDelay: "2.5s" }}
        />
        <div
          className="animate-float-slow absolute bottom-0 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-bloom-300/30 blur-2xl"
          style={{ animationDelay: "5s" }}
        />
        <div
          className="animate-float-medium absolute left-1/4 top-0 h-40 w-40 rounded-full bg-blush-200/40 blur-2xl"
          style={{ animationDelay: "3.8s" }}
        />
      </div>

      <Container className="relative py-16 md:py-20">
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

        <StaggerGroup
          className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3"
          stagger={0.08}
        >
          {channels.map(({ icon: Icon, label, value, href, glowDelay }) => (
            <StaggerItem key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex h-full flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/65 p-6 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:border-bloom-200 hover:bg-white/90 hover:shadow-bloom"
              >
                {/* Icon — bloom-glow pulses continuously, staggered per card */}
                <span
                  className="animate-bloom-glow inline-flex h-12 w-12 items-center justify-center rounded-full bg-bloom-100 text-bloom-700 transition-colors duration-300 group-hover:bg-bloom-600 group-hover:text-white"
                  style={{ animationDelay: glowDelay }}
                >
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
