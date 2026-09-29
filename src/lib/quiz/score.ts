import type { QuizAnswers } from "./questions";

export type LeadTier = "hot" | "warm" | "nurture";
export type PreferredContact = "call" | "text" | "email";

const timelinePoints: Record<string, number> = { asap: 40, "1-3": 30, "3-6": 15, researching: 5 };
const situationPoints: Record<string, number> = { many: 25, dentures: 25, failed: 20, few: 10 };

export function tierForScore(score: number): LeadTier {
  if (score >= 70) return "hot";
  if (score >= 45) return "warm";
  return "nurture";
}

export function scoreLead(answers: QuizAnswers, preferredContact: PreferredContact) {
  const timeline = timelinePoints[answers.timeline?.[0] ?? ""] ?? 0;
  const situation = situationPoints[answers.situation?.[0] ?? ""] ?? 0;
  const payment = answers.payment?.some((id) => id !== "unsure") ? 10 : answers.payment?.length ? 5 : 0;
  const location = answers.location?.[0] && answers.location[0] !== "further" ? 10 : 0;
  const wantsCall = preferredContact === "call" ? 5 : 0;

  const score = timeline + situation + payment + location + wantsCall;
  return { score, tier: tierForScore(score) };
}
