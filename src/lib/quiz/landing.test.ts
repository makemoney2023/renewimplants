import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { schemaIds } from "../site-schema";
import { QUIZ_NAME, QUIZ_PATH } from "./constants";
import { buildQuizPageGraph, quizLanding } from "./landing";
import { quizQuestions } from "./questions";

type Node = Record<string, unknown>;
const url = `${site.url}${QUIZ_PATH}`;

describe("quiz landing content", () => {
  it("keeps SEO copy within snippet limits and free of prices and guarantees", () => {
    expect(quizLanding.title.length).toBeLessThanOrEqual(70);
    expect(quizLanding.description.length).toBeGreaterThanOrEqual(110);
    expect(quizLanding.description.length).toBeLessThanOrEqual(165);
    const copy = JSON.stringify(quizLanding);
    expect(copy).not.toMatch(/\$\s?\d|guarantee|Dr\.? (Tom|Szarski)/i);
  });

  it("explains every question in the extraction table", () => {
    expect(quizLanding.table.rows).toHaveLength(quizQuestions.length);
  });

  it("answers at least four questions, each with a question mark", () => {
    expect(quizLanding.faqs.length).toBeGreaterThanOrEqual(4);
    for (const faq of quizLanding.faqs) expect(faq.question.endsWith("?")).toBe(true);
  });
});

describe("buildQuizPageGraph", () => {
  const graph = buildQuizPageGraph()["@graph"] as Node[];

  it("describes the page, its breadcrumb, and the same FAQs shown on the page", () => {
    expect(graph.find((node) => node["@type"] === "WebPage")).toMatchObject({
      "@id": `${url}#page`,
      url,
      name: QUIZ_NAME,
      isPartOf: { "@id": schemaIds.website },
      about: { "@id": schemaIds.practice },
    });
    expect(graph.find((node) => node["@type"] === "BreadcrumbList")).toMatchObject({
      itemListElement: [{ position: 1 }, { position: 2, name: QUIZ_NAME, item: url }],
    });
    const faq = graph.find((node) => node["@type"] === "FAQPage") as { mainEntity: { name: string }[] };
    expect(faq.mainEntity.map((entry) => entry.name)).toEqual(quizLanding.faqs.map((entry) => entry.question));
  });
});
