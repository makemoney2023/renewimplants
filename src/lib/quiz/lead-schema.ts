import { z } from "zod";
import { quizQuestions, type QuizAnswers } from "./questions";

export const CONSENT_TEXT =
  "Email or text me occasional tips and updates from Renew Implant Centre. I can unsubscribe anytime.";

/** Submissions faster than this are treated as bots. */
export const MIN_FILL_MS = 4000;

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) return null;
  return `+1${national}`;
}

function answersIssue(answers: Record<string, string[]>): string | null {
  for (const question of quizQuestions) {
    const picked = answers[question.id];
    if (!picked || picked.length === 0) {
      if (question.optional) continue;
      return `${question.id} is required`;
    }
    const allowed = new Set(question.options.map((option) => option.id));
    if (picked.some((id) => !allowed.has(id))) return `${question.id} has an unknown option`;
    if (new Set(picked).size !== picked.length) return `${question.id} has duplicate options`;
    if (question.type === "single" && picked.length !== 1) return `${question.id} takes one answer`;
    const exclusive = picked.filter((id) => question.exclusive?.includes(id));
    if (exclusive.length > 0 && picked.length > 1) return `${question.id} combines an exclusive option`;
  }
  const known = new Set<string>(quizQuestions.map((question) => question.id));
  const unknown = Object.keys(answers).find((key) => !known.has(key));
  return unknown ? `${unknown} is not a question` : null;
}

const answersSchema = z
  .record(z.string(), z.array(z.string().max(40)).max(10))
  .superRefine((answers, ctx) => {
    const issue = answersIssue(answers);
    if (issue) ctx.addIssue({ code: "custom", message: issue });
  })
  .transform((answers) => answers as QuizAnswers);

const shortText = z.string().trim().max(200).optional();

export const leadRequestSchema = z.object({
  firstName: z.string().trim().min(1, "Please enter your first name").max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("Please enter a valid email").max(254)),
  phone: z
    .string()
    .transform((value, ctx) => {
      const phone = normalizePhone(value);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Please enter a 10-digit phone number" });
        return z.NEVER;
      }
      return phone;
    }),
  preferredContact: z.enum(["call", "text", "email"]),
  bestTime: z.string().trim().max(80).optional(),
  marketingConsent: z.boolean(),
  answers: answersSchema,
  attribution: z
    .object({
      utm_source: shortText,
      utm_medium: shortText,
      utm_campaign: shortText,
      utm_term: shortText,
      utm_content: shortText,
      landing_path: shortText,
      referrer: shortText,
    })
    .optional(),
  startedAt: z.number().int().positive(),
  website: z.string().max(0).optional(),
});

export type LeadRequest = z.input<typeof leadRequestSchema>;
export type ParsedLead = z.output<typeof leadRequestSchema>;
