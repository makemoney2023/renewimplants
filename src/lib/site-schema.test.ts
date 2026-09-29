import { describe, expect, it } from "vitest";
import { getRouteContent } from "@/content/routes";
import { site } from "@/content/site";
import { getFaqSchema, getOrganizationSchema, getWebPageSchema } from "./site-schema";

describe("structured data", () => {
  it("describes the clinic as a local dentist with the verified NAP", () => {
    const graph = getOrganizationSchema()["@graph"];
    const practice = graph.find((node) => node["@type"] === "Dentist");

    expect(practice).toMatchObject({
      name: site.name,
      telephone: "+1-613-841-6111",
      email: site.email,
      address: {
        streetAddress: "2530 St Joseph Blvd #6",
        addressLocality: "Orléans",
        addressRegion: "ON",
        postalCode: "K1C 1G1",
        addressCountry: "CA",
      },
    });
    expect(graph.find((node) => node["@type"] === "WebSite")).toBeDefined();
  });

  it("emits FAQPage markup only when a page carries questions", () => {
    const faq = getRouteContent("faq");
    const schema = getFaqSchema(faq?.faqs);
    expect(schema?.["@type"]).toBe("FAQPage");
    expect(schema?.mainEntity).toHaveLength(faq?.faqs?.length ?? 0);
    expect(schema?.mainEntity[0]).toMatchObject({
      "@type": "Question",
      acceptedAnswer: { "@type": "Answer" },
    });

    expect(getFaqSchema(undefined)).toBeNull();
    expect(getFaqSchema([])).toBeNull();
  });

  it("marks blog posts as articles and other pages as web pages", () => {
    const post = getRouteContent("blog/dentures-vs-dental-implants");
    const page = getRouteContent("pricing");

    expect(getWebPageSchema(post!)["@type"]).toBe("BlogPosting");
    expect(getWebPageSchema(page!)["@type"]).toBe("WebPage");
    expect(getWebPageSchema(page!).url).toBe(`${site.url}/pricing`);
  });
});
