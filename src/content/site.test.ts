import { describe, expect, it } from "vitest";
import { implantAnimation, navLinks, scrollActs, site, treatments } from "./site";

describe("Renew scroll-world content", () => {
  it("builds a six-act journey with a single dominant peak", () => {
    expect(scrollActs).toHaveLength(6);

    const peak = scrollActs.filter((act) => act.peak);
    expect(peak).toHaveLength(1);
    expect(peak[0].span).toBe(Math.max(...scrollActs.map((act) => act.span)));
  });

  it("does not repeat the same motion device in adjacent acts", () => {
    for (let index = 1; index < scrollActs.length; index += 1) {
      expect(scrollActs[index].device).not.toBe(scrollActs[index - 1].device);
    }
  });

  it("uses only recovered Renew photography in the scroll acts", () => {
    for (const act of scrollActs) {
      expect(act.image).toMatch(/^\/media\/(heroes|interiors|staff|services)\//);
      expect(act.imageAlt.length).toBeGreaterThan(8);
    }
  });

  it("keeps the verified consultation, pricing, and phone destinations", () => {
    expect(site.primaryCta.href).toBe("/contact-us");
    expect(site.secondaryCta.href).toBe("/pricing");
    expect(site.phone.href).toBe("tel:613-841-6111");
    expect(site.phone.label).toBe("613-841-6111");
    expect(site.email).toBe("info@renewimplants.ca");
    expect(site.address).toBe("2530 St Joseph Blvd #6, Orléans, ON K1C 1G1");
  });

  it("keeps five navigation parents plus the consultation CTA on every page", () => {
    expect(navLinks.map((link) => link.label)).toEqual([
      "Services",
      "About",
      "Patients",
      "Blog",
      "Contact",
    ]);
    expect(site.primaryCta.label).toBe("Book your free consultation");
  });

  it("assigns the sister-site hero clip only to the arrival scene with a poster", () => {
    const animatedActs = scrollActs.filter((act) => act.video);
    expect(animatedActs.map((act) => act.id)).toEqual(["arrival"]);

    for (const act of animatedActs) {
      expect(act.image).toMatch(/^\/media\/(heroes|interiors)\//);
      expect(act.video).toMatch(/^\/media\/video\/.+\.mp4$/);
    }

    expect(scrollActs[0].mobileVideo).toBe("/media/video/renew-hero-9x16.mp4");
  });

  it("publishes the generated implant animation as silent web clips with posters", () => {
    expect(implantAnimation).toEqual({
      poster: "/media/animation/dental-implant-angled-16x9.png",
      mobilePoster: "/media/animation/dental-implant-angled-9x16.png",
      webm: "/media/animation/implant-assemble-web-16x9.webm",
      video: "/media/animation/implant-assemble-web-16x9.mp4",
      mobileWebm: "/media/animation/implant-assemble-web-9x16.webm",
      mobileVideo: "/media/animation/implant-assemble-web-9x16.mp4",
      alt: expect.stringMatching(/implant/i),
    });
  });

  it("offers four treatment cards backed by recovered service photos", () => {
    expect(treatments).toHaveLength(4);
    for (const treatment of treatments) {
      expect(treatment.image).toMatch(/^\/media\/services\//);
      expect(treatment.href).toMatch(/^\/services\//);
    }
  });

  it("animates every treatment card with silent landscape and portrait loops over its photo", () => {
    for (const treatment of treatments) {
      const { animation } = treatment;
      expect(animation.poster, treatment.title).toBe(treatment.image);
      expect(animation.webm, treatment.title).toMatch(/^\/media\/treatments\/treatment-[a-z0-9]+-web-16x9\.webm$/);
      expect(animation.video, treatment.title).toMatch(/^\/media\/treatments\/treatment-[a-z0-9]+-web-16x9\.mp4$/);
      expect(animation.mobileWebm, treatment.title).toMatch(/^\/media\/treatments\/treatment-[a-z0-9]+-web-9x16\.webm$/);
      expect(animation.mobileVideo, treatment.title).toMatch(/^\/media\/treatments\/treatment-[a-z0-9]+-web-9x16\.mp4$/);
    }
    expect(new Set(treatments.map((treatment) => treatment.animation.video)).size).toBe(treatments.length);
  });
});
