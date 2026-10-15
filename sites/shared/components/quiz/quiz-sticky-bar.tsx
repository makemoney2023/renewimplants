"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/load";
import { FUNNEL_EVENTS, track } from "../../../../src/lib/analytics";
import { withUtm } from "../../../../src/lib/utm";
import { isQuizRoute, QUIZ_PATH } from "../../quiz/paths";

function pageSlug(pathname: string) {
  if (pathname === "/") return "home";
  return pathname.replace(/^\//, "").replace(/\/$/, "");
}

export function QuizStickyBar() {
  const pathname = usePathname() || "/";
  const bar = useRef<HTMLElement>(null);
  const dismissKey = `${site.id}:quiz-bar-dismissed`;

  useEffect(() => {
    const node = bar.current;
    if (!node) return;
    try {
      node.hidden = sessionStorage.getItem(dismissKey) === "1";
    } catch {
      node.hidden = false;
    }
  }, [pathname, dismissKey]);

  if (isQuizRoute(pathname)) return null;

  const slug = pageSlug(pathname);
  const href = withUtm(QUIZ_PATH, {
    utm_source: "site",
    utm_medium: "sticky-footer",
    utm_campaign: "quiz",
    utm_content: slug,
  });

  function dismiss() {
    if (bar.current) bar.current.hidden = true;
    try {
      sessionStorage.setItem(dismissKey, "1");
    } catch {
      // Private mode can block storage. Hiding for this view is enough.
    }
  }

  return (
    <aside ref={bar} className="quiz-sticky" aria-label="Take the implant candidate quiz">
      <p>Nine questions. A personalized next step.</p>
      <Link
        href={href}
        onClick={() =>
          track(FUNNEL_EVENTS.quiz_cta_clicked, {
            source: "site",
            medium: "sticky-footer",
            campaign: "quiz",
            content: slug,
          })
        }
      >
        Take the quiz
      </Link>
      <button type="button" onClick={dismiss} aria-label="Dismiss quiz prompt">
        Close
      </button>
    </aside>
  );
}
