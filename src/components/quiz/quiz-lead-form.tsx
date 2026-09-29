"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { site } from "@/content/site";
import { CONSENT_TEXT, type LeadRequest } from "@/lib/quiz/lead-schema";
import type { QuizAnswers } from "@/lib/quiz/questions";
import type { Modifier, ResultPath } from "@/lib/quiz/result";
import type { PreferredContact } from "@/lib/quiz/score";
import { readAttribution } from "@/lib/utm";

export type LeadResponse = { id: string; resultPath: ResultPath; modifiers: Modifier[] };

type QuizLeadFormProps = {
  answers: QuizAnswers;
  startedAt: number;
  onSubmitted: (response: LeadResponse) => void;
};

const contactOptions: { id: PreferredContact; label: string }[] = [
  { id: "call", label: "Phone call" },
  { id: "text", label: "Text message" },
  { id: "email", label: "Email" },
];

export function QuizLeadForm({ answers, startedAt, onSubmitted }: QuizLeadFormProps) {
  const [preferredContact, setPreferredContact] = useState<PreferredContact>("call");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");

    const payload: LeadRequest = {
      firstName: text("firstName"),
      email: text("email"),
      phone: text("phone"),
      preferredContact,
      bestTime: text("bestTime") || undefined,
      marketingConsent,
      answers,
      attribution: readAttribution(localStorage) ?? undefined,
      startedAt,
      website: text("website"),
    };

    setSubmitting(true);
    setError(null);
    setFields({});
    try {
      const response = await fetch("/api/quiz-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? `Something went wrong. Please call us at ${site.phone.label}.`);
        setFields(data.fields ?? {});
        return;
      }
      onSubmitted(data as LeadResponse);
    } catch {
      setError(`We couldn't reach our server. Please try again or call us at ${site.phone.label}.`);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldError = (name: string) =>
    fields[name] ? (
      <p className="quiz-field-error" id={`${name}-error`}>
        {fields[name]}
      </p>
    ) : null;

  const describedBy = (name: string) => (fields[name] ? `${name}-error` : undefined);

  return (
    <form className="quiz-lead-form" onSubmit={handleSubmit} noValidate>
      <div className="quiz-field">
        <Label htmlFor="firstName">First name</Label>
        <Input className="min-h-11" id="firstName" name="firstName" autoComplete="given-name" required aria-invalid={!!fields.firstName} aria-describedby={describedBy("firstName")} />
        {fieldError("firstName")}
      </div>
      <div className="quiz-field">
        <Label htmlFor="email">Email</Label>
        <Input className="min-h-11" id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!fields.email} aria-describedby={describedBy("email")} />
        {fieldError("email")}
      </div>
      <div className="quiz-field">
        <Label htmlFor="phone">Phone</Label>
        <Input className="min-h-11" id="phone" name="phone" type="tel" autoComplete="tel" required aria-invalid={!!fields.phone} aria-describedby={describedBy("phone")} />
        {fieldError("phone")}
      </div>

      <fieldset className="quiz-field">
        <legend>How should we reach you?</legend>
        <RadioGroup
          value={preferredContact}
          onValueChange={(value) => setPreferredContact(value as PreferredContact)}
          className="quiz-inline-options"
        >
          {contactOptions.map((option) => (
            <Label key={option.id} htmlFor={`contact-${option.id}`} className="quiz-inline-option">
              <RadioGroupItem id={`contact-${option.id}`} value={option.id} />
              {option.label}
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="quiz-field">
        <Label htmlFor="bestTime">Best time to reach you (optional)</Label>
        <Input className="min-h-11" id="bestTime" name="bestTime" placeholder="e.g. weekday mornings" />
      </div>

      <div className="quiz-honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <Label htmlFor="marketingConsent" className="quiz-consent">
        <Checkbox
          id="marketingConsent"
          checked={marketingConsent}
          onCheckedChange={(checked) => setMarketingConsent(checked === true)}
        />
        {CONSENT_TEXT}
      </Label>

      {error ? (
        <p className="quiz-error" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Sending…" : "Send me my results"}
      </Button>
      <p className="quiz-privacy">
        We&apos;ll only use your details to follow up about your consultation. Read our{" "}
        <Link href="/privacy-policy">privacy policy</Link>.
      </p>
    </form>
  );
}
