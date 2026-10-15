import type { ClinicPage, ClinicSite } from "../types";
import type { createCatalog } from "./catalog";
import { absoluteUrl } from "./origin";
import { mediaUrl } from "./media";

type JsonLdNode = Record<string, unknown>;
type Catalog = ReturnType<typeof createCatalog>;

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function schemaTelephone(href: string) {
  const digits = href.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return href;
  return `+1-${national.slice(0, 3)}-${national.slice(3, 6)}-${national.slice(6)}`;
}

export function buildSiteGraph(site: ClinicSite) {
  const practiceId = `${site.url}/#practice`;
  const websiteId = `${site.url}/#website`;
  const personId = `${site.url}/#person-tom-szarski`;
  const graph: JsonLdNode[] = [
    {
      "@type": ["Dentist", "LocalBusiness"],
      "@id": practiceId,
      name: site.name,
      legalName: site.legalName,
      description: site.description,
      url: `${site.url}/`,
      telephone: schemaTelephone(site.phone.href),
      email: site.email,
      image: absoluteUrl(mediaUrl(site.logo)),
      logo: absoluteUrl(mediaUrl(site.logo)),
      hasMap: site.mapHref,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        addressLocality: site.address.locality,
        addressRegion: site.address.region,
        postalCode: site.address.postalCode,
        addressCountry: site.address.country,
      },
      ...(site.geo
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: site.geo.latitude,
              longitude: site.geo.longitude,
            },
          }
        : {}),
      ...(site.fax ? { faxNumber: schemaTelephone(`tel:${site.fax}`) } : {}),
      openingHoursSpecification: site.hours.map((entry) => ({
        "@type": "OpeningHoursSpecification",
        description: `${entry.day}: ${entry.time}`,
      })),
      areaServed: site.areaServed,
      availableLanguage: site.languages,
      sameAs: site.sameAs,
      ...(site.person ? { employee: { "@id": personId } } : {}),
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: `${site.url}/`,
      name: site.name,
      inLanguage: "en-CA",
      publisher: { "@id": practiceId },
    },
  ];

  if (site.person) {
    graph.push({
      "@type": "Person",
      "@id": personId,
      name: site.person.name,
      honorificSuffix: site.person.honorificSuffix,
      jobTitle: site.person.jobTitle,
      url: absoluteUrl(site.person.path),
      worksFor: { "@id": practiceId },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function pageFaqs(page: ClinicPage) {
  return page.blocks.flatMap((block) => (block.type === "faq" ? block.items : []));
}

export function buildPageGraph(site: ClinicSite, catalog: Catalog, page: ClinicPage) {
  const pageUrl = absoluteUrl(page.path);
  const faqs = pageFaqs(page);
  const crumbs = catalog.crumbs(page);
  const image = page.hero ? absoluteUrl(mediaUrl(page.hero)) : absoluteUrl(mediaUrl(site.logo));
  const practiceId = `${site.url}/#practice`;
  const websiteId = `${site.url}/#website`;

  const webPage: JsonLdNode =
    page.kind === "post"
      ? {
          "@type": "BlogPosting",
          "@id": `${pageUrl}#page`,
          url: pageUrl,
          headline: page.h1,
          name: page.title,
          description: page.description,
          image,
          datePublished: page.published || undefined,
          dateModified: page.modified || page.published || undefined,
          inLanguage: "en-CA",
          isPartOf: { "@id": websiteId },
          author: site.person ? { "@id": `${site.url}/#person-tom-szarski` } : { "@id": practiceId },
          publisher: { "@id": practiceId },
          breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
          mainEntityOfPage: pageUrl,
        }
      : {
          "@type": "WebPage",
          "@id": `${pageUrl}#page`,
          url: pageUrl,
          name: page.h1 || page.title,
          description: page.description,
          image,
          inLanguage: "en-CA",
          isPartOf: { "@id": websiteId },
          about: { "@id": practiceId },
          breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        };

  const graph: Array<JsonLdNode | null> = [
    webPage,
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    },
    faqs.length
      ? {
          "@type": "FAQPage",
          "@id": `${pageUrl}#faq`,
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }
      : null,
  ];

  return {
    "@context": "https://schema.org",
    "@graph": graph.filter((node): node is JsonLdNode => node !== null),
  };
}
