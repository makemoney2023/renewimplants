import { describe, expect, it } from "vitest";
import { getRouteContent, getRouteSlugs } from "@/content/routes";
import { site } from "@/content/site";
import {
  buildFaqNode,
  buildRouteGraph,
  buildSiteGraph,
  schemaIds,
  serializeJsonLd,
} from "./site-schema";

type Node = Record<string, unknown>;

function nodeOfType(graph: Node[], type: string) {
  return graph.find((node) => node["@type"] === type);
}

describe("sitewide graph", () => {
  const graph = buildSiteGraph()["@graph"] as Node[];

  it("describes the clinic as a local dentist with the verified NAP", () => {
    expect(nodeOfType(graph, "Dentist")).toMatchObject({
      "@id": schemaIds.practice,
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
      founder: { "@id": schemaIds.tom },
    });
  });

  it("publishes the website from the practice", () => {
    expect(nodeOfType(graph, "WebSite")).toMatchObject({
      "@id": schemaIds.website,
      publisher: { "@id": schemaIds.practice },
    });
  });

  it("identifies Tom Szarski as a denturist, never a doctor", () => {
    const tom = nodeOfType(graph, "Person");
    expect(tom).toMatchObject({
      "@id": schemaIds.tom,
      name: "Tom Szarski",
      honorificSuffix: "DD",
      jobTitle: "Denturist",
      worksFor: { "@id": schemaIds.practice },
    });
    expect(JSON.stringify(tom)).not.toMatch(/Dr\.?\s*Szarski/);
  });

  it("uses absolute URLs only", () => {
    const urls = JSON.stringify(graph).match(/"(url|image|item)":"[^"]+"/g) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    for (const entry of urls) expect(entry).toMatch(/"https:\/\//);
  });
});

describe("route graph", () => {
  it("emits a single @graph with page, breadcrumb, and FAQ nodes", () => {
    const page = getRouteContent("faq")!;
    const graph = buildRouteGraph(page)["@graph"] as Node[];

    expect(nodeOfType(graph, "WebPage")).toMatchObject({
      "@id": `${site.url}/faq#page`,
      url: `${site.url}/faq`,
      isPartOf: { "@id": schemaIds.website },
      about: { "@id": schemaIds.practice },
      breadcrumb: { "@id": `${site.url}/faq#breadcrumb` },
    });
    expect(nodeOfType(graph, "BreadcrumbList")).toMatchObject({
      itemListElement: [
        { position: 1, name: "Home", item: `${site.url}/` },
        { position: 2, name: page.title, item: `${site.url}/faq` },
      ],
    });
    const faq = nodeOfType(graph, "FAQPage") as Node;
    expect(faq.mainEntity).toHaveLength(page.faqs!.length);
  });

  it("marks treatment pages as medical web pages", () => {
    const page = getRouteContent("services/all-on-4-dental-implants")!;
    const graph = buildRouteGraph(page)["@graph"] as Node[];
    expect(nodeOfType(graph, "MedicalWebPage")).toBeDefined();
  });

  it("omits the FAQ node when a page has no questions", () => {
    const withoutFaq = getRouteSlugs()
      .map((slug) => getRouteContent(slug)!)
      .find((page) => !page.faqs?.length)!;
    const graph = buildRouteGraph(withoutFaq)["@graph"] as Node[];
    expect(nodeOfType(graph, "FAQPage")).toBeUndefined();
  });
});

describe("helpers", () => {
  it("builds FAQ nodes only when there are questions", () => {
    expect(buildFaqNode("https://x.test/a", [])).toBeNull();
    expect(
      buildFaqNode("https://x.test/a", [{ question: "Q?", answer: "A." }]),
    ).toMatchObject({
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } },
      ],
    });
  });

  it("escapes < so JSON-LD cannot close its script tag", () => {
    const out = serializeJsonLd({ text: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ text: "</script><script>alert(1)</script>" });
  });
});
