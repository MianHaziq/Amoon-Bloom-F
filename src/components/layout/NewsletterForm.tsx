"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/ui.slice";
import { useT } from "@/i18n/useT";

export function NewsletterForm() {
  const dispatch = useAppDispatch();
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    setEmail("");
    dispatch(
      pushToast({
        title: t("newsletter.welcomeTitle"),
        description: t("newsletter.welcomeBody"),
        variant: "success",
      })
    );
  };

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={handleSubmit}
      aria-label={t("newsletter.ariaSignup")}
    >
      <Input
        type="email"
        required
        placeholder="you@example.com"
        aria-label={t("newsletter.ariaEmail")}
        className="text-base!"
        containerClassName="flex-1"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        type="submit"
        size="lg"
        isLoading={submitting}
        trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
      >
        {t("newsletter.subscribe")}
      </Button>
    </form>
  );
}
