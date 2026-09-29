import { describe, expect, it } from "vitest";
import { getPrimaryNav, getRouteAliases } from "./nav";
import { getRouteContent } from "./routes";
import { getSiteHeaderLinks, site } from "./site";

describe("primary navigation", () => {
  it("groups the original mega-menu into five parents and a consultation CTA", () => {
    expect(getPrimaryNav().map((item) => item.label)).toEqual([
      "Services",
      "About",
      "Patients",
      "Blog",
      "Contact",
    ]);

    expect(getSiteHeaderLinks()).toEqual([
      { label: "Services", href: "/services/all-on-4-dental-implants" },
      { label: "About", href: "/meet-your-dentist" },
      { label: "Patients", href: "/what-to-expect" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact-us" },
      { label: "Free consultation", href: site.primaryCta.href },
    ]);
  });

  it("lists all eight original service pages under Services", () => {
    const services = getPrimaryNav().find((item) => item.label === "Services");
    expect(services?.children.map((child) => child.href)).toEqual([
      "/services/all-on-4-dental-implants",
      "/services/same-day-dental-implants",
      "/services/full-arch-dental-implants",
      "/services/upper-jaw-implants",
      "/services/lower-jaw-implants",
      "/services/denture-alternative",
      "/services/sedation-dentistry",
      "/services/failed-dental-work",
    ]);
  });

  it("resolves every dropdown child to a content page", () => {
    for (const item of getPrimaryNav()) {
      expect(getRouteContent(item.href.slice(1)), item.href).toBeDefined();

      for (const child of item.children) {
        expect(getRouteContent(child.href.slice(1)), child.href).toBeDefined();
      }
    }
  });

  it("lists SEO aliases instead of duplicating copy", () => {
    expect(getRouteAliases()).toEqual([
      { source: "/home", destination: "/" },
      { source: "/services", destination: "/services/all-on-4-dental-implants" },
      { source: "/about", destination: "/meet-your-dentist" },
      { source: "/easy-implant", destination: "/easy-implant-en" },
    ]);

    for (const alias of getRouteAliases()) {
      const target = alias.destination.slice(1);
      expect(target === "" || getRouteContent(target) !== undefined, alias.destination).toBe(true);
    }
  });
});
