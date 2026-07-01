"use client";

import { useState } from "react";
import Link from "next/link";
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
import { contactApi } from "@/features/contact/api/contact.api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/services/http";
import { useT } from "@/i18n/useT";

export default function ContactPage() {
  const { t } = useT();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Set when the backend reports the profile has no phone number on file.
  const [needsPhone, setNeedsPhone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setNeedsPhone(false);
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    try {
      // The backend reads name/email/phone from the authenticated profile;
      // only subject + message are sent.
      await contactApi.submit({
        subject: String(data.get("subject") ?? "").trim(),
        message: String(data.get("message") ?? "").trim(),
      });
      form.reset();
      toast.success({
        title: t("contact.sentTitle"),
        description: t("contact.sentBody"),
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t("contact.sendError");
      // The backend requires a phone on the profile before accepting a contact.
      if (err instanceof ApiError && err.status === 400 && /phone/i.test(message)) {
        setNeedsPhone(true);
      }
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-cream-50 pt-16 pb-12 lg:pt-24">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {t("contact.eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 sm:text-5xl md:text-6xl">
            {t("contact.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-500">
            {t("contact.subtitle")}
          </p>
        </Container>
      </section>

      <Section spacing="md">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <Card padding="lg" className="flex flex-col gap-5">
            <h2 className="font-display text-2xl font-medium text-ink-900">
              {t("contact.formTitle")}
            </h2>
            {!isAuthenticated ? (
              <div className="flex flex-col items-start gap-3 rounded-2xl bg-cream-50 p-5 text-sm text-ink-600">
                <p>{t("contact.signInPrompt")}</p>
                <Link href="/login?next=%2Fcontact" className="contents">
                  <Button
                    size="md"
                    trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
                  >
                    {t("contact.signInCta")}
                  </Button>
                </Link>
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                  label={t("contact.subject")}
                  name="subject"
                  required
                  placeholder={t("contact.subjectPlaceholder")}
                />
                <Textarea
                  label={t("contact.message")}
                  name="message"
                  required
                  placeholder={t("contact.messagePlaceholder")}
                />
                {formError ? (
                  <div
                    role="alert"
                    className="rounded-lg border border-bloom-200 bg-bloom-50 px-3 py-2 text-sm text-bloom-700"
                  >
                    {formError}
                    {needsPhone ? (
                      <>
                        {" "}
                        <Link
                          href="/account"
                          className="font-medium underline hover:text-bloom-900"
                        >
                          {t("contact.addPhone")}
                        </Link>
                      </>
                    ) : null}
                  </div>
                ) : null}
                <Button
                  size="lg"
                  type="submit"
                  isLoading={submitting}
                  trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
                >
                  {t("contact.send")}
                </Button>
              </form>
            )}
          </Card>

          <aside className="flex flex-col gap-4">
            <ContactRow
              icon={<MailIcon size={18} />}
              title={t("contact.emailTitle")}
              value={siteConfig.contact.email}
              href={`mailto:${siteConfig.contact.email}`}
            />
            <ContactRow
              icon={<PhoneIcon size={18} />}
              title={t("contact.phoneTitle")}
              value={siteConfig.contact.phone}
              href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
            />
            <ContactRow
              icon={<PinIcon size={18} />}
              title={t("contact.boutiqueTitle")}
              value={siteConfig.contact.address}
            />
            <Card padding="md" className="bg-cream-50">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
                {t("contact.openDaily")}
              </p>
              <p className="mt-2 font-display text-xl font-medium text-ink-900">
                {siteConfig.contact.hours}
              </p>
              <p className="mt-1 text-sm text-ink-500">
                {t("contact.walkIns")}
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
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
          {title}
        </p>
        <p className="mt-1 font-medium text-ink-900 wrap-break-word">{value}</p>
      </div>
    </Wrapper>
  );
}
