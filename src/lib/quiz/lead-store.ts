import { CONSENT_TEXT, type ParsedLead } from "./lead-schema";
import { ANSWERS_VERSION } from "./questions";
import type { QuizResult } from "./result";
import type { LeadTier } from "./score";

type LeadInput = Omit<ParsedLead, "website">;

export function toLeadRow(
  lead: LeadInput,
  result: QuizResult,
  score: { score: number; tier: LeadTier },
  now: Date,
) {
  const attribution = lead.attribution ?? {};
  return {
    first_name: lead.firstName,
    email: lead.email,
    phone: lead.phone,
    preferred_contact: lead.preferredContact,
    best_time: lead.bestTime || null,
    answers: lead.answers,
    answers_version: ANSWERS_VERSION,
    result_path: result.path,
    modifiers: result.modifiers,
    lead_score: score.score,
    lead_tier: score.tier,
    marketing_consent: lead.marketingConsent,
    consent_text: lead.marketingConsent ? CONSENT_TEXT : null,
    consent_at: lead.marketingConsent ? now.toISOString() : null,
    landing_path: attribution.landing_path ?? null,
    referrer: attribution.referrer ?? null,
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
    utm_term: attribution.utm_term ?? null,
    utm_content: attribution.utm_content ?? null,
  };
}

export type LeadRow = ReturnType<typeof toLeadRow>;

const INSERT_QUIZ_LEAD = `INSERT INTO quiz_leads (
  id, first_name, email, phone, preferred_contact, best_time,
  answers, answers_version, result_path, modifiers,
  lead_score, lead_tier, marketing_consent, consent_text, consent_at,
  landing_path, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

export function quizLeadInsert(row: LeadRow, id: string): { sql: string; params: Array<string | number | null> } {
  return {
    sql: INSERT_QUIZ_LEAD,
    params: [
      id,
      row.first_name,
      row.email,
      row.phone,
      row.preferred_contact,
      row.best_time,
      JSON.stringify(row.answers),
      row.answers_version,
      row.result_path,
      JSON.stringify(row.modifiers),
      row.lead_score,
      row.lead_tier,
      row.marketing_consent ? 1 : 0,
      row.consent_text,
      row.consent_at,
      row.landing_path,
      row.referrer,
      row.utm_source,
      row.utm_medium,
      row.utm_campaign,
      row.utm_term,
      row.utm_content,
    ],
  };
}

export async function insertQuizLead(row: LeadRow): Promise<{ id: string }> {
  const { env } = await import("cloudflare:workers");
  const id = crypto.randomUUID();
  const statement = quizLeadInsert(row, id);
  try {
    await env.DB.prepare(statement.sql).bind(...statement.params).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    throw new Error(`quiz_leads insert failed: ${message}`);
  }
  return { id };
}
