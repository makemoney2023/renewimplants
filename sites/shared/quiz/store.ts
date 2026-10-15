import { MIN_FILL_MS } from "../lib/leads";
import { leadRequestSchema, quizConsentText, type ParsedLead } from "./schema";
import { ANSWERS_VERSION } from "../../../src/lib/quiz/questions";
import { scoreLead } from "../../../src/lib/quiz/score";
import type { ClinicSite } from "../types";
import { leadInsert, type LeadRow } from "../lib/leads";
import { getResultPath } from "./result";

export const QUIZ_FORM_ID = "implant-candidate-quiz";
export { quizConsentText };

type Insert = (sql: string, params: Array<string | null>) => Promise<void>;

async function defaultInsert(sql: string, params: Array<string | null>) {
  const { env } = await import("cloudflare:workers");
  await env.DB.prepare(sql).bind(...params).run();
}

function invalid(fields?: Record<string, string>) {
  return Response.json({ error: "Please check the highlighted fields.", fields: fields ?? {} }, { status: 400 });
}

export function quizLeadRow(site: ClinicSite, lead: ParsedLead, now = new Date()): LeadRow {
  const result = getResultPath(lead.answers);
  const score = scoreLead(lead.answers, lead.preferredContact);
  const consent = lead.marketingConsent ? quizConsentText(site.name) : "";
  return {
    id: crypto.randomUUID(),
    formId: QUIZ_FORM_ID,
    pagePath: "/implant-candidate-quiz/",
    name: lead.firstName,
    email: lead.email,
    phone: lead.phone,
    siteId: site.id,
    fields: {
      preferredContact: lead.preferredContact,
      bestTime: lead.bestTime ?? "",
      marketingConsent: lead.marketingConsent ? "yes" : "no",
      consentText: consent,
      answers: JSON.stringify(lead.answers),
      answersVersion: ANSWERS_VERSION,
      resultPath: result.path,
      modifiers: JSON.stringify(result.modifiers),
      leadScore: String(score.score),
      leadTier: score.tier,
      attribution: JSON.stringify(lead.attribution ?? {}),
    },
  };
}

export async function handleQuizPost(
  request: Request,
  site: ClinicSite,
  options?: { now?: number; insert?: Insert },
) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalid();
  }

  const parsed = leadRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fields[key] ??= issue.message;
    }
    return invalid(fields);
  }

  const lead = parsed.data;
  const now = options?.now ?? Date.now();
  if (now - lead.startedAt < MIN_FILL_MS) return invalid();
  if (lead.website) return invalid();

  const result = getResultPath(lead.answers);
  const score = scoreLead(lead.answers, lead.preferredContact);
  const row = quizLeadRow(site, lead, new Date(now));
  const statement = leadInsert(row);

  try {
    await (options?.insert ?? defaultInsert)(statement.sql, statement.params);
    return Response.json(
      { id: row.id, resultPath: result.path, modifiers: result.modifiers, leadTier: score.tier },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "quiz_lead_store_failed",
        site: site.id,
        message: error instanceof Error ? error.message : "unknown",
      }),
    );
    return Response.json(
      { error: `We couldn't save your answers. Please call us at ${site.phone.label} and we'll help right away.` },
      { status: 500 },
    );
  }
}
