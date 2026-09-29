import { describe, expect, it } from "vitest";
import { getPrimaryNav, getRouteAliases } from "./nav";
import { isInternalPage } from "@/lib/site-pages";
import { getRouteContent } from "./routes";
import { navLinks } from "./site";

describe("primary navigation", () => {
  it("groups the original mega-menu into five parents driven by the site nav links", () => {
    expect(getPrimaryNav().map(({ label, href }) => ({ label, href }))).toEqual([
      { label: "Services", href: "/services/all-on-4-dental-implants" },
      { label: "About", href: "/meet-your-dentist" },
      { label: "Patients", href: "/what-to-expect" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact-us" },
    ]);

    // nav.ts must build its parents from site.ts so there is one source of truth.
    expect(getPrimaryNav().map(({ label, href }) => ({ label, href }))).toEqual([...navLinks]);
    for (const item of getPrimaryNav()) {
      expect(item.children.length, item.label).toBeGreaterThan(0);
    }
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
      expect(isInternalPage(item.href), item.href).toBe(true);

      for (const child of item.children) {
        expect(isInternalPage(child.href), child.href).toBe(true);
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
