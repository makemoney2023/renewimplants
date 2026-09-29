import type { RouteContent, RouteFaq } from "@/content/routes";
import { site } from "@/content/site";

const practiceId = `${site.url}/#practice`;
const websiteId = `${site.url}/#website`;

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dentist",
        "@id": practiceId,
        name: site.name,
        alternateName: site.shortName,
        url: `${site.url}/`,
        telephone: "+1-613-841-6111",
        email: site.email,
        image: `${site.url}/media/heroes/renew-hero.jpg`,
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
        founder: {
          "@type": "Person",
          name: "Tom Szarski",
          honorificSuffix: "DD",
          jobTitle: "Denturist",
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: `${site.url}/`,
        name: site.name,
        publisher: { "@id": practiceId },
      },
    ],
  };
}

export function getFaqSchema(faqs: RouteFaq[] | undefined) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getWebPageSchema(page: RouteContent) {
  const url = `${site.url}/${page.slug}`;
  const isPost = page.slug.startsWith("blog/");

  return {
    "@context": "https://schema.org",
    "@type": isPost ? "BlogPosting" : "WebPage",
    "@id": `${url}#page`,
    url,
    headline: page.title,
    description: page.intro,
    image: `${site.url}${page.image}`,
    isPartOf: { "@id": websiteId },
    ...(isPost
      ? {
          author: { "@type": "Person", name: "Tom Szarski" },
          publisher: { "@id": practiceId },
        }
      : { about: { "@id": practiceId } }),
  };
}
