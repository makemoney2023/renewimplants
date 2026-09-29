import { createClient } from "@supabase/supabase-js";
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

export async function insertQuizLead(row: LeadRow): Promise<{ id: string }> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to store quiz leads.");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.from("quiz_leads").insert(row).select("id").single();
  if (error) throw new Error(`quiz_leads insert failed: ${error.message}`);
  return { id: data.id as string };
}
