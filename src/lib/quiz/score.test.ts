import { describe, expect, it } from "vitest";
import type { QuizAnswers } from "./questions";
import { scoreLead, tierForScore } from "./score";

const answers = (overrides: QuizAnswers): QuizAnswers => ({
  situation: ["many"],
  arch: ["both"],
  frustrations: ["eating"],
  duration: ["1-5"],
  comfort: ["comfortable"],
  payment: ["cdcp"],
  timeline: ["asap"],
  location: ["orleans"],
  ...overrides,
});

describe("tierForScore", () => {
  it.each([
    [70, "hot"],
    [69, "warm"],
    [45, "warm"],
    [44, "nurture"],
    [0, "nurture"],
  ])("puts %i in %s", (score, tier) => {
    expect(tierForScore(score)).toBe(tier);
  });
});

describe("scoreLead", () => {
  it("rates an urgent, local, full-arch CDCP patient as hot", () => {
    const result = scoreLead(answers({}), "call");
    expect(result).toEqual({ score: 90, tier: "hot" });
  });

  it("rates a far-away researcher with one missing tooth as nurture", () => {
    const result = scoreLead(
      answers({ situation: ["few"], timeline: ["researching"], location: ["further"], payment: ["unsure"] }),
      "email",
    );
    expect(result).toEqual({ score: 20, tier: "nurture" });
  });

  it("gives payment credit when any concrete method is chosen alongside not sure", () => {
    const withMethod = scoreLead(answers({ payment: ["self", "unsure"] }), "email").score;
    const unsureOnly = scoreLead(answers({ payment: ["unsure"] }), "email").score;
    expect(withMethod - unsureOnly).toBe(5);
  });

  it("adds five points when the patient wants a call", () => {
    expect(scoreLead(answers({}), "call").score - scoreLead(answers({}), "text").score).toBe(5);
  });
});
