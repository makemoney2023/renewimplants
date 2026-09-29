import { describe, expect, it } from "vitest";
import { getRouteSlugs } from "@/content/routes";
import { getAllPosts } from "@/lib/blog";
import type { QuizAnswers } from "./questions";
import { getResultPath, modifierContent, parseResultQuery, resultContent } from "./result";

const base: QuizAnswers = {
  situation: ["many"],
  arch: ["both"],
  frustrations: ["eating"],
  duration: ["1-5"],
  comfort: ["comfortable"],
  payment: ["unsure"],
  timeline: ["researching"],
  location: ["orleans"],
};

describe("getResultPath", () => {
  it.each([
    ["many", "full-arch"],
    ["dentures", "denture-alternative"],
    ["failed", "failed-work"],
    ["few", "individual"],
  ])("maps situation %s to the %s path", (situation, path) => {
    expect(getResultPath({ ...base, situation: [situation] }).path).toBe(path);
  });

  it("adds no modifiers for a comfortable, local, unsure payer with both arches", () => {
    expect(getResultPath(base).modifiers).toEqual([]);
  });

  it("adds sedation for nervous and very anxious patients", () => {
    expect(getResultPath({ ...base, comfort: ["nervous"] }).modifiers).toContain("sedation");
    expect(getResultPath({ ...base, comfort: ["very-anxious"] }).modifiers).toContain("sedation");
  });

  it("adds the matching jaw for upper or lower", () => {
    expect(getResultPath({ ...base, arch: ["upper"] }).modifiers).toContain("upper");
    expect(getResultPath({ ...base, arch: ["lower"] }).modifiers).toContain("lower");
  });

  it("adds coverage when the patient has insurance, CDCP, or wants a plan", () => {
    for (const payment of ["insurance", "cdcp", "plan"]) {
      expect(getResultPath({ ...base, payment: [payment] }).modifiers).toContain("coverage");
    }
    expect(getResultPath({ ...base, payment: ["self"] }).modifiers).not.toContain("coverage");
  });

  it("adds a health note for any flagged condition, but not for none or skipped", () => {
    expect(getResultPath({ ...base, health: ["smoker"] }).modifiers).toContain("health-note");
    expect(getResultPath({ ...base, health: ["none"] }).modifiers).not.toContain("health-note");
    expect(getResultPath({ ...base, health: ["discuss"] }).modifiers).not.toContain("health-note");
    expect(getResultPath(base).modifiers).not.toContain("health-note");
  });

  it("adds a travel note for patients outside the service area", () => {
    expect(getResultPath({ ...base, location: ["further"] }).modifiers).toContain("travel");
  });
});

describe("result content", () => {
  const known = new Set([
    "/",
    ...getRouteSlugs().map((slug) => `/${slug}`),
    "/blog",
    ...getAllPosts().map((post) => post.url),
  ]);

  it("only links to pages that exist", () => {
    const links = [
      ...Object.values(resultContent).flatMap((entry) => entry.links),
      ...Object.values(modifierContent).flatMap((entry) => (entry.link ? [entry.link] : [])),
    ];
    for (const link of links) expect(known, link.href).toContain(link.href);
  });

  it("never states a price", () => {
    expect(JSON.stringify({ resultContent, modifierContent })).not.toMatch(/\$\s?\d/);
  });

  it("frames results as education, not a diagnosis", () => {
    for (const entry of Object.values(resultContent)) {
      expect(entry.summary).not.toMatch(/you are a candidate|you qualify/i);
    }
  });
});

describe("parseResultQuery", () => {
  it("reads a known path and known modifiers", () => {
    expect(parseResultQuery({ path: "full-arch", m: "sedation,coverage" })).toEqual({
      path: "full-arch",
      modifiers: ["sedation", "coverage"],
    });
  });

  it("drops unknown values and falls back to no path", () => {
    expect(parseResultQuery({ path: "nope", m: "sedation,<script>" })).toEqual({
      path: null,
      modifiers: ["sedation"],
    });
    expect(parseResultQuery({})).toEqual({ path: null, modifiers: [] });
  });
});
