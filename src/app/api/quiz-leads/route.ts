import { site } from "@/content/site";
import { leadRequestSchema, MIN_FILL_MS } from "@/lib/quiz/lead-schema";
import { insertQuizLead, toLeadRow } from "@/lib/quiz/lead-store";
import { getResultPath } from "@/lib/quiz/result";
import { scoreLead } from "@/lib/quiz/score";

const invalid = (fields?: Record<string, string>) =>
  Response.json({ error: "Please check the highlighted fields.", fields: fields ?? {} }, { status: 400 });

export async function POST(request: Request) {
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
  if (Date.now() - lead.startedAt < MIN_FILL_MS) return invalid();

  const result = getResultPath(lead.answers);
  const score = scoreLead(lead.answers, lead.preferredContact);

  try {
    const { id } = await insertQuizLead(toLeadRow(lead, result, score, new Date()));
    return Response.json(
      { id, resultPath: result.path, modifiers: result.modifiers, leadTier: score.tier },
      { status: 201 },
    );
  } catch (error) {
    console.error("quiz lead could not be stored", error);
    return Response.json(
      { error: `We couldn't save your answers. Please call us at ${site.phone.label} and we'll help right away.` },
      { status: 500 },
    );
  }
}
