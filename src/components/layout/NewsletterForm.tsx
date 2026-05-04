"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/ui.slice";

export function NewsletterForm() {
  const dispatch = useAppDispatch();
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
        title: "Welcome to the letter",
        description: "Your first edit lands next Sunday.",
        variant: "success",
      })
    );
  };

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={handleSubmit}
      aria-label="Newsletter sign up"
    >
      <Input
        type="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        className="text-base!"
        containerClassName="flex-1"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        type="submit"
        size="lg"
        isLoading={submitting}
        trailingIcon={<ArrowRight size={16} />}
      >
        Subscribe
      </Button>
    </form>
  );
}
