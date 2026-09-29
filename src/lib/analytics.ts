export const FUNNEL_EVENTS = {
  quiz_started: "quiz_started",
  quiz_step_completed: "quiz_step_completed",
  quiz_result_previewed: "quiz_result_previewed",
  generate_lead: "generate_lead",
  quiz_call_clicked: "quiz_call_clicked",
  quiz_cta_clicked: "quiz_cta_clicked",
} as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[keyof typeof FUNNEL_EVENTS];

export type EventProperties = Record<string, string | number | boolean | null | undefined>;

type Gtag = (command: "event", name: string, properties?: EventProperties) => void;

export function track(event: FunnelEvent, properties?: EventProperties) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", event, properties);
}
