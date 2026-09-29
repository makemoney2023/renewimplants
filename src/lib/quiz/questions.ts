export const ANSWERS_VERSION = "v1";

export type QuestionId =
  | "situation"
  | "arch"
  | "frustrations"
  | "duration"
  | "health"
  | "comfort"
  | "payment"
  | "timeline"
  | "location";

export type QuizOption = { id: string; label: string };

export type QuizQuestion = {
  id: QuestionId;
  prompt: string;
  helper?: string;
  type: "single" | "multi";
  optional?: boolean;
  /** Multi-select options that clear every other choice ("None of these"). */
  exclusive?: string[];
  options: QuizOption[];
};

/** Every answer is an array of option ids; single questions hold exactly one. */
export type QuizAnswers = Partial<Record<QuestionId, string[]>>;

export const quizQuestions: QuizQuestion[] = [
  {
    id: "situation",
    prompt: "Which best describes your teeth today?",
    type: "single",
    options: [
      { id: "few", label: "Missing one or a few teeth" },
      { id: "many", label: "Missing many teeth, or my teeth are failing" },
      { id: "dentures", label: "I wear full or partial dentures" },
      { id: "failed", label: "Previous dental work has failed" },
    ],
  },
  {
    id: "arch",
    prompt: "Which area needs attention?",
    type: "single",
    options: [
      { id: "upper", label: "Upper teeth" },
      { id: "lower", label: "Lower teeth" },
      { id: "both", label: "Both" },
      { id: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "frustrations",
    prompt: "What bothers you most right now?",
    helper: "Choose all that apply.",
    type: "multi",
    options: [
      { id: "eating", label: "Trouble eating the foods I like" },
      { id: "loose", label: "Dentures slip or feel loose" },
      { id: "appearance", label: "How my smile looks" },
      { id: "pain", label: "Pain or discomfort" },
      { id: "speech", label: "Speaking clearly" },
    ],
  },
  {
    id: "duration",
    prompt: "How long have you been dealing with this?",
    type: "single",
    options: [
      { id: "under-1", label: "Less than a year" },
      { id: "1-5", label: "1 to 5 years" },
      { id: "over-5", label: "More than 5 years" },
    ],
  },
  {
    id: "health",
    prompt: "Anything we should know before your consultation?",
    helper: "Optional. This only helps your surgeon prepare. Choose all that apply.",
    type: "multi",
    optional: true,
    exclusive: ["none", "discuss"],
    options: [
      { id: "smoker", label: "I smoke or vape" },
      { id: "diabetes", label: "I have diabetes" },
      { id: "blood-thinners", label: "I take blood thinners" },
      { id: "none", label: "None of these" },
      { id: "discuss", label: "I'd rather discuss it in person" },
    ],
  },
  {
    id: "comfort",
    prompt: "How do you feel about dental visits?",
    type: "single",
    options: [
      { id: "comfortable", label: "I'm comfortable" },
      { id: "nervous", label: "A bit nervous" },
      { id: "very-anxious", label: "Very anxious" },
    ],
  },
  {
    id: "payment",
    prompt: "How are you thinking of paying for treatment?",
    helper: "Choose all that apply.",
    type: "multi",
    exclusive: ["unsure"],
    options: [
      { id: "insurance", label: "Private dental insurance" },
      { id: "cdcp", label: "Canadian Dental Care Plan (CDCP)" },
      { id: "plan", label: "A monthly payment plan" },
      { id: "self", label: "Paying myself" },
      { id: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "timeline",
    prompt: "When would you like to start?",
    type: "single",
    options: [
      { id: "asap", label: "As soon as possible" },
      { id: "1-3", label: "Within 1 to 3 months" },
      { id: "3-6", label: "In 3 to 6 months" },
      { id: "researching", label: "I'm just researching" },
    ],
  },
  {
    id: "location",
    prompt: "Where are you coming from?",
    type: "single",
    options: [
      { id: "orleans", label: "Orléans" },
      { id: "ottawa", label: "Elsewhere in Ottawa" },
      { id: "rockland", label: "Rockland, Clarence, or Cumberland" },
      { id: "embrun", label: "Embrun, Casselman, or Hawkesbury" },
      { id: "gatineau", label: "Gatineau" },
      { id: "further", label: "Further away" },
    ],
  },
];

export function getQuestion(id: QuestionId) {
  return quizQuestions.find((question) => question.id === id);
}

export function toggleAnswer(question: QuizQuestion, current: string[], optionId: string): string[] {
  if (question.type === "single") return [optionId];
  if (current.includes(optionId)) return current.filter((id) => id !== optionId);
  if (question.exclusive?.includes(optionId)) return [optionId];
  return [...current.filter((id) => !question.exclusive?.includes(id)), optionId];
}

export function isAnswered(question: QuizQuestion, picked: string[] | undefined) {
  return question.optional === true || (picked?.length ?? 0) > 0;
}
