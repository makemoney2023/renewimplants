"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { site } from "@/content/load";
import { readAttribution } from "../../../../src/lib/utm";
import type { QuizAnswers } from "../../../../src/lib/quiz/questions";
import type { PreferredContact } from "../../../../src/lib/quiz/score";
import type { Modifier, ResultPath } from "../../quiz/result";
import { quizConsentText } from "../../quiz/schema";

export type LeadResponse = { id: string; resultPath: ResultPath; modifiers: Modifier[] };

const contactOptions: { id: PreferredContact; label: string }[] = [
  { id: "call", label: "Phone call" },
  { id: "text", label: "Text message" },
  { id: "email", label: "Email" },
];

export function QuizLeadForm({
  answers,
  startedAt,
  onSubmitted,
  privacyPath,
}: {
  answers: QuizAnswers;
  startedAt: number;
  onSubmitted: (response: LeadResponse) => void;
  privacyPath?: string;
}) {
  const [preferredContact, setPreferredContact] = useState<PreferredContact>("call");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");
    setSubmitting(true);
    setError(null);
    setFields({});
    try {
      const response = await fetch("/api/quiz-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });
      const data = (await response.json()) as LeadResponse & { error?: string; fields?: Record<string, string> };
      if (!response.ok) {
        setError(data.error ?? `Something went wrong. Please call us at ${site.phone.label}.`);
        setFields(data.fields ?? {});
        return;
      }
      onSubmitted(data);
    } catch {
      setError(`We couldn't reach our server. Please try again or call us at ${site.phone.label}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="quiz-lead-form" onSubmit={handleSubmit} noValidate>
      <label className="quiz-field">
        First name
        <input id="firstName" name="firstName" autoComplete="given-name" required aria-invalid={Boolean(fields.firstName)} />
        {fields.firstName ? <span className="quiz-field-error">{fields.firstName}</span> : null}
      </label>
      <label className="quiz-field">
        Email
        <input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(fields.email)} />
        {fields.email ? <span className="quiz-field-error">{fields.email}</span> : null}
      </label>
      <label className="quiz-field">
        Phone
        <input id="phone" name="phone" type="tel" autoComplete="tel" required aria-invalid={Boolean(fields.phone)} />
        {fields.phone ? <span className="quiz-field-error">{fields.phone}</span> : null}
      </label>
      <fieldset className="quiz-field">
        <legend>How should we reach you?</legend>
        <div className="quiz-inline-options">
          {contactOptions.map((option) => (
            <label key={option.id} className="quiz-inline-option">
              <input
                type="radio"
                name="preferredContact"
                value={option.id}
                checked={preferredContact === option.id}
                onChange={() => setPreferredContact(option.id)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="quiz-field">
        Best time to reach you (optional)
        <input id="bestTime" name="bestTime" placeholder="e.g. weekday mornings" />
      </label>
      <div className="quiz-honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <label className="quiz-consent">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(event) => setMarketingConsent(event.target.checked)}
        />
        {quizConsentText(site.name)}
      </label>
      {error ? (
        <p className="quiz-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="button button-primary" type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send me my results"}
      </button>
      <p className="quiz-privacy">
        We&apos;ll only use your details to follow up about your consultation.
        {privacyPath ? (
          <>
            {" "}
            Read our <Link href={privacyPath}>privacy policy</Link>.
          </>
        ) : null}
      </p>
    </form>
  );
}
