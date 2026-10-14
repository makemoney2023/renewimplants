"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FUNNEL_EVENTS, track } from "@/lib/analytics";
import { QUIZ_PATH } from "@/lib/quiz/constants";
import { withUtm } from "@/lib/utm";

const DISMISS_KEY = "renew:quiz-bar-dismissed";

function pageSlug(pathname: string) {
  if (pathname === "/") return "home";
  return pathname.replace(/^\//, "").replace(/\/$/, "");
}

function dismissedInSession() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function QuizStickyBar() {
  const pathname = usePathname() || "/";
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = bar.current;
    if (!node) return;
    node.hidden = dismissedInSession();
  }, [pathname]);

  if (pathname === QUIZ_PATH || pathname.startsWith(`${QUIZ_PATH}/`)) return null;

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
      sessionStorage.setItem(DISMISS_KEY, "1");
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
