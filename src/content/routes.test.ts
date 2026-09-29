import { describe, expect, it } from "vitest";
import { isInternalPage } from "@/lib/site-pages";
import { getPrimaryNav } from "./nav";
import { getRouteContent, getRouteSlugs, type PageGrammar } from "./routes";
import { implantAnimation, site, treatments } from "./site";
import { testimonials } from "./testimonials";

const publicSlugs = [
  "contact-us",
  "pricing",
  "meet-your-dentist",
  "why-choose-us",
  "what-to-expect",
  "patient-stories",
  "before-after",
  "dental-anxiety",
  "faq",
  "service-areas",
  "services/all-on-4-dental-implants",
  "services/full-arch-dental-implants",
  "services/same-day-dental-implants",
  "services/denture-alternative",
  "services/upper-jaw-implants",
  "services/lower-jaw-implants",
  "services/sedation-dentistry",
  "services/failed-dental-work",
  "easy-implant-en",
  "for-dentists",
  "privacy-policy",
  "terms",
  "sitemap",
] as const;

const experienceSlugs = [
  "meet-your-dentist",
  "why-choose-us",
  "what-to-expect",
  "patient-stories",
  "before-after",
  "dental-anxiety",
  "services/all-on-4-dental-implants",
  "services/full-arch-dental-implants",
  "services/same-day-dental-implants",
  "services/denture-alternative",
  "services/upper-jaw-implants",
  "services/lower-jaw-implants",
  "services/sedation-dentistry",
  "services/failed-dental-work",
] as const;

const documentSlugs = [
  "contact-us",
  "pricing",
  "faq",
  "service-areas",
  "easy-implant-en",
  "for-dentists",
  "privacy-policy",
  "terms",
  "sitemap",
] as const;

describe("homepage destinations", () => {
  it("resolves every internal homepage link to a content page", () => {
    const hrefs = [
      site.primaryCta.href,
      site.secondaryCta.href,
      ...getPrimaryNav().map((item) => item.href),
      ...treatments.map((treatment) => treatment.href),
    ];

    for (const href of hrefs) {
      expect(isInternalPage(href), href).toBe(true);
    }
  });

  it("resolves every internal next-step link on every page", () => {
    for (const slug of getRouteSlugs()) {
      for (const link of getRouteContent(slug)?.links ?? []) {
        if (!link.href.startsWith("/") || link.href === "/") continue;
        expect(isInternalPage(link.href), `${slug} -> ${link.href}`).toBe(true);
      }
    }
  });
});

describe("recovered page inventory", () => {
  it("publishes every recovered public slug from sitemap.xml plus crawl extras", () => {
    expect(getRouteSlugs()).toEqual([...publicSlugs]);
  });

  it("tags each slug as an experience or a document", () => {
    const grammarBySlug = Object.fromEntries(
      getRouteSlugs().map((slug) => [slug, getRouteContent(slug)?.grammar]),
    ) as Record<string, PageGrammar | undefined>;

    for (const slug of experienceSlugs) {
      expect(grammarBySlug[slug], slug).toBe("experience");
      expect(getRouteContent(slug)?.device, slug).toBeDefined();
      expect(getRouteContent(slug)?.acts?.length, slug).toBeGreaterThanOrEqual(2);
    }

    for (const slug of documentSlugs) {
      expect(grammarBySlug[slug], slug).toBe("document");
    }
  });

  it("does not repeat a motion device on adjacent experience acts", () => {
    for (const slug of experienceSlugs) {
      const acts = getRouteContent(slug)?.acts ?? [];
      for (let index = 1; index < acts.length; index += 1) {
        expect(acts[index].device, slug).not.toBe(acts[index - 1].device);
      }
    }
  });

  it("opens every implant-placement service on the assembling implant animation", () => {
    const animatedServices = [
      "services/all-on-4-dental-implants",
      "services/full-arch-dental-implants",
      "services/same-day-dental-implants",
      "services/upper-jaw-implants",
      "services/lower-jaw-implants",
    ];

    for (const slug of animatedServices) {
      const [first] = getRouteContent(slug)?.acts ?? [];
      expect(first?.video, slug).toBe(implantAnimation.video);
      expect(first?.mobileVideo, slug).toBe(implantAnimation.mobileVideo);
      expect(first?.webm, slug).toBe(implantAnimation.webm);
    }

    for (const slug of getRouteSlugs()) {
      for (const act of getRouteContent(slug)?.acts ?? []) {
        if (!act.video) continue;
        expect(act.video, slug).toMatch(/^\/media\/(animation|video)\/.+\.mp4$/);
        expect(act.poster, slug).toMatch(/^\/media\/animation\/.+\.png$/);
      }
    }
  });

  it("only references media that the sync publishes", () => {
    for (const slug of getRouteSlugs()) {
      const page = getRouteContent(slug);
      expect(page?.image, slug).toMatch(/^\/media\/(heroes|interiors|staff|services)\//);
      for (const act of page?.acts ?? []) {
        expect(act.image, slug).toMatch(/^\/media\/(heroes|interiors|staff|services)\//);
      }
    }
  });

  it("keeps the verified NAP on the contact page", () => {
    const page = getRouteContent("contact-us");
    expect(page?.hours?.length).toBeGreaterThanOrEqual(2);
    expect(page?.mapHref).toMatch(/^https:\/\//);
    expect(page?.links.map((link) => link.href)).toContain("tel:613-841-6111");
    expect(page?.links.map((link) => link.href)).toContain("mailto:info@renewimplants.ca");
  });

  it("carries the recovered FAQ as structured questions", () => {
    const page = getRouteContent("faq");
    expect(page?.faqs?.length).toBeGreaterThanOrEqual(14);
    for (const faq of page?.faqs ?? []) {
      expect(faq.question.endsWith("?"), faq.question).toBe(true);
      expect(faq.answer.length).toBeGreaterThan(40);
    }
  });

  it("restores the before-and-after gallery as described cases, not missing photos", () => {
    const page = getRouteContent("before-after");
    expect(page?.sections.length).toBe(4);
    expect(page?.sections.map((section) => section.heading)).toEqual([
      "All-on-4 full arch restoration",
      "Full arch dental implants",
      "Snap-on denture alternative",
      "All-on-4 lower arch",
    ]);
  });

  it("uses verified Google reviews with a name and location on story pages", () => {
    expect(testimonials.length).toBeGreaterThanOrEqual(8);
    for (const quote of testimonials) {
      expect(quote.name.length).toBeGreaterThan(2);
      expect(quote.location).toBe("Ottawa, ON");
      expect(quote.quote.length).toBeGreaterThan(30);
    }

    const stories = getRouteContent("patient-stories");
    expect(stories?.quotes?.length).toBe(testimonials.length);
  });

  it("gives every service page a free-consultation next step", () => {
    for (const slug of publicSlugs.filter((value) => value.startsWith("services/"))) {
      const links = getRouteContent(slug)?.links ?? [];
      expect(links.map((link) => link.href), slug).toContain(site.primaryCta.href);
    }
  });
});
