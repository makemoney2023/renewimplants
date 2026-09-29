import { describe, expect, it } from "vitest";
import { ANSWERS_VERSION, getQuestion, isAnswered, quizQuestions, toggleAnswer } from "./questions";

describe("quiz questions", () => {
  it("asks nine questions with unique ids", () => {
    expect(quizQuestions).toHaveLength(9);
    expect(new Set(quizQuestions.map((q) => q.id)).size).toBe(9);
  });

  it("keeps option ids unique within each question", () => {
    for (const question of quizQuestions) {
      const ids = question.options.map((option) => option.id);
      expect(new Set(ids).size, question.id).toBe(ids.length);
    }
  });

  it("only lets the health question be skipped", () => {
    expect(quizQuestions.filter((q) => q.optional).map((q) => q.id)).toEqual(["health"]);
  });

  it("declares exclusive options that exist on their question", () => {
    for (const question of quizQuestions) {
      for (const id of question.exclusive ?? []) {
        expect(question.type).toBe("multi");
        expect(question.options.map((o) => o.id)).toContain(id);
      }
    }
  });

  it("versions the answer format", () => {
    expect(ANSWERS_VERSION).toBe("v1");
  });

  it("looks questions up by id", () => {
    expect(getQuestion("timeline")?.type).toBe("single");
    expect(getQuestion("payment")?.type).toBe("multi");
  });
});

describe("toggleAnswer", () => {
  const single = getQuestion("situation")!;
  const multi = getQuestion("health")!;

  it("replaces the choice on single questions", () => {
    expect(toggleAnswer(single, ["few"], "many")).toEqual(["many"]);
  });

  it("toggles choices on multi questions", () => {
    expect(toggleAnswer(multi, ["smoker"], "diabetes")).toEqual(["smoker", "diabetes"]);
    expect(toggleAnswer(multi, ["smoker", "diabetes"], "smoker")).toEqual(["diabetes"]);
  });

  it("lets an exclusive option clear the others, and vice versa", () => {
    expect(toggleAnswer(multi, ["smoker", "diabetes"], "none")).toEqual(["none"]);
    expect(toggleAnswer(multi, ["none"], "smoker")).toEqual(["smoker"]);
  });
});

describe("isAnswered", () => {
  it("requires a choice unless the question is optional", () => {
    expect(isAnswered(getQuestion("situation")!, undefined)).toBe(false);
    expect(isAnswered(getQuestion("situation")!, ["few"])).toBe(true);
    expect(isAnswered(getQuestion("health")!, [])).toBe(true);
  });
});
