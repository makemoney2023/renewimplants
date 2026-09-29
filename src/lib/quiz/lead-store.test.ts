import { describe, expect, it } from "vitest";
import { ANSWERS_VERSION } from "./questions";
import { CONSENT_TEXT } from "./lead-schema";
import { toLeadRow } from "./lead-store";

const lead = {
  firstName: "Marie",
  email: "marie@example.com",
  phone: "+16135550199",
  preferredContact: "call" as const,
  bestTime: "Mornings",
  marketingConsent: true,
  startedAt: 1,
  answers: { situation: ["dentures"] },
  attribution: { utm_source: "blog", landing_path: "/blog/x", referrer: "chatgpt.com" },
};

describe("toLeadRow", () => {
  const now = new Date("2026-09-29T15:00:00.000Z");

  it("maps a parsed lead, result, and score onto table columns", () => {
    expect(
      toLeadRow(lead, { path: "denture-alternative", modifiers: ["coverage"] }, { score: 80, tier: "hot" }, now),
    ).toEqual({
      first_name: "Marie",
      email: "marie@example.com",
      phone: "+16135550199",
      preferred_contact: "call",
      best_time: "Mornings",
      answers: { situation: ["dentures"] },
      answers_version: ANSWERS_VERSION,
      result_path: "denture-alternative",
      modifiers: ["coverage"],
      lead_score: 80,
      lead_tier: "hot",
      marketing_consent: true,
      consent_text: CONSENT_TEXT,
      consent_at: "2026-09-29T15:00:00.000Z",
      landing_path: "/blog/x",
      referrer: "chatgpt.com",
      utm_source: "blog",
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
    });
  });

  it("records no consent text or time when the box is unchecked", () => {
    const row = toLeadRow(
      { ...lead, marketingConsent: false, attribution: undefined, bestTime: undefined },
      { path: "full-arch", modifiers: [] },
      { score: 10, tier: "nurture" },
      now,
    );
    expect(row).toMatchObject({ marketing_consent: false, consent_text: null, consent_at: null, best_time: null, utm_source: null });
  });
});
