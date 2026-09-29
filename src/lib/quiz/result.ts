import type { RouteLink } from "@/content/routes";
import type { QuizAnswers } from "./questions";

export const RESULT_PATHS = ["full-arch", "denture-alternative", "failed-work", "individual"] as const;
export type ResultPath = (typeof RESULT_PATHS)[number];

export const MODIFIERS = ["sedation", "upper", "lower", "coverage", "health-note", "travel"] as const;
export type Modifier = (typeof MODIFIERS)[number];

export type QuizResult = { path: ResultPath; modifiers: Modifier[] };

const pathBySituation: Record<string, ResultPath> = {
  many: "full-arch",
  dentures: "denture-alternative",
  failed: "failed-work",
  few: "individual",
};

const flaggedHealth = new Set(["smoker", "diabetes", "blood-thinners"]);
const coveredPayment = new Set(["insurance", "cdcp", "plan"]);

export function getResultPath(answers: QuizAnswers): QuizResult {
  const first = (id: keyof QuizAnswers) => answers[id]?.[0];
  const path = pathBySituation[first("situation") ?? ""] ?? "full-arch";
  const modifiers: Modifier[] = [];

  const comfort = first("comfort");
  if (comfort === "nervous" || comfort === "very-anxious") modifiers.push("sedation");

  const arch = first("arch");
  if (arch === "upper" || arch === "lower") modifiers.push(arch);

  if (answers.payment?.some((id) => coveredPayment.has(id))) modifiers.push("coverage");
  if (answers.health?.some((id) => flaggedHealth.has(id))) modifiers.push("health-note");
  if (first("location") === "further") modifiers.push("travel");

  return { path, modifiers };
}

type ResultCopy = { title: string; summary: string; detail: string; links: RouteLink[] };

export const resultContent: Record<ResultPath, ResultCopy> = {
  "full-arch": {
    title: "Full arch implants, like All-on-4",
    summary:
      "People who are missing many teeth, or whose teeth are failing, often explore a full arch of fixed teeth supported by four or more implants.",
    detail:
      "A full arch replaces a whole row of teeth with a fixed bridge that stays in — no adhesive and no taking it out at night. In many cases temporary teeth can be placed the same day. Your surgeon confirms whether that fits you after a 3D scan of your jawbone.",
    links: [
      { label: "All-on-4 dental implants", href: "/services/all-on-4-dental-implants" },
      { label: "Full arch dental implants", href: "/services/full-arch-dental-implants" },
      { label: "Same day dental implants", href: "/services/same-day-dental-implants" },
    ],
  },
  "denture-alternative": {
    title: "Implant-supported teeth instead of loose dentures",
    summary:
      "Denture wearers often explore two paths: snap-on dentures held by implants, or a fixed full arch that never comes out.",
    detail:
      "Snap-on dentures lock onto two or four implants so they stop slipping while you eat and talk. A fixed full arch goes further and stays in permanently. Years of wearing dentures doesn't automatically rule either option out — your bone is checked with a 3D scan at your free consultation.",
    links: [
      { label: "Denture alternatives", href: "/services/denture-alternative" },
      { label: "All-on-4 dental implants", href: "/services/all-on-4-dental-implants" },
      { label: "Dentures vs. dental implants", href: "/blog/dentures-vs-dental-implants" },
    ],
  },
  "failed-work": {
    title: "A fresh plan after failed dental work",
    summary:
      "When bridges, crowns, or earlier implants have failed, people often look for one long-term plan instead of another patch.",
    detail:
      "We start by finding out why the earlier work failed, then plan around the bone and gum health you have today. Because the surgeon, denturist, and lab work under one roof, the whole plan is designed by one team.",
    links: [
      { label: "Failed dental work", href: "/services/failed-dental-work" },
      { label: "Full arch dental implants", href: "/services/full-arch-dental-implants" },
    ],
  },
  individual: {
    title: "Replacing one or a few teeth",
    summary:
      "People missing one or a few teeth often explore individual implants, each with its own crown, or a small implant-supported bridge.",
    detail:
      "The right choice depends on how many teeth are missing, where they are, and the health of the teeth around them. Your free consultation includes a 3D scan so the options are clear before you decide anything.",
    links: [
      { label: "What to expect", href: "/what-to-expect" },
      { label: "Full arch vs. individual implants", href: "/blog/full-arch-vs-individual-dental-implants" },
    ],
  },
};

type ModifierCopy = { title: string; body: string; link?: RouteLink };

export const modifierContent: Record<Modifier, ModifierCopy> = {
  sedation: {
    title: "You can be as relaxed as you need",
    body: "Many of our patients are nervous. Oral sedation, IV sedation, and general anaesthesia are available in a monitored setting, and we'll talk through them before anything is booked.",
    link: { label: "Sedation dentistry", href: "/services/sedation-dentistry" },
  },
  upper: {
    title: "Upper jaw",
    body: "The upper jaw has its own considerations, like the sinuses. Angled implants are one way the upper arch can often be restored without bone grafting.",
    link: { label: "Upper jaw implants", href: "/services/upper-jaw-implants" },
  },
  lower: {
    title: "Lower jaw",
    body: "Lower dentures are the ones most likely to move. Implants give a lower arch the stability that suction alone can't.",
    link: { label: "Lower jaw implants", href: "/services/lower-jaw-implants" },
  },
  coverage: {
    title: "Coverage and payment plans",
    body: "We accept the Canadian Dental Care Plan (CDCP) and all major insurance, bill directly where possible, and offer in-house payment plans without third-party lenders. CDCP covers dentures and some implant-retained dentures but not every implant treatment, so our team checks exactly what applies to you. You'll get one all-inclusive price at your free consultation.",
    link: { label: "Pricing and financing", href: "/pricing" },
  },
  "health-note": {
    title: "About your health",
    body: "Thanks for letting us know. Conditions like diabetes or smoking don't automatically rule implants out. Your surgeon will review your health history with you at the free consultation.",
  },
  travel: {
    title: "Coming from further away",
    body: "Patients travel to us from across eastern Ontario and western Quebec. We'll plan your visits to keep trips to a minimum.",
    link: { label: "Service areas", href: "/service-areas" },
  },
};

export function parseResultQuery(query: { path?: string | string[]; m?: string | string[] }) {
  const rawPath = Array.isArray(query.path) ? query.path[0] : query.path;
  const rawModifiers = Array.isArray(query.m) ? query.m[0] : query.m;

  const path = RESULT_PATHS.find((candidate) => candidate === rawPath) ?? null;
  const modifiers = (rawModifiers ?? "")
    .split(",")
    .filter((value): value is Modifier => (MODIFIERS as readonly string[]).includes(value));

  return { path, modifiers };
}
