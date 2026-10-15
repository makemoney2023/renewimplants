import { z } from "zod";
import type { ClinicForm, ClinicSite, FormField } from "../types";
import { normalizePhone } from "./phone";

export { normalizePhone };

export const MIN_FILL_MS = 4000;

const INSERT_LEAD = `INSERT INTO leads (
  id, form_id, page_path, name, email, phone, fields, site_id
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

export type LeadRow = {
  id: string;
  formId: string;
  pagePath: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  siteId: string;
  fields: Record<string, string>;
};

export function leadInsert(row: LeadRow) {
  return {
    sql: INSERT_LEAD,
    params: [
      row.id,
      row.formId,
      row.pagePath,
      row.name,
      row.email,
      row.phone,
      JSON.stringify(row.fields),
      row.siteId,
    ] as Array<string | null>,
  };
}

type LeadResult =
  | { ok: true; row: LeadRow }
  | { ok: false; fields: Record<string, string> };

export function validateLead(site: ClinicSite, input: unknown, now = Date.now()): LeadResult {
  const envelope = z
    .object({
      formId: z.string().trim().min(1).max(80),
      pagePath: z.string().trim().min(1).max(300),
      startedAt: z.number(),
      website: z.string().optional(),
      fields: z.record(z.string(), z.string().max(4000)),
    })
    .safeParse(input);

  if (!envelope.success) {
    return { ok: false, fields: { form: "Please check the form and try again." } };
  }

  const body = envelope.data;
  if (body.website) return { ok: false, fields: {} };
  if (now - body.startedAt < MIN_FILL_MS) return { ok: false, fields: {} };
  if (!body.pagePath.startsWith("/")) {
    return { ok: false, fields: { pagePath: "Missing page." } };
  }

  const form = site.forms.find((item) => item.id === body.formId);
  if (!form) return { ok: false, fields: { formId: "Unknown form." } };

  const fields: Record<string, string> = {};
  const errors: Record<string, string> = {};
  const allowed = new Set(form.fields.map((field) => field.name));

  for (const key of Object.keys(body.fields)) {
    if (!allowed.has(key)) errors[key] = "Unexpected field.";
  }

  for (const field of form.fields) {
    const raw = (body.fields[field.name] ?? "").trim();
    const parsed = parseField(field, raw);
    if (parsed.error) errors[field.name] = parsed.error;
    else if (parsed.value) fields[field.name] = parsed.value;
  }

  if (Object.keys(errors).length > 0) return { ok: false, fields: errors };

  const name = [fields.firstName, fields.lastName].filter(Boolean).join(" ") || fields.name || null;

  return {
    ok: true,
    row: {
      id: crypto.randomUUID(),
      formId: form.id,
      pagePath: body.pagePath,
      name,
      email: fields.email ?? null,
      phone: fields.phone ?? null,
      siteId: site.id,
      fields,
    },
  };
}

function choiceOptions(field: FormField) {
  return (field.options ?? []).filter((option) => option && option !== field.label);
}

function parseField(field: FormField, raw: string): { value?: string; error?: string } {
  if (!raw) {
    return field.required ? { error: `Please enter ${field.label}.` } : {};
  }

  if (field.type === "email") {
    const email = z.string().trim().toLowerCase().pipe(z.email()).safeParse(raw);
    if (!email.success) return { error: "Please enter a valid email." };
    return { value: email.data };
  }

  if (field.type === "tel") {
    const phone = normalizePhone(raw);
    if (!phone) return { error: "Please enter a 10-digit phone number." };
    return { value: phone };
  }

  if (field.type === "select" || field.type === "radio") {
    const options = choiceOptions(field);
    if (!options.includes(raw)) return { error: `Please choose ${field.label}.` };
    return { value: raw };
  }

  if (raw.length > (field.type === "textarea" ? 4000 : 200)) {
    return { error: `${field.label} is too long.` };
  }

  return { value: raw };
}

export function findForm(site: ClinicSite, id: string): ClinicForm | undefined {
  return site.forms.find((form) => form.id === id);
}

type Insert = (sql: string, params: Array<string | null>) => Promise<void>;

async function defaultInsert(sql: string, params: Array<string | null>) {
  const { env } = await import("cloudflare:workers");
  await env.DB.prepare(sql).bind(...params).run();
}

export async function handleLeadPost(
  request: Request,
  site: ClinicSite,
  options?: { now?: number; insert?: Insert },
) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Please check the highlighted fields.", fields: {} }, { status: 400 });
  }

  const parsed = validateLead(site, payload, options?.now ?? Date.now());
  if (!parsed.ok) {
    return Response.json(
      { error: "Please check the highlighted fields.", fields: parsed.fields },
      { status: 400 },
    );
  }

  const statement = leadInsert(parsed.row);
  try {
    await (options?.insert ?? defaultInsert)(statement.sql, statement.params);
    return Response.json({ id: parsed.row.id }, { status: 201 });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "lead_store_failed",
        message: error instanceof Error ? error.message : "unknown",
      }),
    );
    return Response.json(
      { error: `We couldn't save your request. Please call us at ${site.phone.label}.` },
      { status: 500 },
    );
  }
}
