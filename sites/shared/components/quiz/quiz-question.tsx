"use client";

import type { QuizQuestion as Question } from "../../../../src/lib/quiz/questions";

export function QuizQuestion({
  question,
  picked,
  onToggle,
}: {
  question: Question;
  picked: string[];
  onToggle: (optionId: string) => void;
}) {
  const headingId = `quiz-question-${question.id}`;

  return (
    <fieldset className="quiz-question" aria-labelledby={headingId}>
      <h2 id={headingId}>{question.prompt}</h2>
      {question.helper ? <p className="quiz-helper">{question.helper}</p> : null}
      <div className="quiz-options">
        {question.options.map((option) => {
          const id = `quiz-${question.id}-${option.id}`;
          const checked = picked.includes(option.id);
          return (
            <label key={option.id} className="quiz-option" htmlFor={id}>
              <input
                id={id}
                type={question.type === "single" ? "radio" : "checkbox"}
                name={question.id}
                value={option.id}
                checked={checked}
                onChange={() => onToggle(option.id)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
