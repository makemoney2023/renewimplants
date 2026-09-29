import type { RouteContent, RouteFaq } from "@/content/routes";
import { media, site } from "@/content/site";

type JsonLdNode = Record<string, unknown>;

export const schemaIds = {
  practice: `${site.url}/#practice`,
  website: `${site.url}/#website`,
  tom: `${site.url}/#person-tom-szarski`,
} as const;

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildPracticeNode(): JsonLdNode {
  return {
    "@type": "Dentist",
    "@id": schemaIds.practice,
    name: site.name,
    alternateName: site.shortName,
    description: site.description,
    url: `${site.url}/`,
    telephone: "+1-613-841-6111",
    email: site.email,
    image: absoluteUrl(media.heroClinic),
    hasMap: site.mapHref,
    address: {
      "@type": "PostalAddress",
      streetAddress: "2530 St Joseph Blvd #6",
      addressLocality: "Orléans",
      addressRegion: "ON",
      postalCode: "K1C 1G1",
      addressCountry: "CA",
    },
    areaServed: [
      "Orléans",
      "Ottawa",
      "Rockland",
      "Cumberland",
      "Embrun",
      "Casselman",
      "Hawkesbury",
      "Gatineau",
      "Kanata",
      "Barrhaven",
    ],
    availableLanguage: ["en", "fr"],
    paymentAccepted: "Canadian Dental Care Plan (CDCP), private dental insurance, in-house payment plans",
    founder: { "@id": schemaIds.tom },
  };
}

export function buildTomNode(): JsonLdNode {
  return {
    "@type": "Person",
    "@id": schemaIds.tom,
    name: "Tom Szarski",
    honorificSuffix: "DD",
    jobTitle: "Denturist",
    url: absoluteUrl("/meet-your-dentist"),
    image: absoluteUrl(media.tom),
    worksFor: { "@id": schemaIds.practice },
    alumniOf: { "@type": "CollegeOrUniversity", name: "George Brown College" },
    memberOf: { "@type": "Organization", name: "Denturist Association of Ontario" },
  };
}

export function buildWebsiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": schemaIds.website,
    url: `${site.url}/`,
    name: site.name,
    inLanguage: "en-CA",
    publisher: { "@id": schemaIds.practice },
  };
}

export function buildSiteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [buildPracticeNode(), buildWebsiteNode(), buildTomNode()],
  };
}

export type Crumb = { name: string; path: string };

export function buildBreadcrumbNode(pageUrl: string, crumbs: Crumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function buildFaqNode(pageUrl: string, faqs: RouteFaq[] | undefined): JsonLdNode | null {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function buildRouteGraph(page: RouteContent) {
  const pageUrl = absoluteUrl(`/${page.slug}`);
  const isTreatment = page.slug.startsWith("services/");

  const webPage: JsonLdNode = {
    "@type": isTreatment ? "MedicalWebPage" : "WebPage",
    "@id": `${pageUrl}#page`,
    url: pageUrl,
    name: page.title,
    description: page.intro,
    image: absoluteUrl(page.image),
    inLanguage: "en-CA",
    isPartOf: { "@id": schemaIds.website },
    about: { "@id": schemaIds.practice },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
  };

  const graph = [
    webPage,
    buildBreadcrumbNode(pageUrl, [{ name: page.title, path: `/${page.slug}` }]),
    buildFaqNode(pageUrl, page.faqs),
  ].filter((node): node is JsonLdNode => node !== null);

  return { "@context": "https://schema.org", "@graph": graph };
}
