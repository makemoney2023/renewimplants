"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { FUNNEL_EVENTS, track } from "@/lib/analytics";

export function QuizCallLink({ resultPath }: { resultPath: string | null }) {
  return (
    <Button asChild size="lg">
      <a
        href={site.phone.href}
        onClick={() => track(FUNNEL_EVENTS.quiz_call_clicked, { result_path: resultPath ?? "unknown" })}
      >
        <Phone aria-hidden="true" />
        Call {site.phone.label}
      </a>
    </Button>
  );
}
