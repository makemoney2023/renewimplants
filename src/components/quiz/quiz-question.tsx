"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { QuizQuestion as Question } from "@/lib/quiz/questions";

type QuizQuestionProps = {
  question: Question;
  picked: string[];
  onToggle: (optionId: string) => void;
};

export function QuizQuestion({ question, picked, onToggle }: QuizQuestionProps) {
  const inputId = (optionId: string) => `quiz-${question.id}-${optionId}`;

  return (
    <fieldset className="quiz-question">
      <legend>
        <h2>{question.prompt}</h2>
      </legend>
      {question.helper ? <p className="quiz-helper">{question.helper}</p> : null}

      {question.type === "single" ? (
        <RadioGroup value={picked[0] ?? ""} onValueChange={onToggle} className="quiz-options">
          {question.options.map((option) => (
            <Label key={option.id} htmlFor={inputId(option.id)} className="quiz-option">
              <RadioGroupItem id={inputId(option.id)} value={option.id} />
              {option.label}
            </Label>
          ))}
        </RadioGroup>
      ) : (
        <div className="quiz-options">
          {question.options.map((option) => (
            <Label key={option.id} htmlFor={inputId(option.id)} className="quiz-option">
              <Checkbox
                id={inputId(option.id)}
                checked={picked.includes(option.id)}
                onCheckedChange={() => onToggle(option.id)}
              />
              {option.label}
            </Label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
