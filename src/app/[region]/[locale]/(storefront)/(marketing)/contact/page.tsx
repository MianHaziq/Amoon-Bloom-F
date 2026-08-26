"use client";

import { useState } from "react";
import Image from "next/image";
import { Container, Section, Card, Input, Textarea, Button } from "@/components/ui";
import {
  MailIcon,
  PhoneIcon,
  ChatIcon,
  TruckIcon,
  HeartIcon,
  WhatsAppIcon,
  ArrowRight,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { contactApi } from "@/features/contact/api/contact.api";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/services/http";
import { useT } from "@/i18n/useT";
import { localized } from "@/i18n";
import { useRegionCopy } from "@/features/location/hooks/useRegionCopy";
import { useRegionContact } from "@/features/location/hooks/useRegionContact";

const CONTACT_HERO = "https://ammon-pull-zone.b-cdn.net/uploads/amoon-4d76d1d1d2b3.png";

export default function ContactPage() {
  const { t, locale } = useT();
  const regionCopy = useRegionCopy();
  const contact = useRegionContact();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const stats = [
    { icon: <ChatIcon size={20} />, value: localized("5 min", "٥ دقائق", locale), label: localized("average reply time", "متوسط وقت الرد", locale) },
    { icon: <TruckIcon size={20} />, value: regionCopy.country, label: localized("delivery coordination", "تنسيق التوصيل", locale) },
    { icon: <HeartIcon size={20} />, value: localized("7 days", "٧ أيام", locale), label: localized("weekly gifting support", "دعم إهداء أسبوعي", locale) },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    try {
      await contactApi.submitPublic({
        name: String(data.get("name") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        message: String(data.get("message") ?? "").trim(),
      });
      form.reset();
      toast.success({ title: t("contact.sentTitle"), description: t("contact.sentBody") });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t("contact.sendError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 1 — Hero (text left, image right) + WhatsApp/Email CTAs */}
      <section className="bg-cream-50 pt-16 pb-12 lg:pt-24">
        <Container className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
              {localized("Customer Services", "خدمة العملاء", locale)}
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink-900 sm:text-5xl md:text-6xl">
              {localized("Tell us the feeling", "أخبرنا بالشعور", locale)}{" "}
              <span className="italic text-bloom-700">
                {localized("you want to send.", "الذي تريد إرساله.", locale)}
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-600">
              {localized(
                "From birthdays and newborn celebrations to life's special occasions, we'll help you create a gift that's thoughtful, personal, and memorable.",
                "من أعياد الميلاد واحتفالات المواليد إلى مناسبات الحياة الخاصة، سنساعدك على صنع هدية مدروسة وشخصية لا تُنسى.",
                locale
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="contents">
                <Button size="lg" leadingIcon={<WhatsAppIcon size={18} />}>
                  {localized("Start on WhatsApp", "ابدأ عبر واتساب", locale)}
                </Button>
              </a>
              <a href={`mailto:${contact.email}`} className="contents">
                <Button size="lg" variant="outline" leadingIcon={<MailIcon size={18} />}>
                  {localized("Send an Email", "أرسل بريدًا", locale)}
                </Button>
              </a>
            </div>
          </div>
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl">
            <Image
              src={CONTACT_HERO}
              alt={localized("Boutique stationery, flowers, and gift wrapping on a table", "قرطاسية البوتيك والزهور وتغليف الهدايا على طاولة", locale)}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* 2 — Stats */}
      <Section spacing="md" tone="default">
        <dl className="grid gap-4 sm:grid-cols-3">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-5">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
                {s.icon}
              </span>
              <div>
                <dt className="font-display text-xl font-medium text-ink-900">{s.value}</dt>
                <dd className="text-xs text-ink-500">{s.label}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Section>

      {/* 3 — Send a request (public form) + contact info */}
      <Section spacing="lg" tone="cream">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
                {localized("Customer Services", "خدمة العملاء", locale)}
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium leading-tight text-ink-900 sm:text-4xl">
                {localized("Share the details, we'll take care of the rest.", "شارك التفاصيل، وسنتكفل بالباقي.", locale)}
              </h2>
              <p className="mt-3 max-w-xl text-ink-600">
                {localized(
                  "Whether you're looking for a special gift, a customized arrangement, or have a question about your order, our team is here to help and guide you every step of the way.",
                  "سواء كنت تبحث عن هدية مميزة أو تنسيق مخصص أو لديك سؤال عن طلبك، فريقنا هنا لمساعدتك وإرشادك في كل خطوة.",
                  locale
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-blush-200 bg-blush-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bloom-700">
                {localized("Customer note", "ملاحظة للعميل", locale)}
              </p>
              <p className="mt-1 text-sm text-ink-600">
                {localized(
                  "For faster assistance, please include the occasion, gift type, preferred delivery date, and any additional details you'd like us to know.",
                  "لخدمة أسرع، يرجى ذكر المناسبة ونوع الهدية وتاريخ التوصيل المفضل وأي تفاصيل إضافية تودّ إخبارنا بها.",
                  locale
                )}
              </p>
            </div>

            <Card padding="lg">
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label={localized("Name", "الاسم", locale)} name="name" required autoComplete="name" placeholder={localized("Your name", "اسمك", locale)} />
                  <Input label={localized("Phone Number", "رقم الهاتف", locale)} name="phone" required autoComplete="tel" placeholder={localized("Your phone", "رقم هاتفك", locale)} />
                </div>
                <Input label={localized("Email", "البريد الإلكتروني", locale)} name="email" type="email" required autoComplete="email" placeholder={localized("you@example.com", "you@example.com", locale)} />
                <Textarea label={localized("Message", "الرسالة", locale)} name="message" required placeholder={localized("Tell us what you'd like to send…", "أخبرنا بما تودّ إرساله…", locale)} />
                {formError ? (
                  <div role="alert" className="rounded-lg border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700">
                    {formError}
                  </div>
                ) : null}
                <Button size="lg" type="submit" isLoading={submitting} trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}>
                  {localized("Submit", "إرسال", locale)}
                </Button>
              </form>
            </Card>
          </div>

          <aside className="flex flex-col gap-4">
            <ContactRow icon={<WhatsAppIcon size={18} />} title={localized("WhatsApp", "واتساب", locale)} value={contact.phone} href={contact.whatsappUrl} ltr />
            <ContactRow icon={<MailIcon size={18} />} title={t("contact.emailTitle")} value={contact.email} href={`mailto:${contact.email}`} />
            <ContactRow icon={<PhoneIcon size={18} />} title={t("contact.phoneTitle")} value={contact.phone} href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} ltr />
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
  ltr,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
  ltr?: boolean;
}) {
  const Wrapper = href ? "a" : "div";
  const external = href?.startsWith("http");
  return (
    <Wrapper
      {...(href ? { href, ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}) } : {})}
      className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 transition-colors hover:border-ink-200"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">{title}</p>
        <p className={cn("mt-1 font-medium wrap-break-word", href ? "text-bloom-700" : "text-ink-900")}>
          {ltr ? (
            <span dir="ltr" className="[unicode-bidi:isolate]">
              {value}
            </span>
          ) : (
            value
          )}
        </p>
      </div>
    </Wrapper>
  );
}
