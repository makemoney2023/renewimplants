"use client";

import { Phone } from "lucide-react";
import { site } from "@/content/load";
import { FUNNEL_EVENTS, track } from "../../../../src/lib/analytics";

export function QuizCallLink({ resultPath }: { resultPath: string | null }) {
  return (
    <a
      className="button button-primary"
      href={site.phone.href}
      onClick={() => track(FUNNEL_EVENTS.quiz_call_clicked, { result_path: resultPath ?? "unknown" })}
    >
      <Phone aria-hidden="true" />
      Call {site.phone.label}
    </a>
  );
}
