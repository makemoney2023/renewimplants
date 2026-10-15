"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { site } from "@/content/load";
import { FUNNEL_EVENTS, track } from "../../../../src/lib/analytics";
import {
  ANSWERS_VERSION,
  isAnswered,
  quizQuestions,
  toggleAnswer,
  type QuizAnswers,
} from "../../../../src/lib/quiz/questions";
import { QUIZ_THANK_YOU_PATH } from "../../quiz/paths";
import { getResultPath, resultContent } from "../../quiz/result";
import { QuizLeadForm, type LeadResponse } from "./quiz-lead-form";
import { QuizQuestion } from "./quiz-question";

type Progress = { version: string; step: number; answers: QuizAnswers; startedAt: number };

const subscribeToNothing = () => () => {};

function storageKey() {
  return `${site.id}:quiz-progress`;
}

function loadProgress(): Progress | null {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey()) ?? "null") as Progress | null;
    return saved?.version === ANSWERS_VERSION ? saved : null;
  } catch {
    return null;
  }
}

export function QuizFlow({ privacyPath }: { privacyPath?: string }) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const restored = useMemo(() => (hydrated ? loadProgress() : null), [hydrated]);
  const [fresh] = useState<Progress>(() => ({
    version: ANSWERS_VERSION,
    step: 0,
    answers: {},
    startedAt: Date.now(),
  }));
  const [edited, setEdited] = useState<Progress | null>(null);
  const progress = edited ?? restored ?? fresh;
  const previewTracked = useRef(false);

  const setProgress = (update: (current: Progress) => Progress) =>
    setEdited((current) => update(current ?? restored ?? fresh));

  useEffect(() => {
    if (edited) localStorage.setItem(storageKey(), JSON.stringify(edited));
  }, [edited]);

  const total = quizQuestions.length;
  const finished = progress.step >= total;
  const question = quizQuestions[Math.min(progress.step, total - 1)];
  const picked = progress.answers[question.id] ?? [];
  const result = finished ? getResultPath(progress.answers) : null;

  useEffect(() => {
    if (result && !previewTracked.current) {
      previewTracked.current = true;
      track(FUNNEL_EVENTS.quiz_result_previewed, { result_path: result.path });
    }
  }, [result]);

  function toggle(optionId: string) {
    if (Object.keys(progress.answers).length === 0) track(FUNNEL_EVENTS.quiz_started);
    setProgress((current) => ({
      ...current,
      answers: { ...current.answers, [question.id]: toggleAnswer(question, picked, optionId) },
    }));
  }

  function next() {
    track(FUNNEL_EVENTS.quiz_step_completed, { step: progress.step + 1, question: question.id });
    setProgress((current) => ({ ...current, step: current.step + 1 }));
  }

  function back() {
    setProgress((current) => ({ ...current, step: Math.max(0, current.step - 1) }));
  }

  function submitted(response: LeadResponse) {
    track(FUNNEL_EVENTS.generate_lead, { result_path: response.resultPath });
    localStorage.removeItem(storageKey());
    const query = new URLSearchParams({ path: response.resultPath });
    if (response.modifiers.length > 0) query.set("m", response.modifiers.join(","));
    router.push(`${QUIZ_THANK_YOU_PATH}?${query.toString()}`);
  }

  if (result) {
    const copy = resultContent[result.path];
    return (
      <section className="quiz-card" aria-live="polite">
        <p className="section-label">Your likely path</p>
        <h2>{copy.title}</h2>
        <p>{copy.summary}</p>
        <p className="quiz-lead-intro">
          Where should we send your full results? A member of the {site.shortName} team will follow up to answer
          questions.
        </p>
        <QuizLeadForm
          answers={progress.answers}
          startedAt={progress.startedAt}
          onSubmitted={submitted}
          privacyPath={privacyPath}
        />
        <button className="button button-outline" type="button" onClick={back}>
          Back
        </button>
      </section>
    );
  }

  const percent = Math.round((progress.step / total) * 100);

  return (
    <section className="quiz-card">
      <div className="quiz-progress">
        <p>
          Question {progress.step + 1} of {total}
        </p>
        <div className="quiz-meter" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Quiz progress">
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
      <QuizQuestion question={question} picked={picked} onToggle={toggle} />
      <div className="quiz-nav">
        {progress.step > 0 ? (
          <button className="button button-outline" type="button" onClick={back}>
            Back
          </button>
        ) : (
          <span />
        )}
        <button className="button button-primary" type="button" onClick={next} disabled={!isAnswered(question, picked)}>
          {progress.step === total - 1 ? "See my result" : "Next"}
        </button>
      </div>
    </section>
  );
}
