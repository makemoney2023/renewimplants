"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FUNNEL_EVENTS, track } from "../../../../src/lib/analytics";
import { withUtm } from "../../../../src/lib/utm";
import { QUIZ_PATH } from "../../quiz/paths";

export function QuizCta({
  source,
  medium,
  campaign,
  content,
  label = "Take the 2-minute implant candidate quiz",
  intro,
}: {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  label?: string;
  intro?: string;
}) {
  const href = withUtm(QUIZ_PATH, {
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: content,
  });

  return (
    <div className={intro ? "quiz-cta" : "quiz-cta quiz-cta-compact"}>
      {intro ? <p>{intro}</p> : null}
      <Link
        className="button button-primary"
        href={href}
        onClick={() => track(FUNNEL_EVENTS.quiz_cta_clicked, { source, medium, campaign })}
      >
        {label}
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </div>
  );
}
