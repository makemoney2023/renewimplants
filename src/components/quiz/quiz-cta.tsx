"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FUNNEL_EVENTS, track } from "@/lib/analytics";
import { QUIZ_PATH } from "@/lib/quiz/constants";
import { withUtm } from "@/lib/utm";

type QuizCtaProps = {
  source: string;
  medium: string;
  campaign: string;
  label?: string;
  /** Short lead-in shown above the button; omit for a compact button-only card. */
  intro?: string;
};

export function QuizCta({
  source,
  medium,
  campaign,
  label = "Take the 2-minute implant candidate quiz",
  intro,
}: QuizCtaProps) {
  const href = withUtm(QUIZ_PATH, { utm_source: source, utm_medium: medium, utm_campaign: campaign });

  return (
    <aside className={intro ? "quiz-cta" : "quiz-cta quiz-cta-compact"}>
      {intro ? <p>{intro}</p> : null}
      <Button asChild size="lg">
        <Link href={href} onClick={() => track(FUNNEL_EVENTS.quiz_cta_clicked, { source, medium, campaign })}>
          {label}
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </Button>
    </aside>
  );
}
