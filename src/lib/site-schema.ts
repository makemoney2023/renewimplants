import type { RouteContent, RouteFaq } from "@/content/routes";
import { media, site } from "@/content/site";
import { siteOrigin } from "@/lib/site-origin";

type JsonLdNode = Record<string, unknown>;

export const schemaIds = {
  practice: `${site.url}/#practice`,
  website: `${site.url}/#website`,
  tom: `${site.url}/#person-tom-szarski`,
} as const;

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildPracticeNode(): JsonLdNode {
  return {
    "@type": ["Dentist", "MedicalClinic"],
    "@id": schemaIds.practice,
    name: site.name,
    alternateName: site.shortName,
    description: site.description,
    url: `${site.url}/`,
    telephone: "+1-613-841-6111",
    email: site.email,
    image: absoluteUrl(media.heroClinic),
    hasMap: site.mapHref,
    medicalSpecialty: "Dentistry",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2530 St Joseph Blvd #6",
      addressLocality: "Orléans",
      addressRegion: "ON",
      postalCode: "K1C 1G1",
      addressCountry: "CA",
    },
    // Clock times are not published. Repeat the hours already on the site.
    hoursAvailable: site.hours.map((entry) => ({
      "@type": "OpeningHoursSpecification",
      description: `${entry.day}: ${entry.time}`,
    })),
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

const SERVICES_HUB = "/services/all-on-4-dental-implants";

/** Same list the visible breadcrumb and BreadcrumbList JSON-LD render. Home is included. */
export function routeCrumbs(page: Pick<RouteContent, "slug" | "title">): Crumb[] {
  const self = { name: page.title, path: `/${page.slug}` };
  const isService = page.slug.startsWith("services/");
  if (isService && page.slug !== SERVICES_HUB.slice(1)) {
    return [
      { name: "Home", path: "/" },
      { name: "Services", path: SERVICES_HUB },
      self,
    ];
  }
  return [
    { name: "Home", path: "/" },
    self,
  ];
}

export const HOME_FAQ_QUESTIONS = [
  "What are All-on-4 dental implants?",
  "What's the difference between All-on-4 and full arch implants?",
  "What are snap-on dentures?",
] as const;

export function buildHomeGraph(faqs: RouteFaq[]) {
  const pageUrl = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: site.name,
        description: site.description,
        inLanguage: "en-CA",
        isPartOf: { "@id": schemaIds.website },
        about: { "@id": schemaIds.practice },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      buildBreadcrumbNode(pageUrl, []),
      buildFaqNode(pageUrl, faqs),
    ].filter((node): node is JsonLdNode => node !== null),
  };
}

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

  const crumbs = routeCrumbs(page).slice(1);
  const graph = [
    webPage,
    buildBreadcrumbNode(pageUrl, crumbs),
    buildFaqNode(pageUrl, page.faqs),
  ].filter((node): node is JsonLdNode => node !== null);

  return { "@context": "https://schema.org", "@graph": graph };
}
